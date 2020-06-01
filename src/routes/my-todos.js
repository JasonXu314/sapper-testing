const todos = [
	{ title: 'hi', description: 'testing', id: 1 },
	{ title: '2', description: 'other test', id: 2 }
];

export const get = (_, res) => {
	res.writeHead(200).end(JSON.stringify(todos));
};

export const post = (req, res) => {
	todos.push({ title: req.body.title, description: req.body.description });
	res.writeHead(200).end('Todo Created');
};

export const del = (req, res) => {
	todos.splice(
		todos.findIndex((todo) => todo.id === parseInt(req.body.id)),
		1
	);
	res.writeHead(200).end('Todo Delted');
};
