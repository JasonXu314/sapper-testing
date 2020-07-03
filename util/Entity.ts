import { AbstractMesh, Vector3 } from 'babylonjs';
import { Position, SerializedEntity } from '../types';

export default class Entity {
	private static _id = 0;

	public position: Position;
	public rotation: Position;
	public id: number;

	constructor(private mesh: AbstractMesh) {
		this.position = { x: mesh.position.x, y: mesh.position.y, z: mesh.position.z };
		this.rotation = { x: mesh.rotation.x, y: mesh.rotation.y, z: mesh.rotation.z };
		this.id = Entity._id++;
	}

	public moveBy(x?: number, y?: number, z?: number): void {
		this.position.x += x || 0;
		this.position.y += y || 0;
		this.position.z += z || 0;
		this.mesh.position.addInPlace(new Vector3(x, y, z));
	}

	public rotateBy(x?: number, y?: number, z?: number): void {
		this.rotation.x += x || 0;
		this.rotation.y += y || 0;
		this.rotation.z += z || 0;
		this.mesh.rotation.addInPlace(new Vector3(x, y, z));
	}

	public serialize(): SerializedEntity {
		return {
			position: this.position,
			rotation: this.rotation,
			id: this.id
		};
	}

	public toString(): string {
		return JSON.stringify(this.serialize());
	}
}
