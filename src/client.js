import * as sapper from '@sapper/app';

sapper.start({
	target: document.querySelector('#sapper'),
	props: {
		PORT: process.env.PORT + 2000
	}
});
