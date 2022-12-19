import * as express from "express";

import * as cors from "cors";

import { connectToDatabase } from "./config/mongodb";
import { ordersRouter } from "./routes/orders.router";

// Constants
const PORT = 8000;
const HOST = "0.0.0.0";

// App handlers
const app = express();

app.use(
  cors({
    origin: "*",
  })
);

app.get("/", (req: any, res: any) => {
  res.status(200).send("Welcome to Car Order Service API");
});

app.use("/doc", express.static("doc"));

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
