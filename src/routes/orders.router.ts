import { getSettings, getUrl } from "../rabbit/Settings";
// External Dependencies
import { Request, Response } from "express";
import { ObjectId, ReturnDocument } from "mongodb";
import { collections } from "../config/mongodb";

import axios from "axios";

const express = require("express");

import logger = require("../logger/logger");
import { addTracker } from "../tracker/Tracker";

var resp = [] as any;

const s = getSettings();

async function validate(data: any) {
  try {
    return axios.post(`${s.hostname}/api/validate`, data, { timeout: 10 })
    .then((response) => {
      return response.data;
    })
    .catch(error => {
      console.log(error.message)
    });
  } catch (error) {
    console.log(error);
    return Promise.reject(error);
  } finally {
  }
}

// Global Config
export const ordersRouter = express.Router();

ordersRouter.use(express.json());

/**
 * @api {post} orders Get all orders
 * @apiName GetOrders
 * @apiGroup Order
 *
 * @apiBody {String} token
 *
 * @apiSuccess {String} orders Array of Orders
 */
// GET
ordersRouter.post("/", async (req: Request, res: Response) => {
  try {
    const endpoint = {
      endpoint: "/orders",
      method: "POST",
      name: "GetOrders",
      timestamp: new Date(),
    };
    await addTracker(endpoint);
    logger.info("Getting all orders");
    s.url = getUrl("orders");
    const token = req?.body?.token;
    if (!token) {
      s.type = "ERROR";
      s.msg = "No token in request body";
      logger.error("Please add token to request body!");
      res.status(400);
      res.json({ message: "Please add token to request body!" });
    } else {
      const getValidation = async () => {
        const result = await validate({ token: token });
        console.log(result)
        if (result != undefined) {
          if (result.error || result.message == "Token is invalid") {
            s.type = "ERROR";
            s.msg = "Token is invalid!";
            logger.error("Token is invalid!");
            res.status(500).send("Token is invalid!");
          } else {
            s.type = "INFO";
            s.msg = "Successfully retrieved data!";
            logger.info("Successfully retrieved data!");
            const orders = (await collections.orders.find({}).toArray()) as any;
            res.status(200).send(orders);
          }
        }
        else {
          res.status(500).send({error: 'Account Service Validation API not responding'})
        }
      };
      getValidation();
    }
  } catch (error) {
    s.type = "ERROR";
    s.msg = "Error " + error.message;
    logger.error("Error " + error.message);
    res.status(500).send(error.message);
  }

  s.rbmq.produce(s.type, s.url, s.name, s.msg).then(() => {
    console.log("Producing...");
  });
});

/**
 * @api {get} orders/:id/ Get order by id
 * @apiName GetOrdersById
 * @apiGroup Order
 *
 * @apiParam {String} id Order uniqueID
 *
 * @apiSuccess {String} orders Order by id
 */
ordersRouter.get("/:id", async (req: Request, res: Response) => {
  const endpoint = {
    endpoint: "/orders/id/",
    method: "GET",
    name: "GetOrdersById",
    timestamp: new Date(),
  };
  await addTracker(endpoint);
  const id = req?.params?.id;
  logger.info("Getting order by id");
  s.url = getUrl(`order/${id}`);
  try {
    const query = { _id: new ObjectId(id) };
    const order = (await collections.orders.findOne(query)) as any;

    if (order) {
      s.type = "INFO";
      s.msg = "Successfully retrieved data!";
      logger.info("Successfully retrieved data!");
      res.status(200).send(order);
    } else {
      s.type = "ERROR";
      s.msg = "Unable to find order with proper id";
      logger.error("Unable to find order with proper id");
      res.status(404).send(`Unable to find order with id: ${req.params.id}`);
    }
  } catch (error) {
    s.type = "ERROR";
    s.msg = "Unable to find order with proper id";
    logger.error("Unable to find order with proper id");
    res
      .status(404)
      .send(`Unable to find matching document with id: ${req.params.id}`);
  }

  s.rbmq.produce(s.type, s.url, s.name, s.msg).then(() => {
    console.log("Producing...");
  });
});

/**
 * @api {get} orders/:from/:to Get order by date
 * @apiName GetOrdersWithDate
 * @apiGroup Order
 *
 * @apiParam {String} from fromDate
 * @apiParam {String} to toDate
 *
 * @apiSuccess {String} orders Array of orders
 */
ordersRouter.get("/:from/:to", async (req: Request, res: Response) => {
  const endpoint = {
    endpoint: "/orders/from/to",
    method: "GET",
    name: "GetOrdersWithDate",
    timestamp: new Date(),
  };
  await addTracker(endpoint);
  logger.info("Getting order from to date");

  const from = req?.params?.from;
  const to = req?.params?.to;

  s.url = getUrl(`order/${from}/${to}`);
  try {
    const query = {
      from: new Date(from),
      to: new Date(to),
    };
    const orders = (await collections.orders.find(query).toArray()) as any;
    s.type = "INFO";
    s.msg = "Successfully retrieved data!";
    logger.info("Successfully retrieved data!");
    res.status(200).send(orders);
  } catch (error) {
    s.type = "ERROR";
    s.msg = "Error while getting orders from specific interval";
    logger.error("Error while getting orders from specific interval");
    res.status(500).send(error.message);
  }

  s.rbmq.produce(s.type, s.url, s.name, s.msg).then(() => {
    console.log("Producing...");
  });

  res.end();
});

