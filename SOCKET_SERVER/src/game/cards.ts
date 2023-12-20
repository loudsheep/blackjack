import seedrandom from "seedrandom";
import { Card } from "../types/CardType";
import { GameData } from "./gameData";
import { randomBytes } from "crypto";


export function generateDeck(): Card[] {
    const suits: string[] = ['hearts', 'diamonds', 'clubs', 'spades'];
    const values: string[] = ['2', '3', '4', '5', '6', '7', '8', '9', '10', 'jack', 'queen', 'king', 'ace'];

    const deck: Card[] = [];

    suits.forEach((suit) => {
        values.forEach((value) => {
            let numValue: number;

            if (value === 'jack' || value === 'queen' || value === 'king') {
                numValue = 10;
            } else if (value === 'ace') {
                // TODO ace can be 1 OR 11
                numValue = 11;
            } else {
                numValue = parseInt(value, 10);
            }

            const card: Card = {
                suit,
                value,
                numValue,
            };

            deck.push(card);
        });
    });

    return deck;
}

export const cardsLeftInShoe = (game: GameData): number => {
    return game.shoe.length;
}

export const drawCard = (game: GameData): Card => {
    if (game.shoe.length <= 0) throw new Error("Drawing card from empty shoe");

    game.currentRound.cardsLeftAfter--;
    return game.shoe.shift();
}

export const generateRandomShoe = (game: GameData, decksUsed: number, seed: string = null) => {
    if (decksUsed < 1) return;
    if (seed === null) seed = randomBytes(10).toString("hex");

    let shoe: Card[] = [];
    for (let i = 0; i < decksUsed; i++) {
        shoe.push(...generateDeck());
    }

    game.seedsUsed.push(seed);
    let rng = seedrandom(seed);

    for (let i = shoe.length - 1; i > 0; i--) {
        const j = Math.floor(rng() * (i + 1));
        [shoe[i], shoe[j]] = [shoe[j], shoe[i]];
    }

    game.shoe = shoe;
}