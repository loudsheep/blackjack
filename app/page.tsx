export default function Home() {
    return (
        <div className="bg-green-500 h-screen flex flex-col items-center justify-start">
            <div
                className="absolute inset-0 bg-cover bg-center z-0"
                style={{ backgroundImage: 'url(/bg.png)', opacity: '0.1', zIndex: '2' }}
            ></div>
            {/* Navigation Bar */}
            <nav className="bg-green-800 w-full p-4 flex justify-between items-center" style={{ zIndex: '3' }}>
                <div className="text-white text-2xl font-bold">Your Blackjack Game</div>
                <div className="flex space-x-4">
                    <a href="/about" className="text-white">About</a>
                    <a href="https://github.com/your-github-repo" className="text-white">GitHub</a>
                </div>
            </nav>

            {/* Main Content */}
            <div className="flex flex-col items-start text-white">
                <div style={{zIndex: '3'}}>
                    <h1 className="text-4xl font-bold mb-6 mt-6">Welcome to Your Blackjack Game</h1>
                    <p className="text-lg mb-8">
                        Play blackjack with your friends! Join a game using a link or create a new game.
                    </p>

                    {/* Create Game Button */}
                    <button className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded cursor-pointer">
                        Create a Game
                    </button>
                </div>
            </div>
        </div>
    )
}