/**
 * @api {get} orders/custom/from/:to Get order with custom
 * @apiName GetOrdersWithCustomDate
 * @apiGroup Order
 *
 * @apiParam {String} to toDate
 *
 * @apiSuccess {String} orders Array of orders
 */
ordersRouter.get("/custom/from/:from", async (req: Request, res: Response) => {
  const endpoint = {
    endpoint: "/orders/custom/from",
    method: "GET",
    name: "GetOrdersWithCustomDate",
    timestamp: new Date(),
  };
  await addTracker(endpoint);
  const from = req?.params?.from;
  try {
    const query = {
      from: {
        $gte: new Date(from),
      },
    };
    const orders = (await collections.orders.find(query).toArray()) as any;

    res.status(200).send(orders);
  } catch (error) {
    res.status(500).send(error.message);
  }
});

/**
 * @api {post} orders/ add order
 * @apiName PostOrder
 * @apiGroup Order
 *
 * @apiBody {String} title
 * @apiBody {String} product
 * @apiBody {String} userId
 *
 * @apiSuccess {String} orders body successfully added
 */
// POST
ordersRouter.post("/", async (req: Request, res: Response) => {
  const endpoint = {
    endpoint: "/orders/",
    method: "POST",
    name: "PostOrder",
    timestamp: new Date(),
  };
  await addTracker(endpoint);
  try {
    const newOrder = req.body as any;
    console.log(newOrder);
    const result = await collections.orders.insertOne(newOrder);

    result
      ? res
          .status(201)
          .send(`Successfully created a new order with id ${result.insertedId}`)
      : res.status(500).send("Failed to create a new order.");
  } catch (error) {
    console.error(error);
    res.status(400).send(error.message);
  }
});

/**
 * @api {put} orders/:id update order by id
 * @apiName UpdateOrder
 * @apiGroup Order
 *
 * @apiParam {String} id Order id
 *
 * @apiBody {String} title
 * @apiBody {String} productId
 *
 * @apiSuccess {String} orders body successfully updated
 */
// PUT
ordersRouter.put("/:id", async (req: Request, res: Response) => {
  const endpoint = {
    endpoint: "/orders/id/",
    method: "PUT",
    name: "UpdateOrder",
    timestamp: new Date(),
  };
  await addTracker(endpoint);
  const id = req?.params?.id;

  try {
    const updatedOrder: any = req.body as any;
    const query = { _id: new ObjectId(id) };

    const result = await collections.orders.updateOne(query, {
      $set: updatedOrder,
    });

    result
      ? res.status(200).send(`Successfully updated order with id ${id}`)
      : res.status(304).send(`Order with id: ${id} not updated`);
  } catch (error) {
    console.error(error.message);
    res.status(400).send(error.message);
  }
});

/**
 * @api {delete} orders/:id delete order by id
 * @apiName DeleteOrder
 * @apiGroup Order
 *
 * @apiParam {String} id Order id
 *
 * @apiSuccess {String} orders body successfully deleted
 */
// DELETE
ordersRouter.delete("/:id", async (req: Request, res: Response) => {
  const endpoint = {
    endpoint: "/orders/id/",
    method: "DELETE",
    name: "DeleteOrder",
    timestamp: new Date(),
  };
  await addTracker(endpoint);
  const id = req?.params?.id;

  try {
    const query = { _id: new ObjectId(id) };
    const result = await collections.orders.deleteOne(query);

    if (result && result.deletedCount) {
      res.status(202).send(`Successfully removed order with id ${id}`);
    } else if (!result) {
      res.status(400).send(`Failed to remove order with id ${id}`);
    } else if (!result.deletedCount) {
      res.status(404).send(`Order with id ${id} does not exist`);
    }
  } catch (error) {
    console.error(error.message);
    res.status(400).send(error.message);
  }
});

/**
 * @api {delete} orders/custom/:to delete order by date
 * @apiName DeleteOrderById
 * @apiGroup Order
 *
 * @apiParam {String} to Order to title
 *
 * @apiSuccess {String} orders body successfully deleted
 */
ordersRouter.delete("/custom/:to", async (req: Request, res: Response) => {
  const endpoint = {
    endpoint: "/orders/custom/to",
    method: "DELETE",
    name: "DeleteOrderById",
    timestamp: new Date(),
  };
  await addTracker(endpoint);
  const to = req?.params?.to;

  try {
    const query = {
      to: new Date(to),
    };
    const result = await collections.orders.deleteOne(query);

    if (result && result.deletedCount) {
      res.status(202).send(`Successfully removed orders till ${to}`);
    } else if (!result) {
      res.status(400).send(`Failed to remove orders till ${to}`);
    } else if (!result.deletedCount) {
      res.status(404).send(`Orders till ${to} do not exist`);
    }
  } catch (error) {
    console.error(error.message);
    res.status(400).send(error.message);
  }
});
