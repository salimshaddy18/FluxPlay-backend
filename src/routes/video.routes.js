import express from "express";
import {
    getAllVideos,
    publishAVideo,
    getMyVideos,
    getUserVideos,
    getVideoById,
    updateVideo,
    deleteVideo,
    togglePublishStatus,
    videoIncrementlikes,
    videoDecrementlikes,
    incrementVideoViews
} from "../controllers/video.controller.js";
import { verifyJWT } from "../middlewares/auth.middleware.js";
import { upload } from "../middlewares/multer.middleware.js";

const router = express.Router();

router.route('/all').get(getAllVideos);

router.route("/upload-video").post(verifyJWT, upload.fields([
    {
        name: "videoFile",
        maxCount: 1,
    },
    {
        name: "thumbnail",
        maxCount: 1,
    },

]), publishAVideo);

router.get("/my-videos", verifyJWT, getMyVideos);

router.get("/user/:userId/videos", verifyJWT, getUserVideos);

router.route('/user-video/:videoId').get(verifyJWT, getVideoById);

router.route("/update-video/:videoId").patch(verifyJWT, upload.single("thumbnail"), updateVideo)

router.route('/delete-video/:videoId').delete(verifyJWT, deleteVideo)

router.route("/toggle/publish/:videoId").patch(verifyJWT, togglePublishStatus);

router.route("/incrementLike/:videoId").get(verifyJWT, videoIncrementlikes);

router.route("/decrementLike/:videoId").get(verifyJWT, videoDecrementlikes);

router.route("/incrementViews/:videoId").patch(verifyJWT, incrementVideoViews);

export default router


















