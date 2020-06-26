import { ArcRotateCamera, Camera, Curve3, Engine, Matrix, Mesh, MeshBuilder, Observer, Plane, PointerInfo, PointLight, Scene, Vector3 } from 'babylonjs';
import { Writable } from 'svelte/store';
import { InitMsg, Position, PositionMsg, ZoomMsg } from '../../types';
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
	camera: Camera | null = null;
	zoom: number = 1;
	zoomObservable: Writable<number>;
	zoomUnsubscriber: () => void;
	pointerObserver: Observer<PointerInfo> | null = null;
	chromosomeData: ChromosomeData[];
	chromosome: Mesh | null = null;

	constructor(canvas: HTMLCanvasElement, zoom: Writable<number>, data: ChromosomeData[]) {
		this.engine = new Engine(canvas, true);
		this.scene = new Scene(this.engine);
		this.socket = new MySocket(location.origin.replace('http', 'ws'));
		this.canvas = canvas;
		this.chromosomeData = data;
		this.zoomObservable = zoom;
		// this.scene.debugLayer.show();

		// Experimentation with Svelte Stores
		this.zoomUnsubscriber = zoom.subscribe((val) => {
			this.setZoom(val);
		});

		this.socket.expect<ZoomMsg>('ZOOM', (msg) => {
			zoom.set(msg.zoom);
		});

		this.socket.expect<InitMsg>(
			'INIT',
			(evt) => {
				zoom.set(evt.zoom);
				this.setZoom(evt.zoom);
				this.setup(evt.position);
			},
			{
				once: true,
				timeout: {
					time: 2.5,
					callback: () => {
						this.setup({ x: 0, y: 0, z: 0 });
						zoom.set(1);
						this.setZoom(1);
					}
				}
			}
		);
	}

	setup(initPos: Position): void {
		// this.scene.createDefaultCameraOrLight(true, true, true);
		const camera = new ArcRotateCamera('camera', 0, Math.PI / 2, 20, new Vector3(0, 0, 0), this.scene);
		this.scene.addCamera(camera);
		this.camera = camera;

		const light = new PointLight('light', new Vector3(0, 10, 0), this.scene);
		this.scene.addLight(light);

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
		chromosome.position.set(initPos.x, initPos.y, initPos.z);
		this.chromosome = chromosome;

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

		this.scene.onPointerObservable.add((data) => {
			if (data.type === BABYLON.PointerEventTypes.POINTERDOWN) {
				if (data.pickInfo?.hit) {
					const pickedPoint = data.pickInfo.pickedPoint!;
					const normal = data.pickInfo.getNormal();
					const tangentPlane = Plane.FromPositionAndNormal(pickedPoint, normal!);
					const { x: initX, y: initY, z: initZ } = pickedPoint;
					const { x: chrInitX, y: chrInitY, z: chrInitZ } = this.chromosome!.position;

					this.pointerObserver = this.scene.onPointerObservable.add((data) => {
						if (data.type === BABYLON.PointerEventTypes.POINTERMOVE) {
							const pickingRay = this.scene.createPickingRay(this.scene.pointerX, this.scene.pointerY, Matrix.IdentityReadOnly.clone(), camera);
							const pick = this.scene.pickWithRay(pickingRay);
							const { x, y, z } =
								pick!.pickedPoint ||
								pickingRay.origin.add(pickingRay.direction.normalize().scale(tangentPlane.signedDistanceTo(pickingRay.origin)));
							const deltaY = y - initY;
							const deltaZ = z - initZ;
							this.chromosome!.position = new Vector3(0, chrInitY + deltaY, chrInitZ + deltaZ);
							this.socket.json<PositionMsg>({
								type: 'POS',
								position: { x: 0, y: chrInitY + deltaY, z: chrInitZ + deltaZ }
							});
						}
					});
				}
			} else if (data.type === BABYLON.PointerEventTypes.POINTERUP) {
				if (this.pointerObserver) {
					this.scene.onPointerObservable.remove(this.pointerObserver);
					this.pointerObserver = null;
				}
			} else if (data.type === BABYLON.PointerEventTypes.POINTERWHEEL) {
				this.zoomObservable.update((prevZoom) => {
					const newZoom = prevZoom + ((data.event as WheelEvent).deltaY * -1) / 50;
					this.socket.json<ZoomMsg>({
						type: 'ZOOM',
						zoom: newZoom
					});
					return newZoom;
				});
			} else if (data.type === BABYLON.PointerEventTypes.POINTERDOUBLETAP) {
				if (data.pickInfo?.hit) {
					const splinePoints = spline.getPoints();
					const pickedPoint = data.pickInfo.pickedPoint!.add(this.camera!.globalPosition).subtract(this.chromosome!.position);

					let minDist = Vector3.Distance(splinePoints[0], pickedPoint),
						idx = 0;
					splinePoints.forEach((pt, i) => {
						const len = Vector3.Distance(pt, pickedPoint);

						if (len < minDist) {
							minDist = len;
							idx = i;
						}
					});
					console.log(idx, minDist);
				}
			}
		});

		this.socket.expect<PositionMsg>('POS', (evt) => {
			const { x, y, z } = evt.position;
			this.chromosome!.position = new Vector3(x, y, z);
		});
		this.run();
	}

	run(): void {
		this.engine.runRenderLoop(() => this.scene.render());
	}

	setZoom(zoom: number): void {
		if (this.camera) {
			this.camera.position = new Vector3(10, 0, 0).add(this.camera.getForwardRay(zoom).direction.normalize().scale(zoom));
		}
	}

	updateData(newData: ChromosomeData[]): void {
		const pointArray = normalize(newData).map(({ x, y, z }) => new Vector3(x, y, z));
		const { x, y, z } = this.chromosome!.position;
		this.chromosome?.dispose();
		const chromosome = MeshBuilder.CreateTube(
			'chromosome',
			{
				path: Curve3.CreateCatmullRomSpline(pointArray, this.chromosomeData.length).getPoints(),
				radius: 1
			},
			this.scene
		);
		chromosome.position.set(x, y, z);
		this.chromosome = chromosome;
	}
}
