import { ArcRotateCamera, Engine, Scene, SceneLoader } from 'babylonjs';
import MySocket from '../../util/MySocket';

interface ChromosomeData {
	chromosome: string;
	segment: string;
	x: number;
	y: number;
	z: number;
}
export default class GLTF {
	readonly scene: Scene;
	readonly engine: Engine;
	socket: MySocket;
	canvas: HTMLCanvasElement;
	camera: ArcRotateCamera | null = null;
	zoom: number = 1;
	// octree: Octree<AbstractMesh> | null;

	constructor(canvas: HTMLCanvasElement) {
		this.engine = new Engine(canvas, true);
		this.scene = new Scene(this.engine);
		this.socket = new MySocket(location.origin.replace('http', 'ws'));
		this.canvas = canvas;
		// this.octree = null;
		// this.scene.debugLayer.show();
	}

	setup(gltf: string, bin: string): void {
		// Coordinate Axes
		// const axisX = MeshBuilder.CreateLines(
		// 	'axisX',
		// 	{ points: [Vector3.Zero(), new Vector3(5, 0, 0), new Vector3(5 * 0.95, 0.05 * 5, 0), new Vector3(5, 0, 0), new Vector3(5 * 0.95, -0.05 * 5, 0)] },
		// 	this.scene
		// );
		// axisX.color = new BABYLON.Color3(1, 0, 0);
		// var axisY = MeshBuilder.CreateLines(
		// 	'axisY',
		// 	{ points: [Vector3.Zero(), new Vector3(0, 5, 0), new Vector3(-0.05 * 5, 5 * 0.95, 0), new Vector3(0, 5, 0), new Vector3(0.05 * 5, 5 * 0.95, 0)] },
		// 	this.scene
		// );
		// axisY.color = new BABYLON.Color3(0, 1, 0);
		// var axisZ = MeshBuilder.CreateLines(
		// 	'axisZ',
		// 	{ points: [Vector3.Zero(), new Vector3(0, 0, 5), new Vector3(0, -0.05 * 5, 5 * 0.95), new Vector3(0, 0, 5), new Vector3(0, 0.05 * 5, 5 * 0.95)] },
		// 	this.scene
		// );
		// axisZ.color = new BABYLON.Color3(0, 0, 1);
		this.scene.createDefaultCameraOrLight(true, true, true);

		SceneLoader.Append('', 'data:' + gltf.replace('scene.bin', `data:application/octet-stream;base64,${bin}`), this.scene);
		// SceneLoader.Append('', 'data:base64,' + glb, this.scene);

		this.run();
	}

	run(): void {
		this.engine.runRenderLoop(() => {
			this.scene.render();
		});
	}
}
