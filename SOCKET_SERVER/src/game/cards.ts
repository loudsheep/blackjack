import seedrandom from "seedrandom";
import { Card } from "../types/CardType";
import { GameData } from "./gameData";
import { randomBytes } from "crypto";
import { Hand } from "./hand";


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
    if (game == undefined) console.log("UNMDEFINED GAME");
    if (game != undefined && game.shoe == undefined) {
        console.log("UNMDEFINED SHOE AND DEFIRED GAME");
        console.log(game.shoe, game);

    };


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

    game.shoe.push(...shoe);
}

export const dealToParticipants = (game: GameData) => {
    if (game.currentRound.participants.length == 0) return;

    for (let i = 0; i < 2; i++) {
        for (const player of game.currentRound.participants) {
            if (player.hands.length == 0) player.hands.push(new Hand(player.roundBet));

            player.hands[0].cards.push(drawCard(game));
        }

        let dC = drawCard(game);
        if (i == 1) dC.isBack = true;
        else game.dealerCardsSum = dC.numValue;
        game.dealerCards.cards.push(dC);
    }
};