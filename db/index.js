import mongoose from "mongoose";
import { logger } from "../logs/logger.js"

const connectDB = async ()=>{
    try {
        const connectionInstance =  await mongoose.connect(process.env.MONGO_URI, {
            useNewUrlParser: true,
            useUnifiedTopology: true,
          });
        logger.info(`\n MongoDB connected ... DB HOST : ${connectionInstance.connection.host}`);  //to find on ehich host we are connecting
    } catch (error) {
        logger.error("MongoDB connection FAILED", error);
        process.exit(1);
    }
}

export default connectDB;
