import Game from "@/models/game";
import User from "@/models/user";
import connectMongoDB from "@/lib/mongodb";
import { NextRequest, NextResponse } from "next/server";
import { randomBytes } from "crypto";
import { cookies } from 'next/headers'

export const POST = async (request: NextRequest) => {
    let { startingStack, minBet, maxBet, token, username } = await request.json();

    await connectMongoDB();

    try {
        let user = await User.findOne({ token }).exec();

        if (!user) return new NextResponse("User token missing or incorrect token", { status: 400 });

        let hash = randomBytes(5).toString('base64url');
        let socketRoomId = randomBytes(16).toString('base64url');

        await Game.create({
            hash,
            active: true,
            socketRoomId,
            gameStarted: false,
            players: [
                {
                    token,
                    username,
                    tablePosition: 0,
                    creator: true,
                }
            ],
            settings: {
                startingStack,
                minBet,
                maxBet
            }
        });

        return NextResponse.json(
            JSON.stringify({
                hash,
                socketRoomId,
            }),
            { status: 201 }
        );
    } catch (err: any) {
        return new NextResponse(err.message, {
            status: 500,
        });
    }
};