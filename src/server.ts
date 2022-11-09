import * as express from "express";
import { json } from "body-parser";

import { createWeatherRecord, deleteWeatherRecord, getWeatherRecord, updateWeatherRecord } from "./weather-record";


// Constants
const PORT = 8000;
const HOST = '0.0.0.0';

// App handlers
const app = express();
const parser = json();

app.get("/", (req:any, res:any) => {
  res.status(200).send("hello world!");
});

app.get("/ping", (req:any, res:any) => {
  res.status(200).send("pong");
});

app.get("/healthy", (req:any, res:any) => {
  res.status(200).send("healthy");
});

app.get("/env-var", (req:any, res:any) => {
  res.status(200).send(process.env.TEST_ENV_VAR);
});

app.get('/weather-record/:id', parser, getWeatherRecord)
app.get('/weather-record', parser, getWeatherRecord)
app.post('/weather-record', parser, createWeatherRecord)
app.put('/weather-record/:id', parser, updateWeatherRecord)
app.delete('/weather-record/:id', parser, deleteWeatherRecord)

app.listen(PORT, HOST);
console.log(`Running on http://${HOST}:${PORT}`);
