import express, { Request, Response } from "express";
import mongoose from "mongoose";
import cors from "cors";
import * as yup from "yup";
import dotenv from "dotenv";
import bodyParser from "body-parser";

dotenv.config();
// Connect to MongoDB
// Connect to MongoDB
mongoose
  .connect(process.env.MONGODB_URI || "mongodb://localhost:27017/curdtable")
  .then(() => console.log("Connected to MongoDB..."))
  .catch((err) => console.error("Could not connect to MongoDB...", err));

const app = express();
app.use(cors());
app.use(bodyParser.json());

// Define schema and TypeScript interface
interface IUser extends Document {
  firstname: string;
  lastname: string;
  age: number;
  gender: string;
  country: string;
}

const userSchema = new mongoose.Schema<IUser>({
  firstname: String,
  lastname: String,
  age: Number,
  gender: String,
  country: String,
});

// Create model
const User = mongoose.model<IUser>("User", userSchema);

// Validation schema
const userValidationSchema = yup.object().shape({
  firstname: yup.string().required(),
  lastname: yup.string().required(),
  age: yup.number().positive().integer().required(),
  gender: yup.string().required(),
  country: yup.string().required(),
});

// CRUD routes
app.post("/users", async (req: Request, res: Response) => {
  try {
    await userValidationSchema.validate(req.body);
    const user = new User(req.body);
    await user.save();
    res.status(201).send(user);
  } catch (error) {
    res.status(400).send(error);
  }
});

app.get("/users", async (req: Request, res: Response) => {
  try {
    const users = await User.find({});
    res.send(users);
  } catch (error) {
    res.status(500).send(error);
  }
});

app.put("/users/:id", async (req: Request, res: Response) => {
  try {
    await userValidationSchema.validate(req.body);
    const user = await User.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
    });
    if (!user) {
      return res.status(404).send();
    }
    res.send(user);
  } catch (error) {
    res.status(400).send(error);
  }
});

app.delete("/users/:id", async (req: Request, res: Response) => {
  try {
    const user = await User.findByIdAndDelete(req.params.id);
    if (!user) {
      return res.status(404).send();
    }
    res.send(user);
  } catch (error) {
    res.status(500).send(error);
  }
});

const PORT = process.env.PORT || 4000;
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
