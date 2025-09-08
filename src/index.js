// entry file for node js system
import dotenv from "dotenv";
import { app } from "./app.js";
import connectDB from "./db/connection.js";
import mongoose from "mongoose";
import { initAdminData } from "./db/initAdmin.js";

dotenv.config({
  path: "./.env",
});

const PORT = process.env.PORT || 8001;

app.get("/", (req, res) => {
  res.send("Hello World");
});

async function startServer() {
  try {
    // 1. connect to database
    await connectDB();
    console.log("Database connection successful");

    // 2. initialize admin data
    const db = mongoose.connection.db;
    await initAdminData(db);

    app.listen(PORT, "0.0.0.0", () => {
        console.log(
            `Server running on port ${PORT} and accessible on all interfaces`
        );
    })
  } catch (error) {
    console.log("Error starting the server:", error);
    process.exit(1); // close the node process
  }
}

startServer();

export default app;
