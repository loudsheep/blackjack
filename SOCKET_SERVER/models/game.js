"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
// let mongoose = require('mongoose');
var mongoose_1 = require("mongoose");
var GameSchema = new mongoose_1.default.Schema({
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
exports.default = mongoose_1.default.models.Game || mongoose_1.default.model("Game", GameSchema);
