import express from "express";
import cookieParser from "cookie-parser";
import cors from "cors";
import morgan from "morgan";
import helmet from "helmet";  // Import Helmet
import rateLimit from "express-rate-limit";
import { logger } from "../logs/logger.js";

// Routes Import
import userRouter from "../routes/user.routes.js";
import taskRouter from "../routes/task.routes.js";

const app = express();

// Define the rate limiter
const limiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 100, // Limit each IP to 100 requests per window
    standardHeaders: true, // Return rate limit info in `RateLimit-*` headers
    legacyHeaders: false, // Disable `X-RateLimit-*` headers
});

// Use Helmet to set secure HTTP headers
app.use(helmet());

// Apply rate limiting to all requests
app.use(limiter);

// Use Morgan to log HTTP requests
app.use(
    morgan('combined', {
        stream: {
            write: (message) => logger.info(message.trim()),  // Send logs to Winston
        },
    })
);

// Use CORS to allow cross-origin requests
app.use(cors({
    origin: process.env.CORS_ORIGIN,
    credentials: true,
}));

// Parse JSON and URL-encoded data with limits
app.use(express.json({ limit: "16kb" }));
app.use(express.urlencoded({ extended: true, limit: "16kb" }));

// Parse cookies
app.use(cookieParser());

// Route declarations
app.use("/api/v1/users", userRouter);
app.use("/api/v1/tasks", taskRouter);

// Export the app
export { app };
