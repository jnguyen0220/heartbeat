import { LowSync } from 'lowdb';
import { JSONFileSync } from 'lowdb/node';

export const database = (filePath = 'database/db.json') => {
	const db = new LowSync(new JSONFileSync(filePath));
	db.read();
	return {
		db,
		all: db.data.schedule
	};
};
