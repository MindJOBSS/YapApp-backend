import { format } from "date-fns"
import fs from "fs";
import path from "path";
import fsPromises from "fs/promises";
import { NextFunction, Request, Response } from "express";

export const logEvent = async (message: string, logFileName: string) => {
    const dateTime = format(new Date(), "yyyy-MM-dd HH:mm:ss");
    const logItem = `${dateTime} - ${message}\n`;

    try {
        if (!fs.existsSync(path.join(__dirname, "..", "logs"))) {
            await fsPromises.mkdir(path.join(__dirname, "..", "logs"));
        }

        await fsPromises.appendFile(path.join(__dirname, "..", "logs", logFileName), logItem);
        console.log(logItem);
    } catch (error) {
        console.error("Error writing to log file:", error);
        
    }
}

export const logger = (req: Request, res: Response, next: NextFunction):void => {
    logEvent(`${req.method}\t${req.url}\t${req.headers.origin}`, "reqLog.log");
    console.log(`${req.method} ${req.path}`);
    next()
}