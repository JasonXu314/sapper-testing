import { ArcRotateCamera, Curve3, Engine, Mesh, MeshBuilder, Observer, PointerInfo, Scene, Vector3 } from 'babylonjs';
import { GLTF2Export } from 'babylonjs-serializers';
import io from 'socket.io-client';
import { Writable } from 'svelte/store';
import { BoxGeometry, Mesh as ThreeMesh, MeshBasicMaterial, PerspectiveCamera, Scene as ThreeScene, WebGLRenderer } from 'three';
import { CameraDetail } from '../../types';
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
	readonly threeScene: ThreeScene;
	readonly renderer: WebGLRenderer;
	socket: SocketIOClient.Socket;
	canvas: HTMLCanvasElement;
	camera: ArcRotateCamera | null = null;
	threeCamera: PerspectiveCamera;
	zoom: number = 1;
	zoomObservable: Writable<number>;
	pointerObserver: Observer<PointerInfo> | null = null;
	chromosomeData: ChromosomeData[];
	chromosome: Mesh | null = null;
	threeMesh: ThreeMesh;
	box: Mesh;

	constructor(canvas: HTMLCanvasElement, zoom: Writable<number>, data: ChromosomeData[]) {
		this.socket = io('https://gemini-backnd.herokuapp.com');
		this.canvas = canvas;
		this.chromosomeData = data;
		this.zoomObservable = zoom;

		// Setting up ThreeJS
		this.threeScene = new ThreeScene();
		this.threeCamera = new PerspectiveCamera(75, window.innerWidth / window.innerHeight, 1, 1000); // 75, window.innerWidth / window.innerHeight, 1, 1000
		this.threeCamera.position.z = 500;
		const geometry = new BoxGeometry(200, 200, 200);
		const material = new MeshBasicMaterial({ color: 0xff0000 });

		const mesh = new ThreeMesh(geometry, material);
		this.threeScene.add(mesh);
		this.threeMesh = mesh;

		const renderer = new WebGLRenderer({ canvas });
		renderer.autoClear = false;
		renderer.setSize(window.innerWidth, window.innerHeight);
		this.renderer = renderer;

		// Setting up BabylonJS
		const engine = new Engine(renderer.getContext(), true);
		this.engine = engine;
		this.scene = new Scene(this.engine);
		this.scene.beforeRender = function () {
			(engine as any)._currentProgram = null;
			engine.wipeCaches(true);
		};

		const box = MeshBuilder.CreateBox('box', { size: 3 }, this.scene);
		this.box = box;

		// this.scene.debugLayer.show();

		// this.setup({ alpha: 0, beta: 2 * Math.PI, radius: 10, targetPos: { x: 0, y: 0, z: 0 } });
		this.scene.createDefaultCameraOrLight(true, true, true);
		this.animate();
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

		// camera.onViewMatrixChangedObservable.add((cam) => {
		// 	const camera = cam as ArcRotateCamera;
		// 	const { x, y, z } = camera.target;
		// });

		// this.run();
		this.animate();
	}

	run(): void {
		this.engine.runRenderLoop(() => {
			this.scene.render();
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
		// this.socket.json({ type: 'GLTF_EXPORT', data: data.glTFFiles['scene.gltf'], bin: Array.from(new Uint8Array(bin)) });
		this.socket.emit('GLTF_EXPORT', { data: data.glTFFiles['scene.gltf'], bin: Array.from(new Uint8Array(bin)) });

		return { data: data.glTFFiles['scene.gltf'], bin: encode(bin) };
	}

	async exportGlb(): Promise<any> {
		const data = await GLTF2Export.GLBAsync(this.scene, 'scene').then((data) => {
			console.log(data);
			(data.glTFFiles['scene.glb'] as Blob).arrayBuffer().then((glb) => {
				// this.socket.json({ type: 'GLB_EXPORT', glb: encode(glb) });
			});
		});
	}

	destroy(): void {
		this.engine.stopRenderLoop();
		this.scene.dispose();
	}

	animate(): void {
		requestAnimationFrame(this.animate.bind(this));

		restoreThreeWebGLState(this.renderer);
		this.threeMesh.rotation.x += 0.01;
		this.threeMesh.rotation.y += 0.02;

		console.log(this.threeCamera);
		this.renderer.render(this.threeScene, this.threeCamera);
		// this.box.rotation.x += 0.005;
		// this.box.rotation.y += 0.01;
		// this.scene.render();
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

function restoreThreeWebGLState(renderer: WebGLRenderer) {
	const gl = renderer.getContext();

	gl.bindVertexArray(null);
	gl.enable(gl.DEPTH_TEST);
	gl.depthFunc(gl.LEQUAL);
	gl.enable(gl.CULL_FACE);
	gl.cullFace(gl.BACK);
	gl.clearDepth(1);
	gl.clear(gl.DEPTH_BUFFER_BIT);

	renderer.state.reset();
}
