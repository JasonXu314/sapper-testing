export const get = (_, res) => {
	res.writeHead(200).end(process.env.PORT);
};
