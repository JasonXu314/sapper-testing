import { Engine, Scene } from 'babylonjs';

export default class Demo {
	readonly scene: Scene;
	readonly engine: Engine;

	constructor(canvas: HTMLCanvasElement) {
		this.engine = new Engine(canvas, true);
		this.scene = new Scene(this.engine);
		this.scene.debugLayer.show();
	}

	setup(): void {
		this.scene.createDefaultCameraOrLight(true, true, true);
		let ground = BABYLON.MeshBuilder.CreateGround('ground', { width: 5, height: 5 });
		ground.position.y -= 1;
		let sphere = BABYLON.MeshBuilder.CreateSphere('Sphere', { diameter: 1 });
	}

	run(): void {
		this.engine.runRenderLoop(() => this.scene.render());
	}
}
