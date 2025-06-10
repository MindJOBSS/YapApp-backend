import mongoose, { Document } from "mongoose";


export interface messageDocument extends Document{
    senderId: mongoose.Types.ObjectId;
    receiverId: mongoose.Types.ObjectId;
    text?: string;
    image?: string;
}

const messageSchema = new mongoose.Schema<messageDocument>({
    senderId: {
        type: mongoose.Schema.Types.ObjectId,
        required: true,
        ref: "User",
    },
    receiverId: {
        type: mongoose.Schema.Types.ObjectId,
        required: true,
        ref: "User",
    },
    text: {
        type: String,
    },
    image: {
        type: String,
    },
}, {
    timestamps: true,
});

export const Message = mongoose.model<messageDocument>("Message", messageSchema);