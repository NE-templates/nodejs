import express from "express"
import { authMiddleware } from "../../middlewares/jwtAuth.js"
import { createUsers } from "../../controllers/auth/authController.js"
import { deleteUser, getUser, getUsers, updateUser } from "../../controllers/user/userContoller.js"

export const userRouter = express.Router()

userRouter.post("/createUsers", authMiddleware, createUsers)
userRouter.get("/getUser/:id", authMiddleware, getUser)
userRouter.get("/getUsers", authMiddleware, getUsers)
userRouter.put("/updateUser/:id", authMiddleware, updateUser)
userRouter.delete("/deleteUser/:id", authMiddleware, deleteUser)