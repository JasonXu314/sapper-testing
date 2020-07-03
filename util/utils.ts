import { Position } from '../types';

// export function diffPos(pos1: Position, pos2: Position): boolean {
// 	return pos1.x !== pos2.x || pos1.y !== pos2.y || pos1.z !== pos2.z;
// }

export function normalize<T extends Position>(arr: T[]): T[] {
	// Extract normalization displacement from first
	const { x: nX, y: nY, z: nZ } = arr[0];

	arr.forEach((item) => {
		item.x = item.x - nX;
		item.y = item.y - nY;
		item.z = item.z - nZ;
	});

	return arr;
}
