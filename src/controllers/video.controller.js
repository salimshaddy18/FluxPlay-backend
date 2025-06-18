import mongoose, { isValidObjectId } from "mongoose"
import { Video } from "../models/video.model.js"
import { User } from "../models/user.model.js"
import { ApiError } from "../utils/ApiError.js"
import { ApiResponse } from "../utils/ApiResponse.js"
import { asyncHandler } from "../utils/asyncHandler.js"
import { uploadOnCloudinary } from "../utils/cloudinary.js"

//get all videos based on query, sort, pagination
const getAllVideos = asyncHandler(async (req, res) => {
    const {
        page = 1,
        limit = 10,
        query,
        sortBy = "createdAt",
        sortType = "desc",
        userId
    } = req.query;

    const skip = (parseInt(page) - 1) * parseInt(limit);
    const matchStage = {};

    // Search by title or description
    if (query) {
        matchStage.$or = [
            { title: { $regex: query, $options: "i" } },
            { description: { $regex: query, $options: "i" } }
        ];
    }

    // Filter by uploader (owner)
    if (userId) {
        if (!isValidObjectId(userId)) {
            throw new ApiError(400, "Invalid user ID");
        }
        matchStage.owner = new mongoose.Types.ObjectId(userId);
    }

    // Filter only published videos
    matchStage.isPublished = true;

    const sortStage = {
        [sortBy]: sortType === "desc" ? -1 : 1
    };

    const aggregationPipeline = [
        { $match: matchStage },
        {
            $lookup: {
                from: "users",
                localField: "owner",
                foreignField: "_id",
                as: "owner"
            }
        },
        { $unwind: "$owner" },
        {
            $project: {
                _id: 1,
                title: 1,
                description: 1,
                videoFile: 1,
                thumbnail: 1,
                duration: 1,
                views: 1,
                isPublished: 1,
                createdAt: 1,
                "owner._id": 1,
                "owner.username": 1,
                "owner.avatar": 1
            }
        },
        { $sort: sortStage },
        { $skip: skip },
        { $limit: parseInt(limit) }
    ];

    const videos = await Video.aggregate(aggregationPipeline);
    const total = await Video.countDocuments(matchStage);

    res.status(200).json(
        new ApiResponse(200, {
            videos,
            total,
            page: parseInt(page),
            limit: parseInt(limit),
            totalPages: Math.ceil(total / limit)
        }, "Videos fetched successfully")
    );
})

//get video, upload to cloudinary, create video
const publishAVideo = asyncHandler(async (req, res) => {
    const { title, description } = req.body

    const userId = req.user._id
    if (!isValidObjectId(userId)) {
        throw new ApiError(400, "Invalid user ID")
    }

    if (!title || !description) {
        throw new ApiError(400, "Title and description are required")
    }

    if (!req.files || !req.files.video) {
        throw new ApiError(400, "Video file is required")
    }

    if (!req.files.thumbnail) {
        throw new ApiError(400, "Thumbnail image is required")
    }

    // Upload video to Cloudinary
    const videoUploadResult = await uploadOnCloudinary(req.files.video.tempFilePath);
    if (!videoUploadResult) {
        throw new ApiError(500, "Failed to upload video to Cloudinary");
    }

    // Upload thumbnail to Cloudinary
    const thumbnailUploadResult = await uploadOnCloudinary(req.files.thumbnail.tempFilePath);
    if (!thumbnailUploadResult) {
        throw new ApiError(500, "Failed to upload thumbnail to Cloudinary");
    }

    // Create video document
    const newVideo = new Video({
        title: title.trim(),
        description: description.trim(),
        videoFile: videoUploadResult.secure_url,
        videoPublicId: videoUploadResult.public_id,
        thumbnail: thumbnailUploadResult.secure_url,
        thumbnailPublicId: thumbnailUploadResult.public_id,
        owner: userId
    })

    const savedVideo = await newVideo.save()
    if (!savedVideo) {
        throw new ApiError(500, "Failed to save video to database");
    }

    // Populate user details
    const populatedVideo = await Video.findById(savedVideo._id)
        .populate("owner", "username avatar");
    res.status(201).json(
        new ApiResponse(201, populatedVideo, "Video published successfully")
    )
})

