import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';

type CreateUserNameProps = {
    gameHash: string,
    headerText?: string,
    token?: string
};

export default function CreateUserName({ headerText, gameHash, token }: CreateUserNameProps) {
    const handleFormSubmit = async (formData: FormData) => {
        "use server";

        const rawFormData = {
            username: formData.get('username'),
        }

        console.log({
            gameHash,
            username: rawFormData.username,
            token,
        });


        let res = await fetch(process.env.BASE_PATH + '/api/game/register', {
            method: "POST",
            body: JSON.stringify({
                gameHash,
                username: rawFormData.username,
                token,
            }),
        });

        if (res.status == 201) {
            let json = JSON.parse(await res.json());
            cookies().set('user_token', json.token, { expires: Date.now() + 60 * 60 * 24 * 365 });

            redirect(`/game/${gameHash}`);
        }
    };

    return (
        <div>
            {headerText && (
                <h1>{headerText}</h1>
            )}

            <form action={handleFormSubmit}>
                <label htmlFor="email" className="block mb-2 text-sm font-medium text-gray-900 m-1">Username:</label>
                <input type="text" id="username" name="username" className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block p-2.5 m-1" placeholder="Enter your username" required />

                <button className='text-white bg-blue-700 hover:bg-blue-800 focus:ring-4 focus:ring-blue-300 font-medium rounded-lg text-sm px-5 py-2.5 me-2 mb-2 focus:outline-none m-1'>Save</button>
            </form>
        </div>
    );
}