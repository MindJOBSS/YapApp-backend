import mongoose, { Document, Schema } from "mongoose";

export interface userDocument extends Document {
    email: String;
    password: String;
    fullName: string;
    profilePic?: String;
}

const userSchema = new Schema<userDocument>({
    email: {
        type: String,
        required: true,
        unique: true,
        trim: true,
    },
    password: {
        type: String,
        required: true,
        minlength: 6,
    },
    fullName: {
        type: String,
        required: true,
        trim: true,
    },
    profilePic: {
        type: String,
        default: "",
    },
}, {
    timestamps: true, 
})

export const User = mongoose.model<userDocument>("User", userSchema);