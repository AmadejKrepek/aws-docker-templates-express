import { Credentials } from '../Credentials';
const { RabbitMQ } = require('../RabbitMq')
// External Dependencies
import { Request, Response } from "express";
import { ObjectId, ReturnDocument } from "mongodb";
import { collections } from "../config/mongodb";

import axios from 'axios';

const express = require("express");

var resp = [] as any;

const prod_hostname = {
  accountService: 'http://accountservice:20'
}

const dev_hostname = {
  accountService: 'http://studentdocker.informatika.uni-mb.si:12670'
}

const hostname = process.env.NODE_ENV == 'Production' ? prod_hostname : dev_hostname;

/*
export async function fetchAccountData() {
  try {
    this.orders = await fetch(`${hostname}/api/getUsers`).then(
      (response) => {
        resp = response.json();
      }
    );
  } catch (error) {
    this.error = error;
  } finally {
    this.loading = false;
  }
}
*/

async function validate(data: any) {
  try {
    return axios.post(`${hostname}/api/validate`, data)
    .then(response => {
      return response.data
    })
  } catch (error) {
    console.log(error)
    return Promise.reject(error)
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
    var rbmq = new RabbitMQ(creds.user, creds.pwd, creds.host, creds.port, creds.vhost, creds.amql_url);

    let message = 'It works!'
    let url = 'http://studentdocker.informatika.uni-mb.si:15555/orders'
    let logType = "INFO"
    let appName = '<OrdersService>'
    console.log('ne dela')
    var credentials = new Credentials()
    var creds = credentials.getCredentials();
    rbmq.produce(logType, url, appName, message).then(() => {
      console.log('works')
    })
    const token = req?.body?.token;
    if (!token) {
      res.status(400);
      res.json({message: 'Please add token to request body!'})
      res.end()
      return;
    }
    /*
    const getValidation = async () => {
      const result = await validate({token: token})
      if (result.error || result.message == 'Token is invalid') {
        res.status(400).send(result)
        res.end()
        return;
      }
      else {
        const orders = (await collections.orders.find({}).toArray()) as any;
        res.status(200).send(orders);
      }
    }
    getValidation()
    */
  } catch (error) {
    res.status(500).send(error.message);
  }
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
  const id = req?.params?.id;

  try {
    const query = { _id: new ObjectId(id) };
    const order = (await collections.orders.findOne(query)) as any;

    if (order) {
      res.status(200).send(order);
    } else {
      res.status(404).send(`Unable to find order with id: ${req.params.id}`);
    }
  } catch (error) {
    res
      .status(404)
      .send(`Unable to find matching document with id: ${req.params.id}`);
  }
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
  const from = req?.params?.from;
  const to = req?.params?.to;

  try {
    const query = {
      from: new Date(from),
      to: new Date(to),
    };
    const orders = (await collections.orders.find(query).toArray()) as any;

    res.status(200).send(orders);
  } catch (error) {
    res.status(500).send(error.message);
  }
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
