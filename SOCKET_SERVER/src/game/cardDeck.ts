import { Card } from "../types/CardType";


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