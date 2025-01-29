import express from "express";
import { authMiddleware } from "../../middlewares/jwtAuth.js";
import { createProperties, createProperty, deleteProperty, getProperties, getProperty, updateProperty } from "../../controllers/property/propertyController.js";

export const propertyRouter = express.Router()

propertyRouter.post("/createProperty", authMiddleware, createProperty)
propertyRouter.post("/createProperties", authMiddleware, createProperties)
propertyRouter.get("/getProperty/:id", authMiddleware, getProperty)
propertyRouter.get("/getProperties", authMiddleware, getProperties)
propertyRouter.put("/updateProperty/:id", authMiddleware, updateProperty)
propertyRouter.delete("/deleteProperty/:id", authMiddleware, deleteProperty)