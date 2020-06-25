import * as sapper from '@sapper/server';
import * as BABYLON from 'babylonjs';
import { MeshBuilder } from 'babylonjs';
import bodyParser from 'body-parser';
import compression from 'compression';
import express from 'express';
import sirv from 'sirv';
import ws from 'ws';
import { diffPos } from '../util/utils';

const { PORT, NODE_ENV } = process.env;
const dev = NODE_ENV === 'development';

const server = express()
	.use(bodyParser.json())
	.use(compression({ threshold: 0 }), sirv('static', { dev }), sapper.middleware())
	.listen(PORT ? parseInt(PORT) : 3000, (err) => {
		if (err) console.log('error', err);
	});

const babylon = new BABYLON.Scene(new BABYLON.NullEngine());
const ground = MeshBuilder.CreateGround('ground', { width: 5, height: 5 });
ground.position.y -= 1;

const wss = new ws.Server({ server });
let boxPos = {
	x: 0,
	y: 0,
	z: 0
};
let zoom = 1;
wss.on('connection', (ws) => {
	ws.send(
		JSON.stringify({
			zoom,
			type: 'INIT',
			position: boxPos
		})
	);

	ws.on('message', (msg) => {
		if (JSON.parse(msg).type === 'POS' && diffPos(JSON.parse(msg).position, boxPos)) {
			boxPos = JSON.parse(msg).position;
		} else if (JSON.parse(msg).type === 'ZOOM' && JSON.parse(msg).zoom !== zoom) {
			zoom = JSON.parse(msg).zoom;
		}
	});
});

setInterval(() => {
	wss.clients.forEach((ws) => {
		ws.send(JSON.stringify({ type: 'POS', position: boxPos }));
		ws.send(JSON.stringify({ type: 'ZOOM', zoom }));
	});
}, 25);

wss.on('listening', () => console.log('WebSocket server listening on port', PORT));
