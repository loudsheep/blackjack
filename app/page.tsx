import CommonLayout from "@/components/CommonLayout"

export default function Home() {
    return (
        <CommonLayout>
            <h1 className="text-4xl font-bold mb-6 mt-6">Welcome to Your Blackjack Game</h1>
            <p className="text-lg mb-8">
                Play blackjack with your friends! Join a game using a link or create a new game.
            </p>

            <a href="/create">
                <button
                    className="relative bg-gradient-to-b from-red-700 to-red-800 hover:from-red-800 hover:to-red-900 text-white font-bold py-2 px-4 rounded-md shadow-md transition-all duration-300"
                    style={{ border: '2px solid #440000' }}
                >
                    <div className="flex items-center justify-center space-x-2">
                        <span className="text-xl">&#127183;</span>
                        <span>Create a new game</span>
                    </div>
                </button>
            </a>
        </CommonLayout>
    )
}
