const { getConnectionsDegree } = require("../../utils/connectionDegrees");
const { calculatePostScore } = require("../../utils/getPostScore");
const { MAX_CONNECTION_DEGREE } = require("../config/constants");
const { asyncHandler, AppError } = require("../middlewares/errorHandler");
const Post = require("../models/post");

exports.getFeed = asyncHandler(async (req, res, next) => {
  const currentUser = req.user;
  if (!currentUser?._id) return next(new AppError("Unauthorized", 401));

  let limit = parseInt(req.query.limit, 10) || 10;
  if (limit > 25) limit = 25;

  const cursor = req.query.cursor || null;

  let feed = [];

  const connectionDegrees = await getConnectionsDegree(
    currentUser._id,
    MAX_CONNECTION_DEGREE
  );
  const allConnectedUserIds = new Set();

  // Get posts from connections
  for (const [degree, userIds] of Object.entries(connectionDegrees)) {
    if (!Array.isArray(userIds) || userIds.length === 0) continue;

    const numericDegree = parseInt(degree, 10);
    if (numericDegree > MAX_CONNECTION_DEGREE) continue;

    userIds.forEach((id) => allConnectedUserIds.add(id.toString()));

    const posts = await Post.find({ userId: { $in: userIds } }).lean();
    const postsWithDegree = posts.map((post) => ({
      ...post,
      connectionDegree: numericDegree,
      score: calculatePostScore(post, numericDegree),
      impressions: post.impressions || 0,
    }));
    feed.push(...postsWithDegree);
  }

  // Get popular posts from non-connections
  const popularPosts = await Post.find({
    userId: { $nin: Array.from(allConnectedUserIds) },
    $expr: { $gte: [{ $size: "$likes" }, 2000] },
  }).lean();

  feed.push(
    ...popularPosts.map((post) => ({
      ...post,
      connectionDegree: 4,
      score: calculatePostScore(post, 4),
      isPopular: true,
      impressions: post.impressions || 0,
    }))
  );

  // Sort
  feed.sort((a, b) => b.score - a.score);

  // Cursor pagination
  let cursorIndex = 0;
  if (cursor) {
    cursorIndex = feed.findIndex((post) => post._id.toString() === cursor);
    if (cursorIndex === -1) cursorIndex = 0;
    else cursorIndex += 1;
  }

  const paginatedFeed = feed.slice(cursorIndex, cursorIndex + limit);

  // Update impressions only for returned posts
  for (const post of paginatedFeed) {
    await Post.updateOne(
      { _id: post._id },
      { $inc: { impressions: 1 } }
    ).exec();
    post.impressions += 1;
  }

  const nextCursor =
    paginatedFeed.length > 0
      ? paginatedFeed[paginatedFeed.length - 1]._id.toString()
      : null;

  return res.status(200).send({
    message: "Feed fetched successfully",
    data: paginatedFeed,
    nextCursor,
  });
});
