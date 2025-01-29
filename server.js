import dotenv from "dotenv";
import express from "express";
import morgan from "morgan";
import cors from "cors";
import { authRouter } from "./routes/auth/authRoute.js";
import { userRouter } from "./routes/user/userRouter.js";
import { propertyRouter } from "./routes/property/propertyRoute.js";

dotenv.config();

const app = express();

app.use(morgan("dev"));
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use("/v1/auth", authRouter);
app.use("/v1/users", userRouter);
app.use("v1/property", propertyRouter);

app.listen(process.env.PORT, () => {
  console.log(`Server is running on port ${process.env.PORT}`);
});
