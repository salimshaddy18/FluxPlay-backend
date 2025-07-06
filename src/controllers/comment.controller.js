import mongoose from "mongoose";
import { Comment } from "../models/comment.model.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { User } from "../models/user.model.js"

//get all comments for a video
const getVideoComments = asyncHandler(async (req, res) => {
    const { videoId } = req.params;
    const { page = 1, limit = 10 } = req.query;

    if (!mongoose.Types.ObjectId.isValid(videoId)) {
        throw new ApiError(400, "Invalid video ID");
    }

    const skip = (page - 1) * limit;

    const comments = await Comment.aggregate([
        { $match: { video: new mongoose.Types.ObjectId(videoId) } },
        {
            $lookup: {
                from: "users",
                localField: "user",
                foreignField: "_id",
                as: "user"
            }
        },
        { $unwind: "$user" },
        {
            $lookup: {
                from: "likes",
                let: { commentId: "$_id" },
                pipeline: [
                    { $match: { $expr: { $eq: ["$comment", "$$commentId"] } } }
                ],
                as: "likes"
            }
        },
        {
            $addFields: {
                totalLikes: { $size: "$likes" }
            }
        },
        {
            $project: {
                content: 1,
                createdAt: 1,
                "user._id": 1,
                "user.username": 1,
                "user.avatar": 1,
                totalLikes: 1
            }
        },
        { $sort: { createdAt: -1 } },
        { $skip: skip },
        { $limit: parseInt(limit) }
    ]);

    const total = await Comment.countDocuments({ video: videoId });

    return res.status(200).json(new ApiResponse(200, {
        comments,
        total,
        page: Number(page),
        totalPages: Math.ceil(total / limit)
    }, "Comments fetched successfully"));
})

//add a comment to a video
const addComment = asyncHandler(async (req, res) => {
    const { videoId } = req.params
    const { content } = req.body
    const userId = req.user._id

    if (!mongoose.Types.ObjectId.isValid(videoId)) {
        throw new ApiError(400, "Invalid video ID")
    }

    if (!content || content.trim() === "") {
        throw new ApiError(400, "Comment content is required")
    }

    const newComment = await Comment.create({
        content,
        video: videoId,
        user: userId
    })

    res.status(201).json(
        new ApiResponse(201, newComment, "Comment added successfully")
    )
})

//delete a comment
const deleteComment = asyncHandler(async (req, res) => {
    const { commentId } = req.params
    const userId = req.user._id

    if (!mongoose.Types.ObjectId.isValid(commentId)) {
        throw new ApiError(400, "Invalid comment ID")
    }

    const comment = await Comment.findById(commentId)

    if (!comment) {
        throw new ApiError(404, "Comment not found")
    }

    if (comment.user.toString() !== userId.toString()) {
        throw new ApiError(403, "You can only delete your own comment")
    }

    await comment.deleteOne()

    res.status(200).json(
        new ApiResponse(200, null, "Comment deleted successfully")
    )
})

export {
    getVideoComments,
    addComment,
    deleteComment
}