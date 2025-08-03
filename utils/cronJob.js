const cron = require("node-cron");
const Post = require("../src/models/post");
const User = require("../src/models/user");
const sendEmail = require("./sendEmail");

cron.schedule("0 10 * * 0", async () => {
  try {
    const oneWeekAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);

    const posts = await Post.find({ createdAt: { $gte: oneWeekAgo } }).lean();

    const userStats = {};

    // gather statistics
    for (const post of posts) {
      const { userId, impressions = 0, likes = [] } = post;

      if (!userStats[userId]) {
        userStats[userId] = {
          impressions: 0,
          likeCount: 0,
          postCount: 0,
        };
      }

      userStats[userId].likeCount += likes.length;
      userStats[userId].impressions += impressions;
      userStats[userId].postCount += 1;
    }

    // send emails
    for (const userId in userStats) {
      const user = await User.findById(userId).lean();
      if (!user?.email) continue;
      console.log("email: ", user.email);

      const stats = userStats[userId];
      const message = `
        Hi ${user.name || "there"}, 👋

        Here’s your weekly engagement summary:

        • Posts: ${stats.postCount}
        • Total Likes: ${stats.likeCount}
        • Total Impressions: ${stats.impressions}

        Keep sharing great content!
        `;

      await sendEmail({
        to: user.email,
        subject: "📊 Your Weekly Engagement Report",
        text: message,
      });
    }

    console.log("✅ Weekly engagement reports sent");
  } catch (err) {
    console.error("❌ Cron job failed:", err);
  }
});
