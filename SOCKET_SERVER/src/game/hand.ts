import { Card } from "../types/CardType";
import { GameData } from "./gameData";
import { possiblePlayerHandActions } from "./round";

export class Hand {
    public cards: Card[] = [];
    public bet: number;
    public winAmount: number | null = null;
    public playerHasDoubled: boolean = false;
    public playerHasSplitted: boolean = false;
    public possibleActions: string[] = [];

    constructor(bet: number) {
        this.bet = bet;
    }

    // check if this hand can be split
    public canSplit(): boolean {
        if (this.cards.length != 2) return false;

        return this.cards[0].numValue === this.cards[1].numValue;
    }

    public canDouble(currentStack: number): boolean {
        if (this.cards.length > 2) return false;
        if (currentStack < this.bet) return false;

        return !this.playerHasDoubled;
    }

    // split the hand, return and remove the last card to be used in splitted handc
    public split(): Hand {
        if (!this.canSplit()) return null;

        let newH = new Hand(this.bet);
        newH.cards.push(this.cards.pop());

        this.playerHasSplitted = true;
        newH.playerHasSplitted = true;

        return newH;
    }

    public handValue(): number[] {
        let sum = 0;
        let numAces = 0;
        for (let i = 0; i < this.cards.length; i++) {
            if (this.cards[i].numValue == 11) numAces++;
            sum += this.cards[i].numValue;
        }

        // get every hand value for every ace being 1
        let result = [];
        for (let i = 0; i <= numAces; i++) {
            result.push(sum - 10 * i);
        }

        return result.sort();
    }

    public isBlackjackHand(): boolean {
        if (this.cards.length != 2 || this.playerHasSplitted) return false;

        return (this.cards[0].numValue + this.cards[1].numValue) == 21;
    }

    public toObject() {
        return {
            cards: this.cards,
            bet: this.bet,
            winAmount: this.winAmount,
            isDoubled: this.playerHasDoubled,
            handValue: this.handValue(),
        }
    }
}

export const calculateActionsForHands = (game: GameData) => {
    for (const player of game.currentRound.participants) {
        for (let h = 0; h < player.hands.length; h++) {
            let hand = player.hands[h];
            hand.possibleActions = possiblePlayerHandActions(game, player, h);

            if (hand.isBlackjackHand()) hand.winAmount = hand.bet * (3 / 2);
        }
    }
};