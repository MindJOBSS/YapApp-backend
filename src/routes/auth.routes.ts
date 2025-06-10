import express from 'express';
import { checkAuth, login, logout, refresh, signup } from '../controllers/auth.controller';
import { verifyJwt } from '../middleware/verifyJwt';

export const authRouter = express.Router();

authRouter.post("/sign", signup)
authRouter.post("/login", login)
authRouter.get("/logout",verifyJwt, logout)
authRouter.get("/refresh", refresh) 
authRouter.get("/check", verifyJwt, checkAuth)