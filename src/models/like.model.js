import mongoose, {Schema} from "mongoose";

const likeSchema = new mongoose.Schema({
    video: {
        type: Schema.Types.ObjectId,
        ref: "Video",
        required: true
    },
    owner: {
        type: Schema.Types.ObjectId,
        ref: "User",
        required: true
    }
}, {timestamps: true}); 

export const Like = mongoose.model('Like', likeSchema);