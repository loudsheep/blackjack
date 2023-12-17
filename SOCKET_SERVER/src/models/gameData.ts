import seedrandom from "seedrandom";
import { generateDeck } from "../game/cardDeck";
import { Card } from "../types/CardType";
import { randomBytes } from "crypto";

export type Player = {
    token: string,
    identifier: string,
    username: string,
    tablePosition: number,
    creator: boolean,
    stack: number,

    roundBet?: number,
    cards?: Card[][],
    participates?: boolean;
};

type Settings = {
    startingStack: number,
    minBet: number,
    maxBet: number,
};

type Hand = {
    // participants: {
    //     token: string,
    //     tablePosition: number,
    //     startingBet: number,
    //     cards: Card[][],
    // }[],
    // participantsTokens: string[],
    cardsLeftBefore: number,
    cardsLeftAfter: number,
};

export class GameData {
    public socketRoomId: string;
    public hash: string;
    public active: boolean;
    public gameStarted: boolean;

    public players: Player[];
    public currentHand: Hand;
    public settings: Settings;

    public shoe: Card[] = [];
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

    public getSafePlayersData() {
        let result = [];
        for (const pl of this.players) {
            result.push({
                identifier: pl.identifier,
                username: pl.username,
                tablePosition: pl.tablePosition,
                stack: pl.stack,
                cards: pl.cards,
                roundBet: pl.roundBet,
                participates: pl.participates,
            });
        }
        return result;
    }

    public generateRandomShoe(decksUsed: number, seed: string = null) {
        if (decksUsed < 1) return;
        if (seed === null) seed = randomBytes(10).toString("hex");

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

    public resetCurrentHand() {
        this.currentHand = {
            // participants: [],
            // participantsTokens: [],
            cardsLeftBefore: this.cardsLeftInShoe(),
            cardsLeftAfter: this.cardsLeftInShoe(),
        };

        this.players.forEach((pl) => {
            pl.cards = undefined;
            pl.roundBet = undefined;
            pl.participates = undefined;
        });
    }

    public placeBet(amount: number, token: string): boolean {
        let player = this.getPlayer(token);

        if (!player) return false;

        if (player.roundBet != undefined) return false;

        player.cards = [];
        player.roundBet = amount;
        player.stack -= amount;
        player.participates = true;

        return true;

        // let alreadyPutBet = false;
        // this.currentHand.participants.forEach((elem) => {
        //     if (elem.token == token) alreadyPutBet = true;
        // })

        // if (!alreadyPutBet) {
        //     this.currentHand.participantsTokens.push(token);
        //     this.currentHand.participants.push({
        //         token,
        //         tablePosition: player.tablePosition,
        //         startingBet: amount,
        //         cards: [],
        //     });
        // }
    }

    public startRound() {
        this.players.forEach((pl) => {
            if (pl.participates !== true) {
                pl.participates = false;
            }
        });
    }

    public getPlayer(token: string) {
        for (const pl of this.players) {
            if (pl.token === token) {
                return pl;
            }
        }
        return null;
    }

    public cardsLeftInShoe(): number {
        return this.shoe.length;
    }

    public drawCard(): Card {
        if (this.shoe.length <= 0) throw new Error("Drawing card from empty shoe");

        this.currentHand.cardsLeftAfter--;
        return this.shoe.shift();
    }
}