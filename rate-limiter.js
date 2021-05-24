const Redis = require("ioredis")

console.log('process.env.REDIS_URL: ' + process.env.REDIS_URL )

const redis = new Redis(process.env.REDIS_URL)

const rateLimiter = (req, res, next) => {
  try {
    if (!redis) {
      throw new Error("Redis client not found")
      process.exit(1)
    }
    var id = req.ip
    console.log(id)
    redis.get(id, (err, record) => {
      if (err) throw err
      console.log(record)

      if (record == null || record < 5) {
        redis
          .multi()
          .incr(id)
          .expire(id, 5)
          .exec()
      } else {
        res.status(429).json({ error: "Too many requests sent" })
      }
      next()
    })
  } catch (error) {
    next(error)
  }
}

module.exports = rateLimiter
