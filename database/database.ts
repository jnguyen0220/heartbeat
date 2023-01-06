import { LowSync } from 'lowdb'
import { JSONFileSync } from 'lowdb/node'
	
export const database = (filePath: string = "database/db.json") => {
    const db: any = new LowSync(new JSONFileSync(filePath))
    db.read()
    return {
        db,
        all: db.data.schedule
    }
}