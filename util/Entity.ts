import { AbstractMesh, Vector3 } from 'babylonjs';
import { Position, SerializedEntity } from '../types';

export default class Entity {
	private static _id = 0;
	private destroyed: boolean = false;

	public position: Position;
	public rotation: Position;
	private id: number;

	constructor(private mesh: AbstractMesh) {
		this.position = { x: mesh.position.x, y: mesh.position.y, z: mesh.position.z };
		this.rotation = { x: mesh.rotation.x, y: mesh.rotation.y, z: mesh.rotation.z };
		this.id = Entity._id++;
	}

	static hydrate(mesh: AbstractMesh, id: number): Entity {
		const newEntity = new Entity(mesh);
		newEntity.id = id;
		return newEntity;
	}

	public moveBy(x?: number, y?: number, z?: number): void {
		if (this.destroyed) {
			throw new Error('Should not modify entity after destroyed');
		}
		this.position.x += x || 0;
		this.position.y += y || 0;
		this.position.z += z || 0;
		this.mesh.position.addInPlace(new Vector3(x, y, z));
	}

	public moveTo(x: number, y: number, z: number): void {
		if (this.destroyed) {
			throw new Error('Should not modify entity after destroyed');
		}
		this.position.x = x;
		this.position.y = y;
		this.position.z = z;
		this.mesh.position = new Vector3(x, y, z);
	}

	public rotateBy(x?: number, y?: number, z?: number): void {
		if (this.destroyed) {
			throw new Error('Should not modify entity after destroyed');
		}
		this.rotation.x += x || 0;
		this.rotation.y += y || 0;
		this.rotation.z += z || 0;
		this.mesh.rotation.addInPlace(new Vector3(x, y, z));
	}

	public setRotation(x: number, y: number, z: number): void {
		if (this.destroyed) {
			throw new Error('Should not modify entity after destroyed');
		}
		this.rotation.x = x;
		this.rotation.y = y;
		this.rotation.z = z;
		this.mesh.rotation = new Vector3(x, y, z);
	}

	public serialize(): SerializedEntity {
		if (this.destroyed) {
			console.warn('Should not be serializing a destroyed entity');
		}
		return {
			position: this.position,
			rotation: this.rotation,
			id: this.id
		};
	}

	public toString(): string {
		if (this.destroyed) {
			console.warn('Should not be serializing a destroyed entity');
		}
		return JSON.stringify(this.serialize());
	}

	public hide(): void {
		if (this.destroyed) {
			throw new Error('Should not modify entity after destroyed');
		}
		this.mesh.setEnabled(false);
	}

	public show(): void {
		if (this.destroyed) {
			throw new Error('Should not modify entity after destroyed');
		}
		this.mesh.setEnabled(true);
	}

	public destroy(): void {
		this.mesh.dispose();
		this.destroyed = true;
	}
}
