import * as sapper from '@sapper/server';
import bodyParser from 'body-parser';
import compression from 'compression';
import express from 'express';
import sirv from 'sirv';
import ws from 'ws';

const { PORT, NODE_ENV } = process.env;
const dev = NODE_ENV === 'development';

const server = express()
	.use(bodyParser.json())
	.use(compression({ threshold: 0 }), sirv('static', { dev }), sapper.middleware())
	.listen(PORT ? parseInt(PORT) : 3000, (err) => {
		if (err) console.log('error', err);
	});

const wss = new ws.Server({ server });
let zoom;
wss.on('connection', (ws) => {
	ws.send(
		JSON.stringify({
			type: 'INIT_ZOOM',
			zoom
		})
	);

	ws.on('message', (msg) => {
		wss.clients.forEach((client) => client.send(JSON.stringify({ recieved: msg })));
	});

	ws.on('message', (msg) => {
		console.log(JSON.parse(msg).zoom, zoom);
		if (JSON.parse(msg).type === 'ZOOM' && JSON.parse(msg).zoom !== zoom) {
			zoom = JSON.parse(msg).zoom;
			wss.clients.forEach((sock) => {
				if (sock !== ws) {
					sock.send(JSON.stringify({ type: 'ZOOM', zoom }));
				}
			});
		}
	});
});

wss.on('listening', () => console.log('WebSocket server listening on port', PORT));
