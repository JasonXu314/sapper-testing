export interface Position {
	x: number;
	y: number;
	z: number;
}

export interface PositionMsg {
	type: 'POS';
	position: Position;
}

export interface ZoomMsg {
	type: 'ZOOM';
	zoom: number;
}

export interface InitMsg {
	type: 'INIT';
	zoom: number;
	position: Position;
}
