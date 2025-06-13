import express, { Request, Response } from "express";
import cookieParser from "cookie-parser";
import "dotenv/config";
import { logger } from "./middleware/logger";
import errorHandler from "./middleware/errorHandler";
import { corsOptions } from "./config/corsOptions";
import cors from "cors";
import { connectDB } from "./database/connectDB";
import mongoose from "mongoose";
import { logEvent } from "./middleware/logger";
import expressAsyncHandler from "express-async-handler";
import { authRouter } from "./routes/auth.routes";
import { profileRouter } from "./routes/profile.routes";
import { messageRouter } from "./routes/message.route";
import { app , server } from "./lib/socket";

const PORT = process.env.PORT || 3500;

connectDB();

app.use(logger);

app.use(cors(corsOptions));

app.use(express.json());
app.use(cookieParser());

app.use(express.json({ limit: "10mb" }));
app.use(express.urlencoded({ limit: "10mb", extended: true }));

app.use("/api/auth", authRouter);
app.use("/api/profile", profileRouter);
app.use("/api/messages", messageRouter);

app.get(
  "/",
  expressAsyncHandler(async (req: Request, res: Response) => {
    res.status(200).json({ message: "API is running..." });
  })
);

app.use(errorHandler);

mongoose.connection.on("open", () => {
  server.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
  });
});

mongoose.connection.on("error", (err) => {
  logEvent(
    `${err.no}: ${err.code}\t${err.syscall}\t${err.hostname}`,
    "mongoErrLog.log"
  );
  console.error(`MongoDB connection error: ${err}`);
});
