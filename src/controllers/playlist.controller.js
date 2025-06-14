import mongoose, { isValidObjectId } from "mongoose"
import { Playlist } from "../models/playlist.model.js"
import { Video } from "../models/video.model.js"
import { ApiError } from "../utils/ApiError.js"
import { ApiResponse } from "../utils/ApiResponse.js"
import { asyncHandler } from "../utils/asyncHandler.js"

//create playlist
const createPlaylist = asyncHandler(async (req, res) => {
    const { name, description } = req.body;
    const videoId = req.params.videoId;
    const userId = req.user._id;

    if (!isValidObjectId(userId)) {
        throw new ApiError(400, "Invalid user ID"); 
    }

    if (!name || name.trim() === "") {
        throw new ApiError(400, "Playlist name is required");
    }

    if (!description || description.trim() === "") {
        throw new ApiError(400, "Playlist description is required");
    }

    let videos = [];

    if (videoId) {
        if (!isValidObjectId(videoId)) {
            throw new ApiError(400, "Invalid video ID");
        }

        const videoExists = await Video.findById(videoId);
        if (!videoExists) {
            throw new ApiError(404, "Video not found");
        }

        videos.push(videoId);
    }

    const newPlaylist = await Playlist.create({
        name: name.trim(),
        description: description.trim(),
        videos,
        owner: userId
    });

    res.status(201).json(
        new ApiResponse(201, newPlaylist, "Playlist created successfully")
    );
})

//get user playlists
const getUserPlaylists = asyncHandler(async (req, res) => {
    const { userId } = req.params;
    const { page = 1, limit = 10 } = req.query;

    if (!isValidObjectId(userId)) {
        throw new ApiError(400, "Invalid user ID");
    }

    const skip = (page - 1) * parseInt(limit);

    const playlists = await Playlist.find({ owner: userId })
        .skip(skip)
        .limit(parseInt(limit))
        .populate('videos', 'title thumbnailUrl')
        .populate('owner', 'username profilePicture');

    const totalPlaylists = await Playlist.countDocuments({ owner: userId });

    if (!playlists || playlists.length === 0) {
        return res.status(200).json(
            new ApiResponse(200, [], "No playlists found for this user")
        );
    }

    res.status(200).json(
        new ApiResponse(200, {
            playlists,
            total: totalPlaylists,
            page: Number(page),
            totalPages: Math.ceil(totalPlaylists / limit)
        }, "User playlists retrieved successfully")
    );
})

//get playlist by id
const getPlaylistById = asyncHandler(async (req, res) => {
    const { playlistId } = req.params

    if (!isValidObjectId(playlistId)) {
        throw new ApiError(400, "Invalid playlist ID");
    }

    const playlist = await Playlist.findById(playlistId)
        .populate('videos', 'title thumbnailUrl')
        .populate('owner', 'username profilePicture');

    if (!playlist) {
        throw new ApiError(404, "Playlist not found");
    }

    res.status(200).json(
        new ApiResponse(200, playlist, "Playlist retrieved successfully")
    )
})

//add video to playlist
const addVideoToPlaylist = asyncHandler(async (req, res) => {
    const { playlistId, videoId } = req.params
    if (!isValidObjectId(playlistId)) {
        throw new ApiError(400, "Invalid playlist ID");
    }
    if (!isValidObjectId(videoId)) {
        throw new ApiError(400, "Invalid video ID");
    }
    const playlist = await Playlist.findById(playlistId);
    if (!playlist) {
        throw new ApiError(404, "Playlist not found");
    }
    const video = await Video.findById(videoId);
    if (!video) {
        throw new ApiError(404, "Video not found");
    }
    if (playlist.videos.includes(videoId)) {
        throw new ApiError(400, "Video already exists in the playlist");
    }
    playlist.videos.push(videoId);
    await playlist.save();
    res.status(200).json(
        new ApiResponse(200, playlist, "Video added to playlist successfully")
    )
})

//remove video from playlist
const removeVideoFromPlaylist = asyncHandler(async (req, res) => {
    const { playlistId, videoId } = req.params
    if (!isValidObjectId(playlistId)) {
        throw new ApiError(400, "Invalid playlist ID");
    }
    if (!isValidObjectId(videoId)) {
        throw new ApiError(400, "Invalid video ID");
    }
    const playlist = await Playlist.findById(playlistId);
    if (!playlist) {
        throw new ApiError(404, "Playlist not found");
    }

    if (playlist.videos.length === 0) {
        throw new ApiError(404, "No videos found in the playlist");
    }   
    const video = await Video.findById(videoId);
    if (!video) {
        throw new ApiError(404, "Video not found");
    }

    if (playlist.owner.toString() !== req.user._id.toString()) {
        throw new ApiError(403, "You can only remove videos from your own playlists");
    }

    if (!playlist.videos.includes(videoId)) {
        throw new ApiError(404, "Video not found in the playlist");
    }
    playlist.videos = playlist.videos.filter(v => v.toString() !== videoId);
    await playlist.save();
    res.status(200).json(
        new ApiResponse(200, playlist, "Video removed from playlist successfully")
    )
})

//delete playlist
const deletePlaylist = asyncHandler(async (req, res) => {
    const { playlistId } = req.params
    if (!isValidObjectId(playlistId)) {
        throw new ApiError(400, "Invalid playlist ID");
    }
    
    const playlist = await Playlist.findById(playlistId);

    if (!playlist) {
        throw new ApiError(404, "Playlist not found");
    }

    if (playlist.owner.toString() !== req.user._id.toString()) {
        throw new ApiError(403, "You can only delete your own playlists");
    }

    await Playlist.deleteOne({ _id: playlistId });

    res.status(200).json(
        new ApiResponse(200, null, "Playlist deleted successfully")
    )
})

//update playlist
const updatePlaylist = asyncHandler(async (req, res) => {
    const { playlistId } = req.params
    const { name, description } = req.body
    if (!isValidObjectId(playlistId)) {
        throw new ApiError(400, "Invalid playlist ID");
    }

    if (!name && !description) {
        throw new ApiError(400, "At least one field (name or description) is required to update");
    }

    const playlist = await Playlist.findById(playlistId);

    if (!playlist) {
        throw new ApiError(404, "Playlist not found");
    }

    if (playlist.owner.toString() !== req.user._id.toString()) {
        throw new ApiError(403, "You can only update your own playlists");
    }

    if (name && name.trim() !== "") {
        playlist.name = name.trim();
    }

    if (description && description.trim() !== "") {
        playlist.description = description.trim();
    }
    
    await playlist.save();

    res.status(200).json(
        new ApiResponse(200, playlist, "Playlist updated successfully")
    )    
})

export {
    createPlaylist,
    getUserPlaylists,
    getPlaylistById,
    addVideoToPlaylist,
    removeVideoFromPlaylist,
    deletePlaylist,
    updatePlaylist
}