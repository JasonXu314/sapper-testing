import { ArcRotateCamera, Camera, Engine, MeshBuilder, PointLight, Scene, Vector3 } from 'babylonjs';
import { Writable } from 'svelte/store';

export default class Demo {
	readonly scene: Scene;
	readonly engine: Engine;
	camera: Camera | null;
	zoom: number;

	constructor(canvas: HTMLCanvasElement, zoom: Writable<number>) {
		this.engine = new Engine(canvas, true);
		this.scene = new Scene(this.engine);
		this.camera = null;
		this.zoom = 1;
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
	}

	setup(): void {
		// this.scene.createDefaultCameraOrLight(true, true, true);
		const camera = new ArcRotateCamera('camera', 0, Math.PI / 2, 5, new Vector3(0, 0, 0), this.scene);
		this.scene.addCamera(camera);
		this.camera = camera;

		const light = new PointLight('light', new Vector3(0, 10, 0), this.scene);
		this.scene.addLight(light);

		let ground = MeshBuilder.CreateGround('ground', { width: 5, height: 5 });
		ground.position.y -= 1;
		let sphere = MeshBuilder.CreateSphere('Sphere', { diameter: 1 });
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
