const {
  getUserConnections,
  getConnectionsDegree,
} = require("../../utils/connectionDegrees");
const { calculatePostScore } = require("../../utils/getPostScore");
const Post = require("../models/post");

exports.getFeed = async (req, res) => {
  try {
    const currentUser = req.user;
    let feed = [];

    const connectionDegrees = await getConnectionsDegree(currentUser._id);
    const allConnectedUserIds = new Set();

    // Get posts from 1st to 3rd degree connections
    for (const [degree, userIds] of Object.entries(connectionDegrees)) {
      if (!Array.isArray(userIds) || userIds.length === 0) continue;

      const numericDegree = parseInt(degree);
      if (numericDegree > 3) continue;

      userIds.forEach((id) => allConnectedUserIds.add(id.toString()));

      const posts = await Post.find({ userId: { $in: userIds } }).lean();
      const postsWithDegree = posts.map((post) => {
        Post.updateOne({ _id: post._id }, { $inc: { impressions: 1 } }).exec();

        return {
          ...post,
          connectionDegree: numericDegree,
          score: calculatePostScore(post, numericDegree),
          impressions: post.impressions + 1, // todo: handle duplicate impressions => may be by creating a collection for impressions with userID
        };
      });
      feed = [...feed, ...postsWithDegree];
    }

    // Get popular posts from non-connections (not in 1st–3rd degree)
    const popularPosts = await Post.find({
      userId: { $nin: Array.from(allConnectedUserIds) },
      $expr: { $gte: [{ $size: "$likes" }, 2000] },
    }).lean();

    const popularPostsWithDegree = popularPosts.map((post) => {
      Post.updateOne({ _id: post._id }, { $inc: { impressions: 1 } }).exec();
      return {
        ...post,
        connectionDegree: 4,
        score: calculatePostScore(post, 4),
        isPopular: true,
        impressions: impressions + 1,
      };
    });
    feed = [...feed, ...popularPostsWithDegree];

    // Final sort by score
    feed.sort((a, b) => b.score - a.score);

    return res.status(200).send({
      message: "Feed fetched successfully",
      data: feed,
    });
  } catch (error) {
    console.error("Feed error:", error);
    res.status(500).send({ error: error.message });
  }
};
