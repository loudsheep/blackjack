import Game from "@/models/game";
import connectMongoDB from "@/lib/mongodb";
import { NextRequest, NextResponse } from "next/server";
import { randomBytes } from "crypto";
import { cookies } from 'next/headers'

export const POST = async (request: NextRequest) => {
    let { gameHash, token, username } = await request.json();

    await connectMongoDB();

    try {
        let game = await Game.findOne({ hash: gameHash }).exec();

        if (!game) {
            return new NextResponse("Game not found", {
                status: 404,
            });
        }

        if (!token) {
            token = randomBytes(100).toString('base64url');
            cookies().set('token', token);
        }

        game.players.push({
            token,
            username,
            tablePosition: game.players.length,
            creator: false
        });

        await game.save();

        return new NextResponse("User added", {
            status: 201,
        });
    } catch (err: any) {
        return new NextResponse(err.message, {
            status: 500,
        });
    }
};