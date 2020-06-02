process.on('SIGTERM', () => {
  console.log('SIGTERM signal received');
});

process.on('SIGINT', () => {
  console.log('SIGINT signal received');
  process.exit(1);
});

(async function() {
  const express = require('express');
  const pg = require('pg');
  const app = express();
  app.use(express.json())

  const pool = new pg.Pool({connectionString: process.env.DB_CONNECTION_URI});
  await pool.query('CREATE TABLE IF NOT EXISTS "training-requests" (id SERIAL PRIMARY KEY, name varchar(20))');

  app.get('/', async function (req, res) {
    const result = await pool.query('SELECT * FROM "training-requests"');
    setTimeout(() => {
      res.send(`Request count: ${result.rows.map(JSON.stringify)}`);

    }, 500);
  })

  app.post('/', async (request, response) => {
    const result = pool.query('INSERT INTO "training-requests" (name) values ($1)', [request.body.name]);
    response.sendStatus(201);
  })

  app.listen(process.env.SERVER_PORT);
}());
