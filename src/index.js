import dotenv from "dotenv";
import connectDB from "./db/index.js";
import { app } from "./app.js";

dotenv.config({ path: './.env' })

connectDB()
.then(() => {
    app.listen(process.env.PORT || 8000, () => {
        console.log(`App is running on port: ${process.env.PORT}`);
    });
    app.on("error", (error) => {
        console.error("Error connecting to MongoDB:", error);
        throw error;
    });
})
.catch((err) => {   
    console.log("Error connecting to MongoDB:", err);
})