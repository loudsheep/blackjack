import seedrandom from "seedrandom";
import { generateDeck } from "../game/cardDeck";
import { Card } from "../types/CardType";

type Player = {
    token: string,
    identifier: string,
    username: string,
    tablePosition: number,
    creator: boolean,
    stack: number,
};

type Settings = {
    startingStack: number,
    minBet: number,
    maxBet: number,
};

export class GameData {
    public socketRoomId: string;
    public hash: string;
    public active: boolean;
    public gameStarted: boolean;

    public players: Player[];
    public settings: Settings;

    public shoe: Card[];
    private seedsUsed: string[] = [];

    constructor(
        socketRoomId: string,
        hash: string,
        active: boolean,
        gameStarted: boolean,
        players: Player[],
        settings: Settings
    ) {
        this.socketRoomId = socketRoomId;
        this.hash = hash;
        this.active = active;
        this.gameStarted = gameStarted;
        this.players = players;
        this.settings = settings;
    }

    public addPlayer(player: Player) {
        this.players.push(player);
    }

    public generateRandomShoe(decksUsed: number, seed: string) {
        if (decksUsed < 1) return;

        let shoe: Card[] = [];
        for (let i = 0; i < decksUsed; i++) {
            shoe.push(...generateDeck());
        }

        this.seedsUsed.push(seed);
        let rng = seedrandom(seed);

        for (let i = shoe.length - 1; i > 0; i--) {
            const j = Math.floor(rng() * (i + 1));
            [shoe[i], shoe[j]] = [shoe[j], shoe[i]];
        }

        this.shoe = shoe;
    }
}