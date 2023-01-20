import { sveltekit } from '@sveltejs/kit/vite';
import { initServer } from './server/server';

const webSocketServer = {
	name: 'webSocketServer',
	configureServer(server) {
		initServer(server.httpServer)
	}
};

/** @type {import('vite').UserConfig} */
const config = {
	plugins: [sveltekit(), webSocketServer]
};

export default config;
