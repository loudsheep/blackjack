import { cardsLeftInShoe, drawCard, getDealerCards } from "./cards";
import { Card } from "../types/CardType";
import { Player, getParticipants, getPlayer, getSafePlayersData } from "./players";
import { Hand } from "./hand";

type Settings = {
    startingStack: number,
    minBet: number,
    maxBet: number,
};

type Round = {
    participants: Player[],
    cardsLeftBefore: number,
    cardsLeftAfter: number,
    currentPlayerIndex?: number;
    currentPlayerHandIndex?: number;
};

export class GameData {
    // basic game info
    public socketRoomId: string;
    public hash: string;
    public active: boolean;
    public gameStarted: boolean;

    // players, settings, currentRound
    public players: Player[];
    public bannedPlayers: string[];
    public currentRound: Round;
    public settings: Settings;

    public shoe: Card[] = [];
    public seedsUsed: string[] = [];
    public dealerCards: Hand = new Hand(-1);
    public dealerCardsSum: number = 0;

    public pauseRequested: boolean = false;
    public bettingTime: boolean = false;
    public insuranceOpen: boolean = false;

    // timeouts
    public betsClosedTimeout: any = null;
    public betsClosedTimeoutStartTime: number | null = null;
    public pingForActiveHosts: any = null;

    // TODO
    public playerActionTimeout: any = null;

    public insuranceTimeout: any = null;
    public insuranceTimeoutStartTime: number | null = null;

    constructor(
        socketRoomId: string,
        hash: string,
        active: boolean,
        gameStarted: boolean,
        players: Player[],
        settings: Settings,
        bannedPlayers: string[],
    ) {
        this.socketRoomId = socketRoomId;
        this.hash = hash;
        this.active = active;
        this.gameStarted = gameStarted;
        this.players = players;
        this.settings = settings;
        this.bannedPlayers = bannedPlayers;
    }

    public gameUpdateData() {
        let obj: { [k: string]: any } = {
            players: getSafePlayersData(this),
            gameStarted: this.gameStarted,
            dealerCards: getDealerCards(this),
            dealerCardsSum: this.dealerCardsSum,
            cardsLeft: cardsLeftInShoe(this),
        };

        if (this.currentRound?.currentPlayerIndex >= 0) {
            obj.currentPlayer = this.currentRound.participants[this.currentRound.currentPlayerIndex].identifier;
            obj.currentHand = this.currentRound.currentPlayerHandIndex;
        }

        return obj;
    }
}