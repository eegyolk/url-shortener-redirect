require("dotenv").config();

const express = require("express"),
  app = express(),
  compression = require("compression");
const { Model } = require("objection");

// Set database connection
Model.knex(
  require("knex")({
    client: "mysql",
    connection: {
      host: process.env.DB_HOST,
      port: process.env.DB_PORT,
      database: process.env.DB_DATABASE,
      user: process.env.DB_USERNAME,
      password: process.env.DB_PASSWORD,
      connectionTimeout: 30000,
    },
    pool: {
      min: 0,
      max: 10,
      acquireTimeoutMillis: 15000,
      createTimeoutMillis: 15000,
      destroyTimeoutMillis: 5000,
      idleTimeoutMillis: 15000,
      reapIntervalMillis: 1000,
      createRetryIntervalMillis: 100,
      propagateCreateError: false,
    },
    acquireConnectionTimeout: 15000,
    afterCreate: function (conn, done) {
      conn.query('SET timezone="UTC";', function (err) {
        if (err) {
          done(err, conn);
        } else {
          conn.query("SELECT set_limit(0.01);", function (err) {
            done(err, conn);
          });
        }
      });
    },
  })
);

app.use(compression({ threshold: 0 }));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.listen(process.env.APP_PORT, async () => {
  console.log(
    `Server listening at port ${process.env.APP_PORT} with process id ${process.pid}`
  );
});

process.on("uncaughtException", (err, origin) => {
  console.error({ err, msg: "uncaught-exception" });

  setTimeout(() => {
    process.exit(1);
  }, 1000);
});

process.on("uncaughtExceptionMonitor", (err, origin) => {
  console.error({ err, msg: "uncaught-exception-monitor" });
});

process.on("unhandledRejection", (reason, promise) => {
  console.error({ err: reason, msg: "unhandled-rejection" });

  setTimeout(() => {
    process.exit(1);
  }, 1000);
});
