import path from 'path'
import { MikroORM } from '@mikro-orm/core'

import { __prod__ } from './constants'
import { Post } from './entities/Post'

export default {
	migrations: {
		path: path.join(__dirname, './migrations'),
		pattern: /^[\w-]+\d+\.[tj]s$/,
	},
	entities: [Post],
	dbName: 'postgres',
	type: 'postgresql',
	user: 'postgres',
	password: 'thienry',
	port: 15432,
	debug: !__prod__,
} as Parameters<typeof MikroORM.init>[0]
