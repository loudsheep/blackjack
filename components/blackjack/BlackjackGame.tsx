"use client";

import { SocketIncomingData } from "@/types/SocketIncomingDataType";
import { useEffect, useState } from "react";
import { io } from "socket.io-client";

// import do nowego pliku z CSS
import '../styles/blackjack.css';

type BlackjacjGameProps = {
    token: string,
    gameHash: string,
    username: string,
    roomId: string,
};

export default function BlackjackGame(props: BlackjacjGameProps) {
    const [showSpinner, setShowSpinner] = useState<boolean>(false);

    const socket = io("http://localhost:3001");

    const joinRoom = () => {
        let data: SocketIncomingData = {
            roomId: props.roomId,
            hash: props.gameHash,
            token: props.token,
            username: props.username,
        };

        socket.emit('join_room', data);
    };

    useEffect(() => {
        // joinRoom();
    }, []);

    return (
        <>
        <body>
            <div className="header">
                <div>Game</div>
                <div>Shop</div>
                <div>Rules</div>
                <div>Profile</div>
            </div>
            <div className="table">
                <div className="dealer">
                    <div>
                    </div>
                    <div><p>Dealer</p><p>cards</p>
                        <div className="cards">
                            <div className="card"></div>
                        </div>
                    </div>
                    <div className="deck">
                    </div>
                </div>
                <div className="players">
                    <div>
                        <div><p>Player 1</p><p>cards</p></div>
                        <div className="cards">
                            <div className="card"></div>
                        </div>
                    </div>
                    <div>
                        <div><p>Player 2</p><p>cards</p></div>
                        <div className="cards">
                            <div className="card"></div>
                        </div>
                    </div>
                    <div>
                        <div><p>Player 3</p><p>cards</p></div>
                        <div className="cards">
                            <div className="card"></div>
                        </div>
                    </div>
                    <div>
                        <div><p>Player 4</p><p>cards</p></div>
                        <div className="cards">
                            <div className="card"></div>
                        </div>
                    </div>
                    <div>
                        <div><p>Player 5</p><p>cards</p></div>
                        <div className="cards">
                            <div className="card"></div>
                        </div>
                    </div>
                    
                </div>
                <div className="action_buttons_space">
                    <button>DOUBLE</button>
                    <button>SPLIT</button>
                    <button>STAND</button>
                    <button>HIT</button>
                </div>
            </div>
            
        </body>
        </>
    );
}