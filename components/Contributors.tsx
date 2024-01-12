'use client';

import React, { useEffect, useState } from 'react';

type ContributorsProps = {
    url: string,
};

type GithubUserObject = {
    login: string,
    avatar_url: string,
    html_url: string,
    contributions: string,
};

export default function Contributors(props: ContributorsProps) {
    const [contributors, setContributors] = useState<GithubUserObject[]>([]);

    const fetchContributors = async () => {
        try {
            const response = await fetch(`${props.url}/contributors`);
            if (response.ok) {
                setContributors(await response.json());
            } else {
                console.error('Failed to fetch contributors');
            }
        } catch (error) {
            console.error('Error fetching contributors:', error);
        }
    };

    useEffect(() => {
        fetchContributors();
    }, [props.url]);

    return (
        <div>
            <h1 className='my-10 text-2xl font-bold'>This wonderfull game was created by these guys:</h1>

            <div>
                {contributors.map((contrib, idx) => (
                    <div className="rounded overflow-hidden shadow-lg bg-green-600  m-4">
                        <div className="flex items-center p-4">
                            <img
                                src={contrib.avatar_url}
                                alt={contrib.login}
                                className="w-32 h-32 rounded-full mr-4"
                            />
                            <div>
                                <div className="font-bold text-xl mb-2">{contrib.login}</div>
                                {contrib.contributions && (
                                    <p className="text-gray-700 text-base">
                                        With {contrib.contributions} Contributions
                                    </p>
                                )}
                                <a
                                    href={contrib.html_url}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-1 px-2 rounded mt-2 inline-block"
                                >
                                    View Profile
                                </a>
                            </div>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    )
}
