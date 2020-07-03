import Pusher from 'pusher';

const appId = '1030328';
const key = 'e255c7f7b3a1fd276637';
const secret = 'a2b16e5e82b67b60435e';
const cluster = 'us2';

export const post = (req, res) => {
	const pusher = new Pusher({
		appId,
		key,
		secret,
		cluster
	});

	pusher.trigger('gemini-nucleosome-explorer', 'VIEW_CHANGE', req.body.cameraView);
	res.writeHead(200).end('Todo Created');
};
