import * as express from "express";
import { json } from "body-parser";

import * as cors from 'cors';

import { connectToDatabase } from "./config/mongodb"
import { ordersRouter } from "./routes/orders.router";

import { createWeatherRecord, deleteWeatherRecord, getWeatherRecord, updateWeatherRecord } from "./routes/weather-record";

// Constants
const PORT = 8000;
const HOST = '0.0.0.0';

// App handlers
const app = express();
const parser = json();

app.use(cors({
  origin: '*'
}));

app.get("/", (req: any, res: any) => {
  res.status(200).send("Welcome to Car Order Service API");
});

app.use('/doc', express.static('doc'))

app.get("/ping", (req: any, res: any) => {
  res.status(200).send("pong");
});

app.get("/healthy", (req: any, res: any) => {
  res.status(200).send("healthy");
});

app.get("/env-var", (req: any, res: any) => {
  res.status(200).send(process.env.TEST_ENV_VAR);
});

//app.get('/weather-record/:id', parser, getWeatherRecord)
//app.get('/weather-record', parser, getWeatherRecord)
//app.post('/weather-record', parser, createWeatherRecord)
//app.put('/weather-record/:id', parser, updateWeatherRecord)
//app.delete('/weather-record/:id', parser, deleteWeatherRecord)

connectToDatabase()
  .then(() => {
    app.use("/orders", ordersRouter);
  })
  .catch((error: Error) => {
    console.error("Database connection failed", error);
    process.exit();
  });

app.listen(PORT, HOST);
console.log(`Running on http://${HOST}:${PORT}`);
