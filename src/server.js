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
import Entity from '../util/Entity.ts';

// Load env variables
require('dotenv').config();

const { PORT, NODE_ENV } = process.env;
const dev = NODE_ENV === 'development';

const server = express()
	.use(bodyParser.json())
	.use(compression({ threshold: 0 }), sirv('static', { dev }), sapper.middleware())
	.listen(PORT ? parseInt(PORT) : 3000, (err) => {
		if (err) console.log('error', err);
	});

const scene = new BABYLON.Scene(new BABYLON.NullEngine());
const ground = MeshBuilder.CreateGround('ground', { width: 5, height: 5 }, scene);
ground.position.y -= 1;

const entities = [new Entity(ground)];

// GLTF2Export.GLTFAsync(scene, 'scene').then((data) => {
// 	fs.writeFileSync('./scene.gltf', data.glTFFiles['scene.gltf']);
// });

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
				const bin = parsedMsg.bin;

				writeFileSync(resolve('.', 'static', 'gltf', 'scene.gltf'), data);
				writeFileSync(resolve('.', 'static', 'gltf', 'scene.bin'), Uint8Array.from(bin));
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
