import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import CommonLayout from './CommonLayout';

type CreateUserNameProps = {
    token?: string,
    redirectUrl: string,
};

export default function CreateUserName({ token, redirectUrl }: CreateUserNameProps) {
    const handleFormSubmit = async (formData: FormData) => {
        "use server";

        const rawFormData = {
            username: formData.get('username'),
        }

        let res = await fetch(process.env.BASE_PATH + '/api/game/register', {
            method: "POST",
            body: JSON.stringify({
                username: rawFormData.username,
                token,
            }),
        });

        if (res.status == 201) {
            let json = JSON.parse(await res.json());
            cookies().set('user_token', json.token, { expires: Date.now() + 1000 * 60 * 60 * 24 * 365 });

            redirect(redirectUrl);
        }
    };

    return (
        <CommonLayout>
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