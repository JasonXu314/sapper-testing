import { Position } from '../types';

export function diffPos(pos1: Position, pos2: Position): boolean {
	return pos1.x === pos2.x && pos1.y === pos2.y && pos1.z === pos2.z;
}
