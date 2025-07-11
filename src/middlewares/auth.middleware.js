import { ApiError } from '../utils/ApiError.js';
import { asyncHandler } from "../utils/asyncHandler.js";
import jwt from "jsonwebtoken"
import { User } from "../models/user.model.js";

// Middleware to verify JWT and authenticate the user
export const verifyJWT = asyncHandler(async (req, _, next) => {
    try {
        // Try to extract the token from either cookies or the Authorization header
        console.log(req.cookies?.accessToken);
        
        const token = req.cookies?.accessToken || req.header("Authorization")?.replace("Bearer ", "");

        // If no token is provided, throw an unauthorized error
        if (!token) {
            console.log("Token not found");
            
            throw new ApiError(401, "Unauthorized request");
        }

        // Verify the token using the secret key from environment variables
        const decodedToken = jwt.verify(token, process.env.ACCESS_TOKEN_SECRET);

        // Find the user associated with the token, excluding sensitive fields like password and refreshToken
        const user = await User.findById(decodedToken?._id).select("-password -refreshToken");

        // If no such user exists (invalid token), throw an error
        if (!user) {
            throw new ApiError(401, "Invalid Access Token");
        }

        // Attach the user object to the request so that the next middleware or route handler can access it
        req.user = user;

        // Proceed to the next middleware or route handler
        next();
    }
    catch (error) {
        // If any error occurs during verification or user lookup, throw a generic unauthorized error
        throw new ApiError(401, error?.message || "Invalid access token");
    }
});
