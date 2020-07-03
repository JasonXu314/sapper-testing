import Pusher from 'pusher';

export const post = (req, res) => {
	const appId = process.env.PUSHER_ID;
	const key = process.env.PUSHER_KEY;
	const secret = process.env.PUSHER_SECRET;
	const cluster = 'us2';

	const pusher = new Pusher({
		appId,
		key,
		secret,
		cluster
	});

	pusher.trigger('gemini-nucleosome-explorer', 'VIEW_CHANGE', req.body.cameraView);
	res.writeHead(200).end('View Recieved');
};
