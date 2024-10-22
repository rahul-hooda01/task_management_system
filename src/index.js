import dotenv from "dotenv";
import connectDB from "../db/index.js";
import { app } from "./app.js";
import { logger } from "../logs/logger.js"

dotenv.config({
    path:'../.env'
});

connectDB()
.then((result) => {
    app.on("error", (error)=>{
        throw error;
    })
    app.listen(process.env.PORT || 8000, ()=>{
        logger.info(`server is listen on PORT: ${process.env.PORT}`)
    });
}).catch((err) => {
    logger.error(`MongoDb connection Failed error: ${err}`);    
});
