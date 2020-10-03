import express, { Request, Response } from 'express'
import { MikroORM } from '@mikro-orm/core'
import { buildSchema } from 'type-graphql'
import { ApolloServer } from 'apollo-server-express'

import { Post } from './entities/Post'
import mikroConfig from './mikro-orm.config'
import { HelloResolver } from './resolvers/hello'

const main = async () => {
	const orm = await MikroORM.init(mikroConfig)
	await orm.getMigrator().up()

	const app = express()

	const apolloServer = new ApolloServer({
		schema: await buildSchema({
			resolvers: [HelloResolver],
			validate: false
		})
	})

	apolloServer.applyMiddleware({ app })

	app.listen(5000, () => console.log('server started...'))
}

main().catch((err) => console.error(err))
