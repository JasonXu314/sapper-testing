import { Engine, MeshBuilder, NullEngine, Scene } from 'babylonjs';

export default class SSR {
	scene: Scene;
	engine: Engine | NullEngine;

	constructor() {
		/**
		 * Null Engine allows BABYLON to run on server side, but unable to actually render due to no canvas
		 * Unable to transfer data to browser; always have to create a new engine and scene in-browser in order to function properly
		 */
		this.engine = new NullEngine();
		this.scene = new Scene(this.engine);
	}

	setup(): void {
		this.scene.createDefaultCameraOrLight(true, true, true);
		let ground = MeshBuilder.CreateGround('ground', { width: 5, height: 5 });
		ground.position.y -= 1;
		let sphere = MeshBuilder.CreateSphere('Sphere', { diameter: 1 });
	}

	run(): void {
		this.engine.runRenderLoop(() => this.scene.render());
	}

	// Experimentation with server-side BABYLON
	rehydrate(canvas: HTMLCanvasElement): void {
		this.engine.stopRenderLoop();
		this.engine = new Engine(canvas, true);
		// this.engine.readPixels => reads pixels from render, but unable to redraw into canvas
		this.scene = new Scene(this.engine);
		this.setup();
	}
}
