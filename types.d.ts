export interface Position {
	x: number;
	y: number;
	z: number;
}

export interface InitMsg {
	type: 'INIT';
	cameraView: CameraDetail;
}

export interface CameraViewMsg {
	type: 'CAMERA_VIEW';
	cameraView: CameraDetail;
}

export interface CameraDetail {
	alpha: number;
	beta: number;
	radius: number;
	targetPos: Position;
}
