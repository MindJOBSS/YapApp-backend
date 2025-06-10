import { Router } from "express";
import { verifyJwt } from "../middleware/verifyJwt";
import { getallUsers, getMessages , sendMessage} from "../controllers/message.controller";


export const messageRouter = Router()

messageRouter.use(verifyJwt)

messageRouter.get("/users", getallUsers)
messageRouter.get("/:id", getMessages)
messageRouter.post("/send/:id", sendMessage);