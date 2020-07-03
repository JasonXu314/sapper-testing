import * as sapper from '@sapper/server';
import * as BABYLON from 'babylonjs';
import { MeshBuilder } from 'babylonjs';
import bodyParser from 'body-parser';
import compression from 'compression';
import express from 'express';
import sirv from 'sirv';
import ws from 'ws';

// Set up Env
require('dotenv').config();

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
let cameraView = {
	alpha: 0,
	beta: Math.PI * 2,
	radius: 10,
	targetPos: {
		x: 0,
		y: 0,
		z: 0
	}
};
wss.on('connection', (ws) => {
	ws.send(
		JSON.stringify({
			type: 'INIT',
			cameraView
		})
	);

	ws.on('message', (msg) => {
		if (JSON.parse(msg).type === 'CAMERA_VIEW') {
			cameraView = JSON.parse(msg).cameraView;
		}
	});
});

setInterval(() => {
	wss.clients.forEach((ws) => {
		ws.send(JSON.stringify({ type: 'CAMERA_VIEW', cameraView }));
	});
}, 25);

wss.on('listening', () => console.log('WebSocket server listening on port', PORT));
