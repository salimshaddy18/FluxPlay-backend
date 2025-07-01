import mongoose, { isValidObjectId } from "mongoose"
import { User } from "../models/user.model.js"
import { Subscription } from "../models/subscription.model.js"
import { ApiError } from "../utils/ApiError.js"
import { ApiResponse } from "../utils/ApiResponse.js"
import { asyncHandler } from "../utils/asyncHandler.js"


//toggle subscription
const toggleSubscription = asyncHandler(async (req, res) => {
    try {
        const { channelId } = req.params;
        const subscriberId = req.user._id;

        if (!mongoose.Types.ObjectId.isValid(channelId)) {
            throw new ApiError(400, "Invalid channel ID");
        }

        if (subscriberId.toString() === channelId.toString()) {
            throw new ApiError(400, "You cannot subscribe to your own channel");
        }

        const channelUser = await User.findById(channelId);
        if (!channelUser) {
            throw new ApiError(404, "Channel (user) not found");
        }

        const existingSubscription = await Subscription.findOne({
            subscriber: subscriberId,
            channel: channelId
        });

        if (existingSubscription) {
            await Subscription.deleteOne({ _id: existingSubscription._id });
            return res.status(200).json(
                { message: "Unsubscribed successfully" }
            );
        }
        else {
            const newSubscription = await Subscription.create({
                subscriber: subscriberId,
                channel: channelId
            });
            return res.status(201).json(
                { message: "Subscribed successfully" }
            );
        }
    }
    catch (err) {
        return res.status(400).json({
            err: err.message
        })
    }
})

const checkIsSubscribed = asyncHandler(async (req, res) => {
    const { channelId } = req.params;
    const subscriberId = req.user._id;

    const isSubscribed = await Subscription.exists({
        subscriber: subscriberId,
        channel: channelId,
    });

    return res.status(200).json(
        { message: "Subscription status fetched" }
    );
});

//controller to return subscriber list of a channel
const getUserChannelSubscribers = asyncHandler(async (req, res) => {
    const { channelId } = req.params

    if (!mongoose.Types.ObjectId.isValid(channelId)) {
        throw new ApiError(400, "Invalid channel id")
    }

    const userSubscribers = await Subscription.aggregate([
        {
            $match: {
                channel: new mongoose.Types.ObjectId(channelId),
            }
        },
        {
            $group: {
                _id: null,
                totalSubscribers: {
                    $sum: 1
                }
            }
        },
        {
            $project: {
                _id: 0,
                totalSubscribers: 1
            }
        }
    ])

    return res.status(200).json(
        new ApiResponse(200, userSubscribers[0] || { totalSubscribers: 0 }, "User channel subscribers fetched Successfully")
    )
})

// controller to return channel list to which user has subscribed
const getSubscribedChannels = asyncHandler(async (req, res) => {
    try {
        const { channelId } = req.params

        if (!mongoose.Types.ObjectId.isValid(channelId)) {
            throw new ApiError(400, "Invalid subscriber id")
        }

        const userChannels = await Subscription.aggregate([
            {
                $match: {
                    subscriber: new mongoose.Types.ObjectId(channelId)
                }
            },
            {
                $lookup: {
                    from: "users",
                    localField: "channel",
                    foreignField: "_id",
                    as: "subscribedTo",
                    pipeline: [
                        {
                            $project: {
                                fullName: 1,
                                username: 1,
                                avatar: 1,
                                bio: 1,
                                isSubscribed: 1,
                            }
                        }
                    ]
                }
            },
            {
                $addFields: {
                    subscribedTo: { $first: "$subscribedTo" },
                    subscriptionDate: "$createdAt"  // Preserve the subscription date
                }
            },
            {
                $lookup: {
                    from: "subscriptions",
                    let: { channelId: "$channel" },
                    pipeline: [
                        { $match: { $expr: { $eq: ["$channel", "$$channelId"] } } },
                        { $count: "count" }
                    ],
                    as: "subscriberCountArr"
                }
            },
            {
                $addFields: {
                    "subscribedTo.subscriberCount": {
                        $ifNull: [{ $arrayElemAt: ["$subscriberCountArr.count", 0] }, 0]
                    }
                }
            },
            {
                $replaceRoot: {
                    newRoot: {
                        $mergeObjects: ["$subscribedTo", { subscriptionDate: "$subscriptionDate" }]
                    }
                }
            },
            {
                $sort: {
                    "subscriptionDate": -1
                }
            }
        ])

        return res.status(201).json(
            {
                message: "Subscribed channels fetched Successfully",
                data:userChannels
            }
        )
    }
    catch (err) {
        return res.status(400).json({
            err: err.message ?? 'unknown message'
        })
    }
})

export {
    toggleSubscription,
    checkIsSubscribed,
    getUserChannelSubscribers,
    getSubscribedChannels,
}