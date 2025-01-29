import express from "express";
import { createUser, signin } from "../../controllers/auth/authController.js";

export const authRouter = express.Router();

authRouter.post("/signin", signin)
authRouter.post("/signup", createUser)