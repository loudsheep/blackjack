export type Card = {
    isBack?: boolean,
    suit: string,
    value: string,
    numValue: number,
};

export type IncomingData = {
    roomId: string,
    hash: string,
    token: string,
    username: string,
};

export type EmitEventFunction = (roomId: string | string[], event: string, data: any) => void;

export type PlayerPing = {
    pingMS: number,
    connected: boolean,
    missedPings?: number,
    respondedToLastPing?: boolean,
    lastPingTime?: number,
};