import dotenv from "dotenv";
import express from "express";
import morgan from "morgan";
import cors from "cors";
import { connectToDB } from "./helpers/db.js";

dotenv.config();


const app = express();

app.use(morgan("dev"));
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

const connectToDBThenStartServer = async () => {
  try {
    await connectToDB();
    app.listen(process.env.PORT, () => {
      console.log(`Server is running on port ${process.env.PORT}`);
    });
  } catch (error) {
    console.log(error);
  }
};

connectToDBThenStartServer()