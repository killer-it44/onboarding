const {DB_CONNECTION_URI, SERVER_PORT} = process.env;
if(DB_CONNECTION_URI === undefined || SERVER_PORT === undefined) {
    console.error('Necessary environment variables were not set!');
    process.exit(1);
}

(async function () {
    const express = require('express');
    const pg = require('pg');
    const QueryStream = require('pg-query-stream');
    const JSONStream = require('JSONStream');
    const app = express();
    app.use(express.json());

    const pool = new pg.Pool({ connectionString: DB_CONNECTION_URI });
    await pool.query('CREATE TABLE IF NOT EXISTS "training-requests" (id SERIAL PRIMARY KEY, name varchar(20))');

    app.get('/', async function (req, res) {
        pool.connect((err, client, release) => {
            if (err) {
              return console.error('Error acquiring client', err.stack)
            }
            // const query = new QueryStream('SELECT * FROM generate_series(0, $1) num', [1000000]);
            const query = new QueryStream('SELECT * FROM "training-requests"');
            const stream = client.query(query);
            stream.on('end', release);
            stream.pipe(JSONStream.stringify()).pipe(res);
        });
    });

    app.post('/', async (request, response) => {
        await pool.query('INSERT INTO "training-requests" (name) values ($1)', [request.body.name]);
        response.sendStatus(201);
    });

    const server = app.listen(SERVER_PORT, () => {
        console.log(`Server started on port ${SERVER_PORT}`);
    });

    server.on('connection', function (socket) {
        console.log("A new connection was made by a client.");
        socket.setTimeout(5 * 1000);
    });

    process.on('SIGTERM', async () => {
        console.log('SIGTERM signal received');
        await pool.end();
        console.log('Pool ended');
        server.close(() => {
            console.log('Server shut down');
        });
    });
}());
