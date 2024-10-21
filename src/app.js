import express from "express";
import cookieParser from "cookie-parser";
import cors from "cors";
import morgan from "morgan";
import { logger } from "../logs/logger.js";


const app =express();

// Use Morgan to log HTTP requests
app.use(
    morgan('combined', {
        stream: {
            write: (message) => logger.info(message.trim()),  // Send logs to Winston
        },
    })
);

app.use(cors({  // app.use(cors())
    origin: process.env.CORS_ORIGIN,
    credentials: true
}));

app.use(express.json({
    limit:"16kb"  // jb form fill kiya to json se data aaya uska limit;
}))

app.use(express.urlencoded({extended:true, limit:"16kb"}))

// to stare some static file or img or icon in our server
app.use(express.static("public"))

//just use to read and perform opertaion from server to user's cookies
app.use(cookieParser())


//roues import
import userRouter from "../routes/user.routes.js"
import taskRouter from "../routes/task.routes.js"

//routes decleration
app.use("/api/v1/users", userRouter);
app.use("/api/v1/tasks", taskRouter);



export { app };
