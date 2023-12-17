"use client";

type CardProps = {
    suit: string,
    value?: string,
    className?: string,
    style?: {},
};

export default function Card(props: CardProps) {
    if (props.suit === "back") {
        return (
            <img src={`/cards/back.svg`} alt="" className={props.className} style={props.style} />
        );
    }

    return (
        <img src={`/cards/${props.value}_of_${props.suit}.svg`} alt="" className={props.className} style={props.style} />
    )
}
