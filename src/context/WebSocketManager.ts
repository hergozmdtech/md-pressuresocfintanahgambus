// WebSocketManager.ts
import { getWebSocketUrl } from '../config'; // ✅ dynamic switching

type Callback = (msg: { tag: string; value: string; ts: string }) => void;

class WebSocketManager {
  private static instance: WebSocketManager;
  private ws: WebSocket | null = null;
  private callbacks: Map<string, Set<Callback>> = new Map();
  private connected = false;

  private constructor() {
    this.connect();
  }

  static getInstance() {
    if (!WebSocketManager.instance) {
      WebSocketManager.instance = new WebSocketManager();
    }
    return WebSocketManager.instance;
  }

  private connect() {
    const wsUrl = getWebSocketUrl();
    this.ws = new WebSocket(wsUrl);

    this.ws.onopen = () => {
      this.connected = true;
      this.sendSubscription();
    };

    this.ws.onmessage = (e) => {
      const msg = JSON.parse(e.data);
      const { tag } = msg;
      this.callbacks.get(tag)?.forEach(cb => cb(msg));
    };

    this.ws.onclose = () => {
      this.connected = false;
      setTimeout(() => this.connect(), 2000); // auto reconnect
    };
  }

  private sendSubscription() {
    const tags = Array.from(this.callbacks.keys());
    if (this.ws?.readyState === WebSocket.OPEN && tags.length > 0) {
      this.ws.send(JSON.stringify({ Subscribe: tags }));
    }
  }

  subscribe(tag: string, cb: Callback) {
    if (!this.callbacks.has(tag)) {
      this.callbacks.set(tag, new Set());
      if (this.connected) this.sendSubscription();
    }
    this.callbacks.get(tag)?.add(cb);
  }

  unsubscribe(tag: string, cb: Callback) {
    const set = this.callbacks.get(tag);
    if (set) {
      set.delete(cb);
      if (set.size === 0) {
        this.callbacks.delete(tag);
        if (this.connected) this.sendSubscription();
      }
    }
  }
}

export default WebSocketManager.getInstance();