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

	setup(): void {
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

		SceneLoader.Append('', 'data:' + gltfString, this.scene);

		this.run();
	}

	run(): void {
		this.engine.runRenderLoop(() => {
			this.scene.render();
		});
	}
}

const gltfString = `{
	"asset": {
	  "generator": "BabylonJS",
	  "version": "2.0"
	},
	"buffers": [
	  {
		"byteLength": 152,
		"uri": "./scene.bin"
	  }
	],
	"nodes": [
	  {
		"name": "ground",
		"translation": [
		  0,
		  -1,
		  0
		],
		"mesh": 0,
		"rotation": [
		  0,
		  1,
		  0,
		  0
		]
	  }
	],
	"meshes": [
	  {
		"primitives": [
		  {
			"attributes": {
			  "POSITION": 0,
			  "NORMAL": 1
			},
			"indices": 2,
			"material": 0
		  }
		]
	  }
	],
	"scenes": [
	  {
		"nodes": [
		  0
		]
	  }
	],
	"scene": 0,
	"bufferViews": [
	  {
		"buffer": 0,
		"byteLength": 48,
		"name": "position - ground",
		"byteStride": 12
	  },
	  {
		"buffer": 0,
		"byteLength": 48,
		"byteOffset": 48,
		"name": "normal - ground",
		"byteStride": 12
	  },
	  {
		"buffer": 0,
		"byteLength": 32,
		"byteOffset": 96,
		"name": "uv - ground",
		"byteStride": 8
	  },
	  {
		"buffer": 0,
		"byteLength": 24,
		"byteOffset": 128,
		"name": "Indices - ground"
	  }
	],
	"accessors": [
	  {
		"name": "position - ground",
		"bufferView": 0,
		"componentType": 5126,
		"count": 4,
		"type": "VEC3",
		"min": [
		  -2.5,
		  0,
		  -2.5
		],
		"max": [
		  2.5,
		  0,
		  2.5
		],
		"byteOffset": 0
	  },
	  {
		"name": "normal - ground",
		"bufferView": 1,
		"componentType": 5126,
		"count": 4,
		"type": "VEC3",
		"byteOffset": 0
	  },
	  {
		"name": "indices - ground",
		"bufferView": 3,
		"componentType": 5125,
		"count": 6,
		"type": "SCALAR",
		"byteOffset": 0
	  }
	],
	"materials": [
	  {
		"name": "default material",
		"pbrMetallicRoughness": {
		  "baseColorFactor": [
			0.5,
			0.5,
			0.5,
			1
		  ],
		  "metallicFactor": 0,
		  "roughnessFactor": 0.3288090062081349
		}
	  }
	]
  }`;
