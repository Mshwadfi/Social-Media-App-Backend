const {
  getConnectionDegreeBetweenUsers,
} = require("../../utils/connectionDegrees");
const { calculatePostScore } = require("../../utils/getPostScore");
const {
  MAX_CONNECTION_DEGREE,
  POPULAR_THRESHOLD,
} = require("../config/constants");
const { asyncHandler, AppError } = require("../middlewares/errorHandler");
const Post = require("../models/post");
const User = require("../models/user");

exports.getFeed = asyncHandler(async (req, res, next) => {
  const currentUser = req.user;
  if (!currentUser?._id) return next(new AppError("Unauthorized", 401));

  let limit = parseInt(req.query.limit, 10) || 10;
  if (limit > 25) limit = 25;

  const cursor = req.query.cursor || null;

  const query = {};
  if (cursor) {
    const cursorPost = await Post.findById(cursor)
      .select("score createdAt")
      .lean();
    if (cursorPost) {
      query.createdAt = { $lt: cursorPost.createdAt };
    }
  }

  // fetch suffecient amount of posts and process it
  const fetchLimit = limit * 5;

  const recentPosts = await Post.find(query)
    .sort({ createdAt: -1 })
    .limit(fetchLimit)
    .select("userId likes createdAt content impressions")
    .lean();

  if (recentPosts.length === 0) {
    return res.status(200).send({
      message: "Feed fetched successfully",
      data: [],
      nextCursor: null,
    });
  }

  // get unique users so we loop over them to return posts with connection degree
  // this enhances the performance as (single user my have many posts) and we process them in a single step
  // doing this run on O(Pots + Users * N^2) => n^2 is the time complexity for the getConnectionDegreeBetweenUsers
  // so doing this between userId from unique users & logged in userId is way faster than doing same between
  // logged in userId and post.userId

  const uniqueUserIds = [
    ...new Set(recentPosts.map((p) => p.userId.toString())),
  ];

  // Calculate connection degrees for unique users only
  const userConnectionMap = new Map();

  await Promise.all(
    uniqueUserIds.map(async (userId) => {
      // Check cache first

      const degree = await getConnectionDegreeBetweenUsers(
        currentUser._id,
        userId,
        MAX_CONNECTION_DEGREE
      );

      userConnectionMap.set(userId, degree);

      // Cache the result
    })
  );

  const feed = recentPosts
    .map((post) => {
      const degree = userConnectionMap.get(post.userId.toString());

      let finalDegree = degree;
      let isPopular = false;

      if (degree === null) {
        const likesCount = post.likes?.length || 0;
        if (likesCount >= POPULAR_THRESHOLD) {
          finalDegree = 4;
          isPopular = true;
        } else {
          return null; // make it null so we filter it out later
        }
      }

      return {
        ...post,
        connectionDegree: finalDegree,
        score: calculatePostScore(post, finalDegree),
        isPopular,
        impressions: post.impressions || 0,
      };
    })
    .filter((post) => post !== null)
    .sort((a, b) => b.score - a.score)
    .slice(0, limit);

  // batch update impressions
  if (feed.length > 0) {
    const postIds = feed.map((post) => post._id);

    await Post.updateMany(
      { _id: { $in: postIds } },
      { $inc: { impressions: 1 } }
    );

    feed.forEach((post) => {
      post.impressions += 1;
    });
  }

  const nextCursor =
    feed.length > 0 ? feed[feed.length - 1]._id.toString() : null;

  return res.status(200).send({
    message: "Feed fetched successfully",
    data: feed,
    nextCursor,
  });
});
