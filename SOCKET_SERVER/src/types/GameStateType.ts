import { Card } from "./CardType";

type GameState = {
    cardsInShoe: number,
    dealerCards: Card[],
    players: {
        token: string,
        // identifier: string,
        username: string,
        tablePosition: number,
        stack: number,
        cards: Card[][], // each array fo cards represends 'minihand' (when player splits cards)
    }[],
    settings: {
        startingStack: number,
        minBet: number,
        maxBet: number,
    },
};