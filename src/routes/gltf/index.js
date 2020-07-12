import { readFileSync } from 'fs';
import { join } from 'path';

export const get = (_, res) => {
	res.writeHead(200).end(
		JSON.stringify({ gltf: readFileSync(join('.', 'gltf', 'scene.gltf')).toString(), bin: readFileSync(join('.', 'gltf', 'scene.bin')).toString() })
	);
};
