const {
  getUserConnections,
  getConnectionsDegree,
} = require("../../utils/connectionDegrees");
const Post = require("../models/post");

exports.getFeed = async (req, res) => {
  try {
    const currentUser = req.user;
    let feed = [];
    const connectionDegrees = await getConnectionsDegree(currentUser._id);
    for (const [degree, userIds] of Object.entries(connectionDegrees)) {
      if (!Array.isArray(userIds) || userIds.length === 0) continue;
      const posts = await Post.find({ userId: { $in: userIds } }).lean();
      const postsWithDegree = posts?.map((post) => ({
        ...post,
        connectionDegree: parseInt(degree),
      }));
      feed = [...feed, ...postsWithDegree];
    }
    return res.status(200).send({
      message: "Feed fetched successfully",
      data: feed,
    });
  } catch (error) {
    res.status(500).send(error.message);
  }
};
