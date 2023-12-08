let mongoose = require('mongoose');

const GameSchema = new mongoose.Schema(
    {
        hash: {
            type: String,
            required: true,
            unique: true,
        },
        active: {
            type: Boolean,
            required: true,
            default: true,
        },
        socketRoomId: {
            type: String,
            required: true,
            unique: true,
        },
        gameStarted: {
            type: Boolean,
            required: true,
            default: false,
        },
        players: [
            {
                token: {
                    type: String,
                    required: true,
                },
                username: {
                    type: String,
                    required: true,
                },
                table_position: {
                    type: Number,
                    required: true,
                },
                creator: {
                    type: Boolean,
                    required: true,
                    default: false,
                }
            }
        ]
    },
    { timestamps: true },
);

export default mongoose.models.Game || mongoose.model("Game", GameSchema);