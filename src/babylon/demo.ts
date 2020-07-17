import { ArcRotateCamera, Curve3, Engine, Mesh, MeshBuilder, Observer, PointerInfo, Scene, Vector3 } from 'babylonjs';
import { GLTF2Export } from 'babylonjs-serializers';
import { Writable } from 'svelte/store';
import { CameraDetail, CameraViewMsg, InitMsg } from '../../types';
import MySocket from '../../util/MySocket';
import { normalize } from '../../util/utils';

interface ChromosomeData {
	chromosome: string;
	segment: string;
	x: number;
	y: number;
	z: number;
}
export default class Demo {
	readonly scene: Scene;
	readonly engine: Engine;
	socket: MySocket;
	canvas: HTMLCanvasElement;
	camera: ArcRotateCamera | null = null;
	zoom: number = 1;
	zoomObservable: Writable<number>;
	pointerObserver: Observer<PointerInfo> | null = null;
	chromosomeData: ChromosomeData[];
	chromosome: Mesh | null = null;
	// octree: Octree<AbstractMesh> | null;

	constructor(canvas: HTMLCanvasElement, zoom: Writable<number>, data: ChromosomeData[]) {
		this.engine = new Engine(canvas, true);
		this.scene = new Scene(this.engine);
		this.socket = new MySocket(location.origin.replace('http', 'ws'));
		this.canvas = canvas;
		this.chromosomeData = data;
		this.zoomObservable = zoom;
		// this.octree = null;
		// this.scene.debugLayer.show();

		this.socket.expect<InitMsg>(
			'INIT',
			({ cameraView }) => {
				this.setup(cameraView);
			},
			{
				once: true,
				timeout: {
					time: 2.5,
					callback: () => {
						this.setup({ alpha: 0, beta: 2 * Math.PI, radius: 10, targetPos: { x: 0, y: 0, z: 0 } });
					}
				}
			}
		);
	}

	setup({ alpha, beta, radius }: CameraDetail): void {
		this.scene.createDefaultCameraOrLight(true, true, true);

		const camera = this.scene.cameras[0] as ArcRotateCamera;
		this.camera = camera;
		camera.alpha = alpha;
		camera.beta = beta;
		camera.radius = radius;

		const pointArray = normalize(this.chromosomeData).map(({ x, y, z }) => new Vector3(x, y, z));
		const spline = Curve3.CreateCatmullRomSpline(pointArray, this.chromosomeData.length);
		const chromosome = MeshBuilder.CreateTube(
			'chromosome',
			{
				path: spline.getPoints(),
				radius: 1
			},
			this.scene
		);
		this.chromosome = chromosome;

		// this.octree = this.scene.createOrUpdateSelectionOctree();
		// this.octree.dynamicContent.push(chromosome);

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

		camera.onViewMatrixChangedObservable.add((cam) => {
			const camera = cam as ArcRotateCamera;
			const { x, y, z } = camera.target;
			this.socket.json<CameraViewMsg>({
				type: 'CAMERA_VIEW',
				cameraView: {
					alpha: camera.alpha,
					beta: camera.beta,
					radius: camera.radius,
					targetPos: {
						x,
						y,
						z
					}
				}
			});
		});

		this.socket.expect<CameraViewMsg>(
			'CAMERA_VIEW',
			({
				cameraView: {
					alpha,
					beta,
					radius,
					targetPos: { x, y, z }
				}
			}) => {
				if (this.camera) {
					this.camera.alpha = alpha;
					this.camera.beta = beta;
					this.camera.radius = radius;
					this.camera.target = new Vector3(x, y, z);
				}
			}
		);

		this.run();
	}

	run(): void {
		this.engine.runRenderLoop(() => {
			this.scene.render();
			// this.octree = this.scene.createOrUpdateSelectionOctree();
		});
	}

	updateData(newData: ChromosomeData[]): void {
		const pointArray = normalize(newData).map(({ x, y, z }) => new Vector3(x, y, z));
		const { x, y, z } = this.chromosome!.position;
		this.chromosome?.dispose();
		const chromosome = MeshBuilder.CreateTube(
			'chromosome',
			{
				path: Curve3.CreateCatmullRomSpline(pointArray, this.chromosomeData.length).getPoints(),
				radius: 0.1
			},
			this.scene
		);
		chromosome.position.set(x, y, z);
		this.chromosome = chromosome;
	}

	async export(): Promise<any> {
		const data = await GLTF2Export.GLTFAsync(this.scene, 'scene');
		console.log(data);
		const bin = await (data.glTFFiles['scene.bin'] as Blob).arrayBuffer();
		this.socket.json({ type: 'GLTF_EXPORT', data: data.glTFFiles['scene.gltf'], bin: Array.from(new Uint8Array(bin)) });

		return { data: data.glTFFiles['scene.gltf'], bin: encode(bin) };
	}

	async exportGlb(): Promise<any> {
		const data = await GLTF2Export.GLBAsync(this.scene, 'scene').then((data) => {
			console.log(data);
			(data.glTFFiles['scene.glb'] as Blob).arrayBuffer().then((glb) => {
				this.socket.json({ type: 'GLB_EXPORT', glb: encode(glb) });
			});
		});
	}

	destroy(): void {
		this.engine.stopRenderLoop();
		this.scene.dispose();
	}
}

function encode(buffer: ArrayBuffer): string {
	let binary = '';
	const bytes = new Uint8Array(buffer);
	const len = bytes.byteLength;
	for (var i = 0; i < len; i++) {
		binary += String.fromCharCode(bytes[i]);
	}
	return btoa(binary);
}
