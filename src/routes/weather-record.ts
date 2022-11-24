import { Request, Response } from 'express';
import { addHeadersToResponse } from '../server-helpers';
import { pool } from '../config/postgres';

/**
 * Get All Weather Records or a single weather record
 * 
 * @verb GET
 * @route [/weather-record/:id or /weather-record/]
 * 
 * @param req.params.id 
 * @returns an array of Items or a single Item
 */
export async function getWeatherRecord(req: Request, res: Response) {
  addHeadersToResponse(res);

  try {
    const client = await pool.connect();
    await client.query('CREATE TABLE IF NOT EXISTS "records" ("id" SERIAL PRIMARY KEY,"temperature" float,"humidity" float, "dewpoint" float, "pressure" float, "wind_speed" float, "wind_gust" float);');
    let queryResult;
    if (!req.params.id) {
      const toRet = await client.query('SELECT * from records');
      queryResult = toRet.rows;
    } else {
      const toRet = await client.query('SELECT * from records WHERE id = $1', [req.params.id]);
      queryResult = toRet.rows[0];
    }
    client.release();
    return res.status(200).json(queryResult);
  } catch (error) {
    return res.status(500).json('Error on weather record' + error);
  }
}

/**
 * Create a new Weather Record
 * 
 * @verb PUT
 * @route [/weather-record/]
 * 
 * @body The body wihch contains the values, in JSON format
 * @returns the body to create the Weather Record
 */
export async function createWeatherRecord(req: Request, res: Response) {
  addHeadersToResponse(res);

  try {
    const client = await pool.connect();
    await client.query('CREATE TABLE IF NOT EXISTS "records" ("id" SERIAL PRIMARY KEY,"temperature" float,"humidity" float, "dewpoint" float, "pressure" float, "wind_speed" float, "wind_gust" float);');
    await client.query('INSERT INTO records (temperature, humidity, dewpoint, pressure, wind_speed, wind_gust) VALUES ($1,$2,$3,$4,$5,$6)', [req.body.temperature, req.body.humidity, req.body.dewpoint, req.body.pressure, req.body.wind_speed, req.body.wind_gust]);
    await client.release();
    return res.status(201).json(req.body);
  } catch (error) {
    return res.status(500).json(error);
  }
}

/**
 * Update an existing weather record
 * 
 * @verb POST
 * @route [/weather-record/:id]
 * 
 * @body The body wihch contains the updated values, in JSON format
 * @param req.params.id 
 * @returns the id of the Updated Weather Record
 */
export async function updateWeatherRecord(req: Request, res: Response) {
  addHeadersToResponse(res);

  try {
    const client = await pool.connect();
    await client.query('CREATE TABLE IF NOT EXISTS "records" ("id" SERIAL PRIMARY KEY,"temperature" float,"humidity" float, "dewpoint" float, "pressure" float, "wind_speed" float, "wind_gust" float);');
    await client.query(`UPDATE records SET temperature = $1 WHERE id = $2`, [req.body.temperature, req.params.id]);
    client.release();
    return res.status(200).json('Updated id ' + req.params.id);
  } catch (error) {
    return res.status(500).json('Error on weather record' + error);
  }
}

/**
 * Delete an existing Weather record
 * 
 * @verb DELETE
 * @route [/weather-record/:id]
 * 
 * @param req.params.id 
 * @returns the id of the Weather record
 */
export async function deleteWeatherRecord(req: Request, res: Response) {
  addHeadersToResponse(res);

  try {
    console.log(req.params.id);
    const client = await pool.connect();
    await client.query('CREATE TABLE IF NOT EXISTS "records" ("id" SERIAL PRIMARY KEY,"temperature" float,"humidity" float, "dewpoint" float, "pressure" float, "wind_speed" float, "wind_gust" float);');
    await client.query('DELETE from records WHERE id = $1', [req.params.id]);
    client.release();
    return res.status(200).json('Removed id ' + req.params.id);
  } catch (error) {
    return res.status(500).json('Error on weather record' + error);
  }
}