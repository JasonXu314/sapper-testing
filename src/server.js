import * as sapper from '@sapper/server';
import * as BABYLON from 'babylonjs';
import { MeshBuilder } from 'babylonjs';
import bodyParser from 'body-parser';
import compression from 'compression';
import express from 'express';
import { writeFileSync } from 'fs';
import { resolve } from 'path';
import sirv from 'sirv';
import ws from 'ws';

// Load env variables
require('dotenv').config();

const { PORT, NODE_ENV } = process.env;
const dev = NODE_ENV === 'development';

let bin = null,
	gltf = null;

const app = express()
	.use(bodyParser.json())
	.get('/gltf/:file', (req, res) => {
		if (req.params.file === 'scene.bin') {
			res.status(200).header('Content-Type', 'application/octet-stream').send(Uint8Array.from(bin).buffer);
		} else {
			res.status(200).send(gltf);
		}
	})
	.use(compression({ threshold: 0 }), sirv('static', { dev }), sapper.middleware());
const scene = new BABYLON.Scene(new BABYLON.NullEngine());
const ground = MeshBuilder.CreateGround('ground', { width: 5, height: 5 }, scene);
ground.position.y -= 1;

const server = app.listen(PORT ? parseInt(PORT) : 3000, (err) => {
	if (err) console.log('error', err);
});

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
		try {
			const parsedMsg = JSON.parse(msg);
			if (parsedMsg.type === 'CAMERA_VIEW') {
				cameraView = parsedMsg.cameraView;
			} else if (parsedMsg.type === 'GLTF_EXPORT') {
				const data = parsedMsg.data;
				const binary = parsedMsg.bin;

				gltf = data;
				bin = JSON.stringify(binary);
				writeFileSync(resolve('.', 'static', 'gltf', 'scene.gltf'), data);
				writeFileSync(resolve('.', 'static', 'gltf', 'scene.bin'), Uint8Array.from(binary));
			} else if (parsedMsg.type === 'GLB_EXPORT') {
				const glb = parsedMsg.glb;

				writeFileSync(resolve('.', 'static', 'gltf', 'scene.glb'), glb);
			}
		} catch (err) {}
	});
});

setInterval(() => {
	wss.clients.forEach((ws) => {
		ws.send(JSON.stringify({ type: 'CAMERA_VIEW', cameraView }));
	});
}, 25);

wss.on('listening', () => console.log('WebSocket server listening on port', PORT));
