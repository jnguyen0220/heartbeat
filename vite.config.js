import { sveltekit } from '@sveltejs/kit/vite';
import { Server } from 'socket.io';
import Bree from 'bree';
import { database } from './database/database';
import { format } from 'date-fns';

const onMessageCallback =
	(io) =>
	({ name, message }) => {
		const now = format(new Date(), 'hh:mm:ss a');
		const payload = { ...message, name, timestamp: now };
		io.emit('update', payload);
	};

const webSocketServer = {
	name: 'webSocketServer',
	configureServer(server) {
		const db = database();
		const schedule = db.all;
		const jobs = schedule.map((x) => ({
			name: x.name,
			interval: x.interval,
			path: x.path,
			worker: { workerData: { url: x.address, port: x.port } }
		}));

		const io = new Server(server.httpServer);
		io.on('connection', (socket) => {
			socket.emit('welcome', schedule);
		});

		const bree = new Bree({
			jobs: ['init', ...jobs],
			workerMessageHandler: onMessageCallback(io)
		});

		(async () => {
			await bree.start();
		})();
	}
};

/** @type {import('vite').UserConfig} */
const config = {
	plugins: [sveltekit(), webSocketServer]
};

export default config;
