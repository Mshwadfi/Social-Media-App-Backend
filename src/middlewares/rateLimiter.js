const { RateLimiterRedis } = require("rate-limiter-flexible");
const redisClient = require("../config/redis");

const strictLimiter = new RateLimiterRedis({
  storeClient: redisClient,
  points: 10,
  duration: 15 * 60,
});

const moderateLimiter = new RateLimiterRedis({
  storeClient: redisClient,
  points: 100,
  duration: 15 * 60,
});

const rateLimiterMiddleware = (limiter) => {
  return async (req, res, next) => {
    try {
      await limiter.consume(req.ip);
      next();
    } catch (err) {
      res.status(429).json({ message: "Too Many Requests" });
    }
  };
};

module.exports = {
  strictLimiter,
  moderateLimiter,
  rateLimiterMiddleware,
};
