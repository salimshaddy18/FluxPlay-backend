import express from "express";
import { search } from "../controllers/searching.controller.js";
import { verifyJWT } from "../middlewares/auth.middleware.js";

const router = express.Router();

router.route("/all").get(verifyJWT, search);

export default router;