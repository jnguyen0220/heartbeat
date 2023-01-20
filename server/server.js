import Bree from 'bree';
import Graceful from '@ladjs/graceful';
import { format, formatDistance } from 'date-fns';
import { Server } from 'socket.io';
import { database } from '../database/database.js';

const uptime = new Map();
const db = database();
const schedule = db.all;

const jobs = schedule.map((x) => ({
    name: x.name,
    interval: x.interval,
    path: x.path,
    worker: { workerData: { url: x.address, port: x.port } }
}));

export const initServer = (server) => {
    const io = new Server(server);

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

const onMessageCallback =
	(io) =>
	({ name, message }) => {
		const currentTime = new Date();
		const nowString = format(currentTime, 'hh:mm:ss a');
		!uptime.has(name) && uptime.set(name, { ok: 0, total: 0, lastStatus: null });
		const _uptime = uptime.get(name);
		_uptime.total += 1;
		if (_uptime.lastStatus != message.ok) {
			_uptime.lastStatus = message.ok;
			_uptime.lastStatusTimestamp = currentTime;
		}
		message.ok && (_uptime.ok += 1);
		const payload = {
			...message,
			name,
			timestamp: `${message.ok ? '&#128994' : '&#128308'} ${nowString}`,
			uptime: `${((_uptime.ok / _uptime.total) * 100).toFixed(1)} %`,
			lastStatusChange: formatDistance(currentTime, _uptime.lastStatusTimestamp) + ' ago'
		};
		io.emit('update', payload);
	};