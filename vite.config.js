import { sveltekit } from '@sveltejs/kit/vite';
import { Server } from 'socket.io';
import Bree from 'bree';
import Graceful from '@ladjs/graceful';
import { database } from './database/database';
import { format } from 'date-fns';

const uptime = new Map();

const onMessageCallback =
	(io) =>
	({ name, message }) => {
		const now = format(new Date(), 'hh:mm:ss a');
		!uptime.has(name) && uptime.set(name, { ok: 0, total: 0 });
		const _uptime = uptime.get(name);
		_uptime.total += 1;
		_uptime.timestamp = now;
		message.ok && (_uptime.ok += 1);
		const payload = {
			...message,
			name,
			timestamp: `${message.ok ? '&#128994' : '&#128308'} ${now}`,
			uptime: `${((_uptime.ok / _uptime.total) * 100).toFixed(1)} %`
		};
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

		const graceful = new Graceful({ brees: [bree] });
		graceful.listen();

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
