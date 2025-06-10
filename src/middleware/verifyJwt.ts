import { NextFunction, Request, Response } from "express";
import expressAsyncHandler from "express-async-handler";
import jwt, { VerifyErrors } from "jsonwebtoken";
import mongoose from "mongoose";

declare module "express-serve-static-core" {
    interface Request {
        email?: string;
        fullName?: string;
        id?: mongoose.Types.ObjectId;
    }
}


export const verifyJwt = expressAsyncHandler((req: Request, res: Response, next: NextFunction) => {
    const authHeader = req.headers.authorization || req.headers.Authorization;

    if (!authHeader || typeof authHeader !== "string") {
        res.status(401).json({ message: "Authorization header is missing" });
        return;
    }

    if(!authHeader?.startsWith("Bearer ")) {
        res.status(401).json({ message: "Invalid authorization format" });
        return;
    }

    const accessToken = authHeader.split(" ")[1]; 

    jwt.verify(
        accessToken,
        process.env.ACCESS_TOKEN_SECRET as string,
        async (err: VerifyErrors | null, decoded: any) => {
            if (err) {
                res.status(401).json({ message: "Unauthorized: Invalid token" });
                return;
            }
            req.email = decoded.UserInfo.email;
            req.fullName = decoded.UserInfo.fullName;
            req.id = decoded.UserInfo.id;
            next()
        }
    )
})

