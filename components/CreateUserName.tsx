import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import CommonLayout from './CommonLayout';
import connectMongoDB from '@/lib/mongodb';
import { randomBytes } from 'crypto';
import User from "@/models/user";
import { NextResponse } from 'next/server';

type CreateUserNameProps = {
    token?: string,
    redirectUrl: string,
    h1?: string,
    h2?: string,
};

export default function CreateUserName({ token, redirectUrl, h1, h2 }: CreateUserNameProps) {
    const handleFormSubmit = async (formData: FormData) => {
        "use server";

        const rawFormData = {
            username: formData.get('username'),
        }

        await connectMongoDB();
        let Token = token;

        try {
            if (!token) {
                Token = randomBytes(100).toString('base64url');
            }

            await User.create({
                token: Token,
                username: rawFormData.username,
            });

            if (Token != undefined) {
                cookies().set('user_token', Token, { expires: Date.now() + 1000 * 60 * 60 * 24 * 365 });
                redirect(redirectUrl);
            }
        } catch (err: any) {
            console.log(err);
        }
    };

    return (
        <CommonLayout>
            {h1 && (
                <h1 className='mt-10 text-2xl font-bold'>{h1}</h1>
            )}
            {h2 && (
                <h2 className='mb-10'>{h2}</h2>
            )}
            <div className='w-[400px] p-6 bg-white border border-gray-200 rounded-lg shadow mt-10'>
                <form action={handleFormSubmit} className='max-w-sm mx-auto'>
                    <div className="mb-5">
                        <label htmlFor="username" className="block mb-2 text-sm font-medium text-gray-900">Username:</label>
                        <input
                            type="text"
                            id="username"
                            name="username"
                            className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5"
                            placeholder="Enter your username"
                            required
                        />
                    </div>

                    <button className='text-white bg-blue-700 hover:bg-blue-800 focus:ring-4 focus:ring-blue-300 font-medium rounded-lg text-sm px-5 py-2.5 me-2 mb-2 focus:outline-none m-1'>Save</button>
                </form>
            </div>
        </CommonLayout>
    );
}