import { Card } from "../types/CardType";

export class Hand {
    public cards: Card[] = [];
    public bet: number;
    public playerHasDoubled: boolean = false;

    constructor(bet: number) {
        this.bet = bet;
    }

    // check if this hand can be split
    public canSplit(): boolean {
        if (this.cards.length != 2) return false;

        return true;

        return this.cards[0].numValue === this.cards[1].numValue;
    }

    public canDouble(currentStack: number, thisRoundBet: number): boolean {
        if (currentStack < thisRoundBet) return false;

        return !this.playerHasDoubled;
    }

    // split the hand, return and remove the last card to be used in splitted handc
    public split(): Hand {
        if (!this.canSplit()) return null;

        let newH = new Hand(this.bet);
        newH.cards.push(this.cards.pop());

        return newH;
    }

    public isBlackjackHand(): boolean {
        if (this.cards.length != 2) return false;

        return (this.cards[0].numValue == 11) && (this.cards[1].numValue == 10);
    }

    public toObject() {
        return {
            cards: this.cards,
            bet: this.bet,
            isDoubled: this.playerHasDoubled,
        }
    }
}