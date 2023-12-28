import { Card } from "../types/CardType";
import { GameData } from "./gameData";
import { possiblePlayerHandActions } from "./round";

export class Hand {
    public cards: Card[] = [];
    public bet: number;
    public winAmount: number | null = null;
    public playerHasDoubled: boolean = false;
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
        if (currentStack < this.bet) return false;

        return !this.playerHasDoubled;
    }

    // split the hand, return and remove the last card to be used in splitted handc
    public split(): Hand {
        if (!this.canSplit()) return null;

        let newH = new Hand(this.bet);
        newH.cards.push(this.cards.pop());

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
        if (this.cards.length != 2) return false;

        return (this.cards[0].numValue == 11) && (this.cards[1].numValue == 10);
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
            player.hands[h].possibleActions = possiblePlayerHandActions(game, player, h)
        }
    }
};