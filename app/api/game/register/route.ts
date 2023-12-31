import Game from "@/models/game";
import User from "@/models/user";
import connectMongoDB from "@/lib/mongodb";
import { NextRequest, NextResponse } from "next/server";
import { randomBytes } from "crypto";
import { cookies } from 'next/headers'

export const POST = async (request: NextRequest) => {
    let { token, username } = await request.json();

    await connectMongoDB();

    try {
        if (!token) {
            token = randomBytes(100).toString('base64url');
        }

        await User.create({
            token,
            username,
        });

        return NextResponse.json(
            JSON.stringify({ token }),
            { status: 201 }
        );
    } catch (err: any) {
        return new NextResponse(err.message, {
            status: 500,
        });
    }
};