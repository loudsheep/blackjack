"use client";

import React from 'react';
import logo from "./images/dealer_shoe.png";
import '../styles/blackjack.css';

type GameTableProps = {

};

export default function GameTable({ }: GameTableProps) {
    return (
        <>
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
            </div>
            <div className="lover_table">
                <div className="action_buttons_space">
                    <button>DOUBLE</button>
                    <button>SPLIT</button>
                    <button>STAND</button>
                    <button>HIT</button>
                </div>
            </div>
        </>
    )
}
