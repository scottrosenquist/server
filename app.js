const express = require('express')
const pg = require('pg')
const rateLimiter = require('./rate-limiter.js')
const cors = require('cors')

const app = express()
// configs come from standard PostgreSQL env vars
// https://www.postgresql.org/docs/9.6/static/libpq-envars.html
const pool = new pg.Pool()

const queryHandler = (req, res, next) => {
  if (!res.finished) {
      pool.query(req.sqlQuery).then((r) => {
        if ( r.rows[0].data ) {
          r.rows.forEach((row, index, array) => {
            array[index] = {...row, ...row.data}
            delete array[index].data
          })
        }
        return res.json(r.rows || [])
      }).catch(next)
  }
}

app.use(cors());

app.use(rateLimiter)


app.get('/events/monthly', (req, res, next) => {
  req.sqlQuery = `
    SELECT date_trunc('month', date) AS date,
           sum(events) AS events,
           poi.poi_id,
           name AS poi_name
    FROM hourly_events,
         poi
    WHERE hourly_events.poi_id = poi.poi_id
    GROUP BY date_trunc('month', date),
             poi.poi_id
    ORDER BY date_trunc('month', date),
             poi.poi_id
  `
  return next()
}, queryHandler)

app.get('/events/daily', (req, res, next) => {
  req.sqlQuery = `
    SELECT date,
           sum(events) AS events,
           poi.poi_id,
           name AS poi_name
    FROM hourly_events,
         poi
    WHERE hourly_events.poi_id = poi.poi_id
    GROUP BY date,
             poi.poi_id
    ORDER BY date,
             poi.poi_id
  `
  return next()
}, queryHandler)

app.get('/events/hourly', (req, res, next) => {
  req.sqlQuery = `
    SELECT date + interval '1 hour' * hour AS date,
           events,
           poi.poi_id,
           name AS poi_name
    FROM hourly_events,
         poi
    WHERE hourly_events.poi_id = poi.poi_id
    ORDER BY date,
             poi.poi_id
  `
  return next()
}, queryHandler)

app.get('/', (req, res, next) => {
  req.sqlQuery = `
  `
  return next()
}, queryHandler)

app.get('/', (req, res, next) => {
  req.sqlQuery = `
  `
  return next()
}, queryHandler)

app.get('/', (req, res, next) => {
  req.sqlQuery = `
  `
  return next()
}, queryHandler)

app.get('/', (req, res, next) => {
  req.sqlQuery = `
  `
  return next()
}, queryHandler)

app.get('/', (req, res, next) => {
  req.sqlQuery = `
  `
  return next()
}, queryHandler)

//app.get('/events/monthly', (req, res, next) => {
//  req.sqlQuery = `
//    SELECT TO_CHAR(DATE_TRUNC('month', date),'Mon') AS month,
//           SUM(events) AS events, name
//    FROM public.hourly_events, public.poi
//    WHERE public.hourly_events.poi_id = public.poi.poi_id
//    GROUP BY poi.name, month, hourly_events.date
//    ORDER BY date, poi.name
//    LIMIT 168;
//  `
//  return next()
//}, queryHandler)
//
//app.get('/events/week', (req, res, next) => {
//  req.sqlQuery = `
//    SELECT date, json_object_agg(name, events) AS data
//    FROM (
//      SELECT date, name,sum(events) AS events
//      FROM public.hourly_events, public.poi
//      WHERE public.hourly_events.poi_id = public.poi.poi_id
//      GROUP BY date, poi.name
//      ORDER BY date
//      LIMIT 168
//    ) AS derivedTable
//    GROUP BY derivedTable.date
//    LIMIT 7
//  `
//  return next()
//}, queryHandler)
//
//app.get('/events/poi', (req, res, next) => {
//  req.sqlQuery = `
//    SELECT date, hour, events, name
//    FROM public.hourly_events, public.poi
//    WHERE public.hourly_events.poi_id = public.poi.poi_id
//    ORDER BY date, hour
//    LIMIT 168;
//  `
//  return next()
//}, queryHandler)
//
//app.get('/events/hourly', (req, res, next) => {
//  req.sqlQuery = `
//    SELECT date, hour, events
//    FROM public.hourly_events
//    ORDER BY date, hour
//    LIMIT 168;
//  `
//  return next()
//}, queryHandler)
//
//app.get('/events/daily', (req, res, next) => {
//  req.sqlQuery = `
//    SELECT date, SUM(events) AS events
//    FROM public.hourly_events
//    GROUP BY date
//    ORDER BY date
//    LIMIT 7;
//  `
//  return next()
//}, queryHandler)
//
//app.get('/stats/hourlypoi', (req, res, next) => {
//  req.sqlQuery = `
//    SELECT date + interval '1 hour' * hour AS date, name, impressions, clicks, revenue
//    FROM public.hourly_stats, public.poi
//    WHERE public.hourly_stats.poi_id = public.poi.poi_id
//    ORDER BY date, hour
//    LIMIT 168;
//  `
//  return next()
//}, queryHandler)
//
//app.get('/stats/hourly', (req, res, next) => {
//  req.sqlQuery = `
//    SELECT date, hour, impressions, clicks, revenue
//    FROM public.hourly_stats
//    ORDER BY date, hour
//    LIMIT 168;
//  `
//  return next()
//}, queryHandler)
//
//app.get('/stats/daily', (req, res, next) => {
//  req.sqlQuery = `
//    SELECT date,
//        SUM(impressions) AS impressions,
//        SUM(clicks) AS clicks,
//        SUM(revenue) AS revenue
//    FROM public.hourly_stats
//    GROUP BY date
//    ORDER BY date
//    LIMIT 7;
//  `
//  return next()
//}, queryHandler)
//
//app.get('/poi', (req, res, next) => {
//  req.sqlQuery = `
//    SELECT *
//    FROM public.poi;
//  `
//  return next()
//}, queryHandler)

app.listen(process.env.PORT || 5555, (err) => {
  if (err) {
    console.error(err)
    process.exit(1)
  } else {
    console.log(`Running on ${process.env.PORT || 5555}`)
  }
})

// last resorts
process.on('uncaughtException', (err) => {
  console.log(`Caught exception: ${err}`)
  process.exit(1)
})
process.on('unhandledRejection', (reason, p) => {
  console.log('Unhandled Rejection at: Promise', p, 'reason:', reason)
  process.exit(1)
})

module.exports = app
