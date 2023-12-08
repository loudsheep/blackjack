import mongoose from "mongoose";

const UserSchema = new mongoose.Schema(
    {
        token: {
            type: String,
            required: true,
            unique: true,
        },
        username: {
            type: String,
            required: true,
            default: true,
        },
    },
    { timestamps: true },
);

export default mongoose.models.User || mongoose.model("User", UserSchema);