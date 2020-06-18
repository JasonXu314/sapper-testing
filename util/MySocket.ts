/**
 * Simple wrapper around the native WebSocket object for easier usability.
 */
export default class MySocket {
	private readonly socket: WebSocket;

	constructor(url: string) {
		this.socket = new WebSocket(url);
	}

	/**
	 * Adds an event listener to the WebSocket, returning a method that will unsubscribe the event listener
	 * @param evt the event to listen to ('close', 'open', 'message', 'error')
	 * @param listener the event listener
	 * @returns an unsubscriber function
	 */
	on<K extends keyof WebSocketEventMap>(evt: K, listener: (evt: WebSocketEventMap[K]) => void): () => void {
		this.socket.addEventListener(evt, listener);
		return () => {
			this.socket.removeEventListener(evt, listener);
		};
	}

	/**
	 * Adds an event listener to the WebSocket, returning a method that will unsubscribe the event listener.
	 * In addition, the listener will be unsubscribed once it is triggered
	 * @param evt the event to listen to ('close', 'open', 'message', 'error')
	 * @param listener the event listener
	 * @returns an unsubscriber function
	 */
	once<K extends keyof WebSocketEventMap>(evt: K, listener: (evt: WebSocketEventMap[K]) => void): () => void {
		this.socket.addEventListener(evt, listener, { once: true });
		return () => {
			this.socket.removeEventListener(evt, listener);
		};
	}

	/**
	 * Sends an object through the WebSocket, after serializing it with JSON.stringify
	 * @param msg the object to send through the socket
	 */
	json<T>(msg: T): void {
		this.socket.send(JSON.stringify(msg));
	}

	/**
	 * Sends raw data through the WebSocket. Simply calls the underlying method on the WebSocket
	 * @param data the data to send through the WebSocket
	 */
	send(data: string | ArrayBuffer | SharedArrayBuffer | Blob | ArrayBufferView): void {
		this.socket.send(data);
	}

	/**
	 * Shortcut to add a listener specifically for the 'message' event
	 * @param listener the listener for the message event
	 * @returns an unsubscriber function
	 */
	onMsg<T extends EventWithTypes>(listener: (data: T) => void): () => void {
		return this.on('message', (evt) => {
			let data;
			try {
				data = JSON.parse(evt.data);
			} catch (_) {
				data = evt.data;
			}
			listener(data);
		});
	}

	/**
	 * Shortcut to add a listener specifically for the 'mesage' event
	 * In addition, the listener will be unsubscribed once it is triggered.
	 * @param listener the listener for the message event
	 * @returns an unsubscriber function
	 */
	onMsgOnce<T extends EventWithTypes>(listener: (data: T) => void): () => void {
		return this.once('message', (evt) => {
			listener(JSON.parse(evt.data));
		});
	}

	/**
	 * Adds an event listener that will only trigger if a message is received that has a type property set to the provided type
	 * In addition, the listener will be unsubscribed once it is triggered if a config is provided with the once property set to true
	 * @param type the message type to listen for (checked against the parsed JSON of the message)
	 * @param cb the listener for the message
	 * @param config the optional configuration for the listener
	 * @param config.once if set to true, will remove the event listener after it triggers
	 * @returns an unsubscriber function
	 */
	expect<T extends EventWithTypes>(type: T['type'], cb: (evt: T) => void, config?: { once: boolean }): () => void {
		if (config && config.once) {
			const unsubscribe = this.onMsg<T>((msg) => {
				if (msg.type === type) {
					cb(msg);
					unsubscribe();
				}
			});
			return unsubscribe;
		} else {
			return this.onMsg<T>((msg) => {
				if (msg.type === type) {
					cb(msg);
				}
			});
		}
	}

	/**
	 * A utility function to check if the WebSocket is ready
	 * @returns true, if the websocket is ready
	 */
	isReady(): boolean {
		return this.socket.readyState === WebSocket.OPEN;
	}
}
