import { NextFunction, Request, Response } from "express";
import { logEvent } from "./logger";
import z from "zod";

const errorHandler = (
    err: Error,
    req: Request,
    res: Response,
    next: NextFunction
) => {
    if (err instanceof z.ZodError) {
        formatZodError(res, err);
        logEvent(
            `${err.name}: ${err.message}\t${req.method}\t${req.url}\t${req.headers.origin}`,
            "zodErrorLog.log"
        );
        return;
    }

    logEvent(
        `${err.name}: ${err.message}\t${req.method}\t${req.url}\t${req.headers.origin}`,
        "errorLog.log"
    );

    console.log(err.stack);

    const errorStatus = res.statusCode ? res.statusCode : 500;

    res.status(errorStatus);
    res.json({ message: err.message });
};

export default errorHandler;

const formatZodError = (res: Response, error: z.ZodError): void => {
    const errors = error?.issues?.map((err) => ({
        field: err.path.join("."),
        message: err.message,
    }));

    res.status(400).json({
        message: "Validation failed",
        errors: errors,
    });
    return;
};
