"use client";

import { SocketIncomingData } from "@/types/SocketIncomingDataType";
import { useEffect, useState } from "react";
import { io } from "socket.io-client";

import '../styles/blackjack.css';
import BeforeGameStarts from "./BeforeGameStarts";
import logo from "./images/dealer_shoe.png";

type BlackjacjGameProps = {
    token: string,
    gameHash: string,
    username: string,
    roomId: string,
    currentUserIsCreator: boolean
};

type NewUserType = {
    token: string,
    creator: boolean,
    username: string,
    stack: number,
    tablePosition: number,
};

export default function BlackjackGame(props: BlackjacjGameProps) {
    const [showWaitingForGameToStart, setShowWaitingForGameToStart] = useState<boolean>(true);
    const [playersJoined, setPlayersJoined] = useState<NewUserType[]>([]);

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
        joinRoom();

        socket.on('new_user', (data: NewUserType[]) => {
            console.log(data);

            setPlayersJoined(data);
        });

        socket.on('game_started', () => {
            setShowWaitingForGameToStart(false);
        });
    }, []);

    if (showWaitingForGameToStart) {
        return (
            <BeforeGameStarts players={playersJoined}></BeforeGameStarts>
        );
    }

    return (
        <>
            {/* <div className="body"> */}
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
                        <div className="dealer_cards">
                            <div className="dealer_card"></div>
                        </div>
                    </div>
                    <div className="deck">
                        {/* trzeba urzyć atrybutu logo.src żeby działało */}
                        <img src={logo.src} alt="aha" />
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

                {/* taki ciekawy button znalazłem
                <button className="bg-green-950 text-green-400 border border-green-400 border-b-4 font-medium overflow-hidden relative px-4 py-2 rounded-md hover:brightness-150 hover:border-t-4 hover:border-b active:opacity-75 outline-none duration-300 group">
                    <span className="bg-green-400 shadow-green-400 absolute -top-[150%] left-0 inline-flex w-80 h-[5px] rounded-md opacity-50 group-hover:top-[150%] duration-500 shadow-[0_0_10px_10px_rgba(0,0,0,0.3)]"></span>
                    Hover Me
                </button> */}



            </div>
            <div className="lover_table">
                <div className="action_buttons_space">
                    <button>DOUBLE</button>
                    <button>SPLIT</button>
                    <button>STAND</button>
                    <button>HIT</button>
                </div>
            </div>
            {/* </div> */}
        </>
    );
}