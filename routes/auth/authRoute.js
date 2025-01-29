import express from "express";
import { createUser, signin } from "../../controllers/auth/authController.js";
import { createRequire } from 'module';

const require = createRequire(import.meta.url);

export const authRouter = express.Router();

authRouter.post("/signin", signin)
authRouter.post("/signup", createUser)