import * as sapper from '@sapper/server';
import bodyParser from 'body-parser';
import compression from 'compression';
import polka from 'polka';
import sirv from 'sirv';
import ws from 'ws';

const { PORT, NODE_ENV } = process.env;
const dev = NODE_ENV === 'development';

polka() // You can also use Express
	.use(bodyParser.json())
	.use(compression({ threshold: 0 }), sirv('static', { dev }), sapper.middleware())
	.listen(PORT ? parseInt(PORT) : 3000, (err) => {
		if (err) console.log('error', err);
	});

const wss = new ws.Server({ port: parseInt(PORT) + 2000 });
wss.on('connection', (ws) => {
	console.log('hi');
	ws.send('hi');
});
