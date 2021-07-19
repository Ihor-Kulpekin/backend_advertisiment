import express, {Request, Response} from "express";

import {withDB} from '../database/MongoConnection';
import {fieldValidators} from "../validators/fieldValidators";
import {Advertisement} from "../types/types";
import {Db} from "mongodb";
import redis from "redis";

const router = express.Router();

const redisClient = redis.createClient(888);

redisClient.on('connect', () => {
    console.log("You are now connected");
})

router.route('/advertisement')
    .get((async (req: Request, res: Response) => {
        const search = req.query.search ? `${req.query.search}` : '';
        redisClient.get(search, async (cb, value) => {
            if (!value) {
                try {
                    await withDB(async (db: Db) => {
                        const advertisements = await db.collection('advertisement').find({name: new RegExp(search)}).toArray()
                        redisClient.setex(search, 400, JSON.stringify(advertisements))
                        await res.status(200).json(advertisements);
                    }, res)
                } catch (err) {
                    res.status(500).send({message: err})
                }
            } else {
                if (value) {
                    await res.status(200).json(JSON.parse(value))
                }
            }
        })
    }))
    .put(async (req: Request, res: Response) => {
        await withDB(async (db) => {
            const name = req.body.name;
            await db.collection('advertisement').updateOne({name}, {
                '$set': {
                    name: req.body.name,
                    description: req.body.description,
                    price: req.body.price,
                    mainPhoto: req.body.mainPhoto,
                }
            });
            res.status(204).json({message: 'Updated', statusCode: res.statusCode})
        }, res)
    })
    .post(async (req: Request, res: Response) => {
        await withDB(async (db) => {
            const errors = fieldValidators(req.body);

            const name = req.body.name;
            const existAdvertisement: Advertisement = await db.collection('advertisement').findOne({name})

            if (existAdvertisement && (existAdvertisement.name === name)) {
                throw new Error('The advertisement has already exist')
            }

            if (errors.nameError || errors.descriptionError) {
                throw new Error(`${errors}`)
            }

            redisClient.flushdb();

            const advertisement: Advertisement = {
                name: req.body.name,
                description: req.body.description,
                price: req.body.price,
                mainPhoto: req.body.mainPhoto,
            }

            await db.collection('advertisement').insertOne(advertisement)
            res.status(201).json({name: advertisement.name, statusCode: res.statusCode})
        }, res)
    })

router.get('/advertisement/:name', (async (req: Request, res: Response) => {
    redisClient.get(req.params.name, (async (error, reply) => {
        try {
            if (error) throw new Error(`${error}`)

            if (reply) {
                res.status(200).send(JSON.parse(reply));
            } else {
                await withDB(async (db) => {
                    const name = req.params.name;
                    const advertisement: Advertisement = await db.collection('advertisement').findOne({name})
                    redisClient.setex(advertisement.name, 30, JSON.stringify(advertisement))
                    await res.status(200).json(advertisement);
                }, res)
            }
        } catch (err) {
            res.status(500).send({message: err})
        }
    }))
}))

export default router;
