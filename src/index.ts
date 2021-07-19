import cors from "cors";
import bodyParser from "body-parser";
import express, {NextFunction, Request, Response} from "express";
import router from "./controllers/AdvertisimentControllers";


const app = express();

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({extended: true}));
app.use(cors());
app.use(router);

app.use(function (err: any, req: Request, res: Response, next: NextFunction) {
    console.log(err)
    res.status(500).send('Something broke!')
})

app.listen(8000, () => {
    console.log('Listening on port 8000')
})
