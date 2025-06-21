import { Router } from 'express';
import {
    addComment,
    deleteComment,
    getVideoComments,
    updateComment,
    commentIncrementlikes,
    commentDecrementlikes
} from "../controllers/comment.controller.js"
import { verifyJWT } from "../middlewares/auth.middleware.js"

const router = Router();

router.use(verifyJWT);

router.route("/:videoId").get(getVideoComments).post(addComment);
router.route("/c/:commentId").delete(deleteComment).patch(updateComment);
router.route("/incrementLikes/:commentId").patch(commentIncrementlikes);
router.route("/decrementLikes/:commentId").patch(commentDecrementlikes);

export default router