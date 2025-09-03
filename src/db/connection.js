import mongoose from "mongoose";

const MONGODB_URI = process.env.MONGODB_URI;
const DB_NAME = process.env.DB_NAME;

const connectionOptions = {
  serverSelectionTimeoutMS: 30000,
  socketTimeoutMS: 45000,
  maxPoolSize: 10,
};

async function connectDB() {
  try {
    const connectionInstance = await mongoose.connect(
        `${MONGODB_URI}/${DB_NAME}`,
        connectionOptions
    );

    console.log(
        "\n MongoDB connected !! DB HOST: ",
        connectionInstance.connection.host
    );
  } catch (error) {
    console.log(
      "src :: db :: connection.js :: connectDB :: MONGODB connection FAILED: ",
      error
    );
    process.exit(1);
  }
}

export default connectDB;
