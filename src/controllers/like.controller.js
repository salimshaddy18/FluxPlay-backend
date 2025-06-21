import mongoose, { isValidObjectId } from "mongoose"
import { Like } from "../models/like.model.js"
import { Video } from "../models/video.model.js"
import { Comment } from "../models/comment.model.js"
import { ApiError } from "../utils/ApiError.js"
import { ApiResponse } from "../utils/ApiResponse.js"
import { asyncHandler } from "../utils/asyncHandler.js"

//toggle like on video
const toggleVideoLike = asyncHandler(async (req, res) => {
    const { videoId } = req.params;

    if (!isValidObjectId(videoId)) {
        throw new ApiError(400, "Invalid video ID");
    }

    const userId = req.user._id;

    const existingLike = await Like.findOne({ video: videoId, owner: userId });

    if (existingLike) {
        await Like.deleteOne({ _id: existingLike._id });
        return res.status(200).json(new ApiResponse(200, null, "Like removed successfully"));
    } else {
        const newLike = new Like({ video: videoId, owner: userId });
        await newLike.save();
        return res.status(201).json(new ApiResponse(201, newLike, "Like added successfully"));
    }
});

//toggle like on comment
const toggleCommentLike = asyncHandler(async (req, res) => {
    const { commentId } = req.params;

    if (!isValidObjectId(commentId)) {
        throw new ApiError(400, "Invalid comment ID");
    }

    const userId = req.user._id;

    const existingLike = await Like.findOne({ comment: commentId, owner: userId });

    if (existingLike) {
        await Like.deleteOne({ _id: existingLike._id });
        return res.status(200).json(new ApiResponse(200, null, "Like removed successfully"));
    } else {
        const newLike = new Like({ comment: commentId, owner: userId });
        await newLike.save();
        return res.status(201).json(new ApiResponse(201, newLike, "Like added successfully"));
    }
});

//get all liked videos
const getLikedVideos = asyncHandler(async (req, res) => {
    try {
        const userId = req.user._id;

        const likedVideos = await Like.find({
            likedBy: userId,
            video: { $exists: true }
        })
            .populate({
                path: "video",
                select: "videoFile thumbnail title description duration view owner updatedAt createdAt",
                populate: {
                    path: "owner",
                    select: "username fullName avatar"
                }
            })
            .sort({ updatedAt: -1 });

        if (!likedVideos || likedVideos.length === 0) {
            return res.status(200).json(new ApiResponse(200, [], "No liked videos found"));
        }

        const videos = await Promise.all(
            likedVideos.map(async (like) => {
                const video = like.video.toObject();
                video.totalLikes = await Like.countDocuments({ video: video._id });
                return video;
            })
        );

        return res.status(200).json(new ApiResponse(200, videos, "Liked videos fetched successfully"));
    } catch (error) {
        throw new ApiError(500, "Something went wrong while fetching liked videos");
    }
})

export {
    toggleCommentLike,
    toggleVideoLike,
    getLikedVideos
}