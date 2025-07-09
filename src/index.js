//require('dotenv').config({path: './env'})
import serverless from "serverless-http";

import dotenv from "dotenv";
import connectDB from "./db/index.js";
import { app } from "./app.js";

dotenv.config({ path: './.env' })

connectDB()
    .then(() => {
        console.log(process.env.NODE_ENV);
        
        if (process.env.NODE_ENV !== "production") {
            app.listen(8000, () => console.log("Running locally at http://localhost:8000"));
        }
        app.on("error", (error) => {
            console.error("Error connecting to MongoDB:", error);
            throw error;
        });

    })
    .catch((err) => {
        console.log("Error connecting to MongoDB:", err);
    })

// export const handler = serverless(app)
export default serverless(app)

















// import express from "express";
// const app = express()



/*
( async () => {
    try {
        await mongoose.connect(`${process.env.MONGO_URI}/${DB_NAME}`)
        app.on("error", (error) => {
            console.error("Error connecting to MongoDB")
            throw error
        }) 

        app.listen(process.env.PORT, () => {
            console.log(`App is running on port ${process.env.PORT}`)
        })
    }
    catch (error) {
        console.error("Error: ", error)
        throw error;
    }
})()

*/