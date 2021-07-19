import {Response} from "express";
import {Db, MongoClient} from "mongodb";

type OperationsFunction = (db: Db) => Promise<void>;

export const withDB = async (operations: OperationsFunction, res: Response) => {
    try {
        const client = await MongoClient.connect('mongodb://localhost:777', {useNewUrlParser: true, useUnifiedTopology: true})

        const db: Db = client.db('advertisement');

        await operations(db)

        await client.close();
    } catch (e) {
        await res.status(500).json({message: `Error:${e}`})
    }
}

