import mongoose, { Schema } from "mongoose";
import jwt from "jsonwebtoken"
import bcrypt from "bcrypt"

const userSchema = new Schema(
    {
        username: {
            type: String,
            required: true,
            unique: true,
            lowercase: true,
            trim: true,
            index: true
        },
        email: {
            type: String,
            required: true,
            unique: true,
            lowecase: true,
            trim: true,
        },
        fullName: {
            type: String,
            required: true,
            trim: true,
            index: true
        },
        avatar: {
            type: String, // cloudinary url
            required: true,
        },
        coverImage: {
            type: String, // cloudinary url
        },
        watchHistory: [
            {
                type: Schema.Types.ObjectId,
                ref: "Video"
            }
        ],
        password: {
            type: String,
            required: [true, 'Password is required']
        },
        refreshToken: {
            type: String
        },
        likedVideos: [
            {
                type: Schema.Types.ObjectId,
                ref: "Video"
            }
        ],
        likedComments: [
            {
                type: Schema.Types.ObjectId,
                ref: "Comment"
            }
        ],
    },
    {
        timestamps: true
    }
)

// Before saving a user document to the database, execute this middleware
userSchema.pre("save", async function (next) {
    // Check if the 'password' field has been modified
    // If not, skip hashing and move to the next middleware
    if (!this.isModified("password")) return next();
    // If the password has been modified, hash it using bcrypt with a salt rounds value of 10
    this.password = await bcrypt.hash(this.password, 10);
    // Continue with the save operation
    next();
});


// Add a custom method to the user schema to verify if a given password is correct
userSchema.methods.isPasswordCorrect = async function (password) {
    // Compare the provided plain-text password with the hashed password stored in the database
    // bcrypt.compare returns true if they match, false otherwise
    return await bcrypt.compare(password, this.password);
};

userSchema.methods.generateAccessToken = function () {
    return jwt.sign(
        {
            _id: this._id,
            email: this.email,
            username: this.username,
            fullName: this.fullName
        },
        process.env.ACCESS_TOKEN_SECRET,
        {
            expiresIn: process.env.ACCESS_TOKEN_EXPIRY
        }
    )
}
userSchema.methods.generateRefreshToken = function () {
    return jwt.sign(
        {
            _id: this._id,

        },
        process.env.REFRESH_TOKEN_SECRET,
        {
            expiresIn: process.env.REFRESH_TOKEN_EXPIRY
        }
    )
}

export const User = mongoose.model("User", userSchema)
