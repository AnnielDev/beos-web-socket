
const baseURL = "wss://ws.ifelse.io";
export type WebSocketEvent =
  | "open"
  | "message"
  | "error"
  | "close";

type ListenerCallback = (...args: any[]) => void;

export class WebSocketClient {
  private baseUrl: string;
  private url: string | null;
  private query?: any | null;
  private ws: WebSocket | null;
  private listeners: Partial<Record<WebSocketEvent, ListenerCallback[]>> = {};
  private protocols?: string | string[];

  constructor(url?: string, query?: any | null, protocols?: string | string[]) {
    this.baseUrl = baseURL;
    this.url = this.buildUrl(this.baseUrl, query, url);
    this.query = query;
    this.ws = null;
    this.listeners = {};
    this.protocols = protocols;
  }
  buildUrl(baseUrl: string, query?: any, url?: string): string {
    if (!query || !url) return '';
    const fullBase = baseUrl.replace(/\/$/, "") + (url.startsWith("/") ? url : `/${url}`);
    const params = new URLSearchParams(query).toString();
    return fullBase.includes("?") ? `${fullBase}&${params}` : `${fullBase}?${params}`;
  }
  connect(): void {
    if (this.ws) return;
    this.ws = new WebSocket(this.url ? this.url : this.baseUrl, this.protocols);
    this.ws.onopen = () => {
      this.emit("open");
    };

    this.ws.onmessage = (event: MessageEvent) => {
      try {
        this.emit("message", event);
      } catch (e) {
        this.emit("error", e);
      }
    };

    this.ws.onerror = (error: Event) => {
      this.emit("error", error);
    };
    this.ws.onclose = (event: CloseEvent) => {
      this.emit("close", event);
      this.ws = null;
    };
  }
  setPath(path: string, query = null) {
    const base = this.baseUrl.replace(/\/$/, "");
    const route = path.startsWith("/") ? path : `/${path}`;
    this.url = this.buildUrl(base + route, query || this.query);
  }

  send(data: any): void {
    if (this.ws && this.ws.readyState === WebSocket.OPEN) {
      const payload = typeof data === "string" ? data : JSON.stringify(data);
      this.ws.send(payload);
    }
  }

  close(): void {
    if (this.ws) {
      this.ws.close();
    }
  }

  on(event: WebSocketEvent, callback: ListenerCallback): void {
    if (!this.listeners[event]) {
      this.listeners[event] = [];
    }
    this.listeners[event].push(callback);
  }

  emit(event: WebSocketEvent, ...args: any[]): void {
    if (this.listeners[event]) {
      this.listeners[event].forEach((cb) => cb(...args));
    }
  }
}
