"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var mongoose = require('mongoose');
var GameSchema = new mongoose.Schema({
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
}, { timestamps: true });
exports.default = mongoose.models.Game || mongoose.model("Game", GameSchema);
