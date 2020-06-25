import { ArcRotateCamera, Camera, Curve3, Engine, Matrix, MeshBuilder, Observer, Plane, PointerInfo, PointLight, Scene, Vector3 } from 'babylonjs';
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
	pointerObserver: Observer<PointerInfo> | null = null;
	chromosomeData: ChromosomeData[];

	constructor(canvas: HTMLCanvasElement, zoom: Writable<number>, data: ChromosomeData[]) {
		this.engine = new Engine(canvas, true);
		this.scene = new Scene(this.engine);
		this.socket = new MySocket(location.origin.replace('http', 'ws'));
		this.canvas = canvas;
		this.chromosomeData = data;
		this.zoomObservable = zoom;
		// this.scene.debugLayer.show();

		// Experimentation with Svelte Stores
		zoom.subscribe((val) => {
			if (!this.zoom) {
				this.zoom = val;
			} else {
				if (val > this.zoom) {
					this.zoomIn(val);
					this.zoom = val;
				} else {
					this.zoomOut(val);
					this.zoom = val;
				}
			}
		});

		this.socket.expect<ZoomMsg>('ZOOM', (msg) => {
			zoom.set(msg.zoom);
		});

		this.socket.expect<InitMsg>(
			'INIT',
			(evt) => {
				zoom.set(evt.zoom);
				this.setup(evt.position);
			},
			{
				once: true,
				timeout: {
					time: 2.5,
					callback: () => {
						this.setup({ x: 0, y: 0, z: 0 });
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

		// let ground = MeshBuilder.CreateGround('ground', { width: 5, height: 5 });
		// ground.position.y -= 1;
		// let sphere = MeshBuilder.CreateBox('Sphere', { depth: 1, height: 1, width: 1 });
		const pointArray = normalize(this.chromosomeData).map(({ x, y, z }) => new Vector3(x, y, z));
		const chromosome = MeshBuilder.CreateTube(
			'chromosome',
			{
				path: Curve3.CreateCatmullRomSpline(pointArray, this.chromosomeData.length).getPoints(),
				radius: 1
			},
			this.scene
		);
		chromosome.position.set(initPos.x, initPos.y, initPos.z);

		this.scene.onPointerObservable.add((data) => {
			if (data.type === BABYLON.PointerEventTypes.POINTERDOWN) {
				if (data.pickInfo?.hit) {
					const pickedPoint = data.pickInfo.pickedPoint!;
					const normal = data.pickInfo.getNormal();
					const tangentPlane = Plane.FromPositionAndNormal(pickedPoint, normal!);
					const { x: initX, y: initY, z: initZ } = pickedPoint;
					const { x: chrInitX, y: chrInitY, z: chrInitZ } = chromosome.position;

					this.pointerObserver = this.scene.onPointerObservable.add((data) => {
						if (data.type === BABYLON.PointerEventTypes.POINTERMOVE) {
							const pickingRay = this.scene.createPickingRay(this.scene.pointerX, this.scene.pointerY, Matrix.IdentityReadOnly.clone(), camera);
							const pick = this.scene.pickWithRay(pickingRay);
							const { x, y, z } =
								pick!.pickedPoint ||
								pickingRay.origin.add(pickingRay.direction.normalize().scale(tangentPlane.signedDistanceTo(pickingRay.origin)));
							const deltaY = y - initY;
							const deltaZ = z - initZ;
							chromosome.position = new Vector3(0, chrInitY + deltaY, chrInitZ + deltaZ);
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
					const newZoom = prevZoom + ((data.event as WheelEvent).deltaY * -1) / 500;
					this.socket.json<ZoomMsg>({
						type: 'ZOOM',
						zoom: newZoom
					});
					return newZoom;
				});
			}
		});

		this.socket.expect<PositionMsg>('POS', (evt) => {
			const { x, y, z } = evt.position;
			chromosome.position = new Vector3(x, y, z);
		});
		this.run();
	}

	run(): void {
		this.engine.runRenderLoop(() => this.scene.render());
	}

	// Experimentation with Svelte Stores
	zoomIn(zoom: number): void {
		if (this.camera) {
			this.camera.position = this.camera.position.add(this.camera.getForwardRay(zoom).direction);
		}
	}

	zoomOut(zoom: number): void {
		if (this.camera) {
			this.camera.position = this.camera.position.subtract(this.camera.getForwardRay(zoom).direction);
		}
	}
}
