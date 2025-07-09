// api/index.js
import { app } from '../src/app.js';
import serverless from 'serverless-http';
import dotenv from 'dotenv';
import connectDB from '../src/db/index.js';

dotenv.config({ path: './.env' });

let isConnected = false;

const handler = async (req, res) => {
  if (!isConnected) {
    await connectDB();
    isConnected = true;
  }

  return serverless(app)(req, res);
};

export default handler;
