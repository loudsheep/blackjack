import { Card } from "../types/CardType";


export function generateDeck(): Card[] {
    const suits: string[] = ['Hearts', 'Diamonds', 'Clubs', 'Spades'];
    const values: string[] = ['2', '3', '4', '5', '6', '7', '8', '9', '10', 'J', 'Q', 'K', 'A'];

    const deck: Card[] = [];

    suits.forEach((suit) => {
        values.forEach((value) => {
            let numValue: number;

            if (value === 'J' || value === 'Q' || value === 'K') {
                numValue = 10;
            } else if (value === 'A') {
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