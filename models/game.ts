import mongoose from "mongoose";

const GameSchema = new mongoose.Schema(
    {
        hash: {
            type: String,
            required: true,
        },
        active: {
            type: Boolean,
            required: true,
            default: true,
        },
        players: [
            {
                token: {
                    type: String,
                    required: true,
                }
            }
        ],
    },
    { timestamps: true },
);

export default mongoose.models.Game || mongoose.model("Game", GameSchema);