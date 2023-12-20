import { cardsLeftInShoe, drawCard } from "./cards";
import { Card } from "../types/CardType";
import { Player, getParticipants, getPlayer, getSafePlayersData } from "./players";

type Settings = {
    startingStack: number,
    minBet: number,
    maxBet: number,
};

type Hand = {
    participants: Player[],
    cardsLeftBefore: number,
    cardsLeftAfter: number,
};

export class GameData {
    // basic game info
    public socketRoomId: string;
    public hash: string;
    public active: boolean;
    public gameStarted: boolean;

    // players, settings, currentRound
    public players: Player[];
    public currentRound: Hand;
    public settings: Settings;

    public shoe: Card[] = [];
    public seedsUsed: string[] = [];
    public dealerCards: Card[] = [];

    public pauseRequested: boolean = false;

    // timeouts
    public betsClosedTimeout: any = null;

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

    // TODO finish this
    public getPlayerPossibleActions(token: string) {
        let player = getPlayer(this, token);

        if (player.cards.length == 0) return [];
        if (player.cards[0].length == 0) return [];

        let result = [];

    };

    public dealAllCards() {
        if (getParticipants(this).length == 0) return;

        for (let i = 0; i < 2; i++) {
            for (const player of this.players) {
                if (player.participates !== true) continue;

                if (player.cards.length == 0) {
                    player.cards.push([]);
                }

                player.cards[0].push(drawCard(this));
            }

            let dC = drawCard(this);
            if (i == 1) dC.isBack = true;
            this.dealerCards.push(dC);
        }
    }

    public getDealerCards() {
        let cards = [];
        for (const card of this.dealerCards) {
            if (card.isBack) {
                cards.push({
                    suit: 'back'
                });
            } else {
                cards.push({
                    suit: card.suit,
                    value: card.value,
                    numValue: card.numValue,
                });
            }
        }
        return cards;
    }

    public gameUpdateData() {
        return {
            players: getSafePlayersData(this),
            gameStarted: this.gameStarted,
            dealerCards: this.getDealerCards(),
            cardsLeft: cardsLeftInShoe(this),
        };
    }
}