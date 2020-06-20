import * as sapper from '@sapper/server';
import bodyParser from 'body-parser';
import compression from 'compression';
import polka from 'polka';
import sirv from 'sirv';
import ws from 'ws';

const { PORT, NODE_ENV } = process.env;
const dev = NODE_ENV === 'development';

const server = polka() // You can also use Express
	.use(bodyParser.json())
	.use(compression({ threshold: 0 }), sirv('static', { dev }), sapper.middleware())
	.listen(PORT ? parseInt(PORT) : 3000, (err) => {
		if (err) console.log('error', err);
	});

const wss = new ws.Server({ port: parseInt(PORT) + 2000, server });
wss.on('connection', (ws) => {
	ws.send(
		JSON.stringify({
			message: 'hi'
		})
	);

	ws.on('message', (msg) => {
		wss.clients.forEach((client) => client.send(JSON.stringify({ recieved: msg })));
	});
});

wss.on('listening', () => console.log('WebSocket server listening on port', parseInt(PORT) + 2000));
