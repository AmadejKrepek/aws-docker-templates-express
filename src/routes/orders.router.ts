// External Dependencies
import { Request, Response } from "express";
import { ObjectId } from "mongodb";
import { collections } from "../config/mongodb";

const express = require('express');

// Global Config
export const ordersRouter = express.Router();

ordersRouter.use(express.json());

/**
 * @api {get} order/ Get all orders
 * @apiName GetOrders
 * @apiGroup Order
 * 
 * @apiSuccess {String} orders Array of Orders
 */
// GET
ordersRouter.get("/", async (_req: Request, res: Response) => {
    try {
        const orders = (await collections.orders.find({}).toArray()) as any;

        res.status(200).send(orders);
    } catch (error) {
        res.status(500).send(error.message);
    }
});

/**
 * @api {get} order/:id/ Get order by id
 * @apiName GetOrder
 * @apiGroup Order
 * 
 * @apiParam {Number} id Order uniqueID
 * 
 * @apiSuccess {String} order Order Class
 */
ordersRouter.get("/:id", async (req: Request, res: Response) => {
    const id = req?.params?.id;

    try {

        const query = { _id: new ObjectId(id) };
        const order = (await collections.orders.findOne(query)) as any;

        if (order) {
            res.status(200).send(order);
        }
    } catch (error) {
        res.status(404).send(`Unable to find matching document with id: ${req.params.id}`);
    }
});

/**
 * @api {get} order/:from/:to Get order from/to
 * @apiName GetOrderTime
 * @apiGroup Order
 * 
 * @apiParam {String} from, to fromDate
 * @apiParam {String} to toDate
 * 
 * @apiSuccess {String} orders Array of orders
 */
ordersRouter.get("/:from/:to", async (req: Request, res: Response) => {
    const from = req?.params?.from;
    const to = req?.params?.to;

    try {

        const query = {
            from: from,
            to: to
        };
        const orders = (await collections.orders.find(query).toArray()) as any;

        res.status(200).send(orders);
    } catch (error) {
        res.status(500).send(error.message);
    }
});

/**
 * @api {get} order/latest Get latest order
 * @apiName GetOrderLatest
 * @apiGroup Order
 * 
 * @apiSuccess {String} order Order object
 */
ordersRouter.get("/latest", async (req: Request, res: Response) => {
    const to = req?.params?.to;

    try {

        const query = {
            to: new Date().setHours(23, 59, 0, 0)
        };
        const order = (await collections.orders.findOne(query)) as any;

        if (order) {
            res.status(200).send(order);
        }
    } catch (error) {
        res.status(404).send(`Unable to find matching document with latest data to: ${req.params.to}`);
    }
});

/**
 * @api {post} order/ add order
 * @apiName PostOrder
 * @apiGroup Order
 * 
 * @apiBody {String} title
 * @apiBody {String} productId
 * 
 * @apiSuccess {String} order body successfully added
 */
// POST
ordersRouter.post("/", async (req: Request, res: Response) => {
    try {
        const newOrder = req.body as any;
        const result = await collections.orders.insertOne(newOrder);

        result
            ? res.status(201).send(`Successfully created a new order with id ${result.insertedId}`)
            : res.status(500).send("Failed to create a new order.");
    } catch (error) {
        console.error(error);
        res.status(400).send(error.message);
    }
});

/**
 * @api {put} order/:id update order by id
 * @apiName UpdateOrder
 * @apiGroup Order
 * 
 * @apiParam {Number} id Order id
 * 
 * @apiBody {String} title
 * @apiBody {String} productId
 * 
 * @apiSuccess {String} order body successfully updated
 */
// PUT
ordersRouter.put("/:id", async (req: Request, res: Response) => {
    const id = req?.params?.id;

    try {
        const updatedOrder: any = req.body as any;
        const query = { _id: new ObjectId(id) };

        const result = await collections.orders.updateOne(query, { $set: updatedOrder });

        result
            ? res.status(200).send(`Successfully updated order with id ${id}`)
            : res.status(304).send(`Order with id: ${id} not updated`);
    } catch (error) {
        console.error(error.message);
        res.status(400).send(error.message);
    }
});

/**
 * @api {delete} order/:id delete order by id
 * @apiName DeleteOrder
 * @apiGroup Order
 * 
 * @apiParam {Number} id Order id
 * 
 * @apiSuccess {String} order body successfully updated
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
 * @api {delete} order/:to delete order by id
 * @apiName DeleteOrder
 * @apiGroup Order
 * 
 * @apiParam {String} to Order to date
 * 
 * @apiSuccess {String} order body successfully deleted
 */
ordersRouter.delete("/:to", async (req: Request, res: Response) => {
    const to = req?.params?.to;

    try {
        const query = {
            to: to
        };
        const result = await collections.orders.deleteMany(query);

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