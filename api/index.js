// api/index.js
import { app } from '../src/app.js';
import serverless from 'serverless-http';
import dotenv from 'dotenv';
import connectDB from '../src/db/index.js';

dotenv.config({ path: './.env' });

let dbConnected = false;

async function setup() {
  if (!dbConnected) {
    await connectDB();
    dbConnected = true;
  }
}

const handler = async (req, res) => {
  await setup();
  return serverless(app)(req, res);
};

export default handler;
