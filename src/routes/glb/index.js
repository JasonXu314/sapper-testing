import { readFileSync } from 'fs';
import { join } from 'path';

export const get = (_, res) => {
	res.writeHead(200).end(JSON.stringify({ glb: readFileSync(join('.', 'gltf', 'scene.glb')).toString() }));
};
