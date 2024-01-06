import React from 'react';
import User from "@/models/user";
import { cookies } from 'next/headers';
import connectMongoDB from '@/lib/mongodb';
import CreateUserName from '@/components/CreateUserName';
import { redirect } from 'next/navigation';
import CommonLayout from '@/components/CommonLayout';

const getUserameFromToken = async (token: string) => {
    let user = await User.findOne({ token }).exec();

    if (!user) return null;

    return user.username;
}

export default async function CreatePage() {
    let user_token = cookies().get('user_token');
    await connectMongoDB();

    if (!user_token || !(await getUserameFromToken(user_token.value))) {
        return (
            <>
                <CreateUserName redirectUrl={`/create`} h1='Enter yout username' h2='Before you create the game'></CreateUserName>
            </>
        );
    }

    let username = await getUserameFromToken(user_token.value);

    const handleFormSubmit = async (formData: FormData) => {
        "use server";

        const rawFormData = {
            startingStack: formData.get('startingStack'),
            minBet: formData.get('minBet'),
            maxBet: formData.get('maxBet'),
        }

        let res = await fetch(process.env.BASE_PATH + '/api/game/create', {
            method: "POST",
            body: JSON.stringify({
                startingStack: rawFormData.startingStack,
                minBet: rawFormData.minBet,
                maxBet: rawFormData.maxBet,
                username,
                token: user_token?.value,
            }),
        });

        if (res.status == 201) {
            let json = JSON.parse(await res.json());

            redirect(`/game/${json.hash}`);
        }
    };

    return (
        <CommonLayout>
            <h1 className='mt-10 text-2xl font-bold'>Enter your game starting values</h1>
            <h2 className='mb-10'>And start the game</h2>

            <div className='w-[400px] p-6 bg-white border border-gray-200 rounded-lg shadow'>
                <form className="max-w-sm mx-auto" action={handleFormSubmit}>
                    <div className="mb-5">
                        <label htmlFor="startingStack" className="block mb-2 text-sm font-medium text-gray-900">Starting Stack</label>
                        <input
                            type="number"
                            id="startingStack"
                            name="startingStack"
                            className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5"
                            placeholder="Enter starting stack"
                            required
                        />
                    </div>
                    <div className="mb-5">
                        <label htmlFor="minBet" className="block mb-2 text-sm font-medium text-gray-900">Min Bet</label>
                        <input
                            type="number"
                            id="minBet"
                            name="minBet"
                            className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5"
                            placeholder="Enter minimum bet"
                            required
                        />
                    </div>
                    <div className="mb-5">
                        <label htmlFor="maxBet" className="block mb-2 text-sm font-medium text-gray-900">Max Bet</label>
                        <input
                            type="number"
                            id="maxBet"
                            name="maxBet"
                            className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5"
                            placeholder="Enter maximum bet"
                            required
                        />
                    </div>
                    <button type="submit" className="text-white bg-blue-700 hover:bg-blue-800 focus:ring-4 focus:outline-none focus:ring-blue-300 font-medium rounded-lg text-sm w-full sm:w-auto px-5 py-2.5 text-center">Create a game</button>
                </form>
            </div>
        </CommonLayout>
    )
}