//get video by id
const getVideoById = asyncHandler(async (req, res) => {
    const { videoId } = req.params

    if (!videoId) {
        throw new ApiError(400, "Video ID is required")
    }

    if (!isValidObjectId(videoId)) {
        throw new ApiError(400, "Invalid video ID")
    }

    const video = await Video.findById(videoId)
        .populate("user", "username avatar")

    if (!video) {
        throw new ApiError(404, "Video not found")
    }

    res.status(200).json(
        new ApiResponse(200, video, "Video fetched successfully")
    )
})

//update video details like title, description, thumbnail
const updateVideo = asyncHandler(async (req, res) => {
    const { videoId } = req.params;
    const { title, description, isPublished } = req.body;
    const userId = req.user._id;

    if (!isValidObjectId(videoId)) {
        throw new ApiError(400, "Invalid video ID");
    }

    const video = await Video.findById(videoId);

    if (!video) {
        throw new ApiError(404, "Video not found");
    }

    if (video.owner.toString() !== userId.toString()) {
        throw new ApiError(403, "You can only update your own videos");
    }

    if (title)
        video.title = title.trim();
    if (description)
        video.description = description.trim();
    if (typeof isPublished !== "undefined")
        video.isPublished = isPublished;

    //handle thumbnail update if sent
    if (req.files?.thumbnail) {
        // delete old from Cloudinary
        await cloudinary.uploader.destroy(video.thumbnailPublicId); // if stored
        // Upload new
        const uploadResult = await cloudinary.uploader.upload(req.files.thumbnail.tempFilePath, {
            folder: "video-thumbnails"
        });
        video.thumbnail = uploadResult.secure_url;
    }

    await video.save();

    res.status(200).json(
        new ApiResponse(200, video, "Video updated successfully")
    );
})

//delete video
const deleteVideo = asyncHandler(async (req, res) => {
    const { videoId } = req.params;

    if (!videoId) {
        throw new ApiError(400, "Video ID is required");
    }
    if (!isValidObjectId(videoId)) {
        throw new ApiError(400, "Invalid video ID");
    }

    const video = await Video.findById(videoId);
    if (!video) {
        throw new ApiError(404, "Video not found");
    }

    if (video.owner.toString() !== req.user._id.toString()) {
        throw new ApiError(403, "You can only delete your own videos");
    }

    // Delete video file from Cloudinary
    if (video.videoPublicId) {
        await cloudinary.uploader.destroy(video.videoPublicId, { resource_type: "video" });
    }

    // Delete thumbnail from Cloudinary
    if (video.thumbnailPublicId) {
        await cloudinary.uploader.destroy(video.thumbnailPublicId);
    }

    await Video.deleteOne({ _id: videoId });

    res.status(200).json(
        new ApiResponse(200, null, "Video deleted successfully")
    );
})

//toggle publish status of video
const togglePublishStatus = asyncHandler(async (req, res) => {
    const { videoId } = req.params
    if (!videoId) {
        throw new ApiError(400, "Video ID is required")
    }
    if (!isValidObjectId(videoId)) {
        throw new ApiError(400, "Invalid video ID")
    }
    const video = await Video.findById(videoId)
    if (!video) {
        throw new ApiError(404, "Video not found")
    }
    if (video.owner.toString() !== req.user._id.toString()) {
        throw new ApiError(403, "You can only toggle publish status of your own videos")
    }

    video.isPublished = !video.isPublished
    await video.save()

    res.status(200).json(
        new ApiResponse(200, video, `Video ${video.isPublished ? 'published' : 'unpublished'} successfully`)
    )
})

export {
    getAllVideos,
    publishAVideo,
    getVideoById,
    updateVideo,
    deleteVideo,
    togglePublishStatus
}