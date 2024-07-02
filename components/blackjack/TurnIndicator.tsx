import React from 'react'

type TurnIndicatorProps = {
    show?: boolean;
};

export default function TurnIndicator({ show }: TurnIndicatorProps) {
    if(show === false) {
        return <></>
    }

    return (
        <div className='w-3/4 h-2 border-b-4 border-l-2 border-r-2 border-yellow-400 rounded-b-md'>&nbsp;</div>
    )
}
