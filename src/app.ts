import express, { type Request, type Response } from "express"
import cookieParser from "cookie-parser";
import expressSession from "express-session";
const app = express()
import cors from 'cors';
import rounter from "./app/routes/index.js";
import globalErrHandler from "./app/middlewares/golballErrorHandler.js"; 
import notFoundRoute from "./app/middlewares/notFoundRoute.js";
import passport from "passport";
import "../src/app/config/passport.js";

app.use(expressSession({
    secret:"your secreet",
    resave: false,
    saveUninitialized: false
}))

app.use(passport.initialize())
app.use(passport.session())

app.use(express.json());
app.use(cors());
app.use(cookieParser())

app.use('/api/v1', rounter);

app.get("/",(req:Request,res:Response) =>{
    res.status(200).json({
        message: "welcome to server"
    })
})

//global error handler
app.use(globalErrHandler);

// not found route
app.use(notFoundRoute);

export default app;