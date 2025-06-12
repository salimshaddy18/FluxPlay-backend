import moongoose, { Schema } from 'mongoose';

const subscriptionSchema = new moongoose.Schema({
    subscriber: {
        type: Schema.Types.ObjectId, //one who is subscribing
        ref: 'User'
    },
    channel: {
        type: Schema.Types.ObjectId, //one who is being subscribed by subscriber
        ref: 'User'
    }
}, { timestamps: true });

export const Subscription = moongoose.model('Subscription', subscriptionSchema);