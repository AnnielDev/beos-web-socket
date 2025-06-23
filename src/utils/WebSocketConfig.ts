import { WebSocketClient } from "./WebSocketClient";

type WebSocketHandlers = {
    open?: () => void;
    message?: (data: any) => void;
    error?: (err: any) => void;
    close?: (event?: CloseEvent) => void;
};
interface Props {
    url?: string;
    query?: any;
    protocols?: string | string[];
    handlers: WebSocketHandlers
}

const webSocketConnection = (
    props: Props,
): WebSocketClient => {
    const wsc = new WebSocketClient(props.url, props.query, props.protocols);
    wsc.connect();

    if (props.handlers?.open) {
        wsc.on("open", props.handlers.open);
    }

    if (props.handlers?.message) {
        wsc.on("message", (event) => {
            props.handlers.message?.({ event, data: JSON.parse(event.data) });
        });
    }

    if (props.handlers?.error) {
        wsc.on("error", props.handlers.error);
    }

    if (props.handlers?.close) {
        wsc.on("close", props.handlers.close);
    }

    return wsc;
};

export { WebSocketClient, webSocketConnection };
