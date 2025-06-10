import { Router } from "express";
import { updateProfilePicture } from "../controllers/profile.controller";
import { verifyJwt } from "../middleware/verifyJwt";


export const profileRouter = Router()

profileRouter.use(verifyJwt)

profileRouter.post("/updatePicture",updateProfilePicture)