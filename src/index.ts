import 'reflect-metadata'

import express from 'express'
import { MikroORM } from '@mikro-orm/core'
import { buildSchema } from 'type-graphql'
import { ApolloServer } from 'apollo-server-express'

import mikroConfig from './mikro-orm.config'
import { PostResolver } from './resolvers/post'
import { UserResolver } from './resolvers/user'

const main = async () => {
	const orm = await MikroORM.init(mikroConfig)
	await orm.getMigrator().up()

	const app = express()

	const apolloServer = new ApolloServer({
		schema: await buildSchema({
			resolvers: [PostResolver, UserResolver],
			validate: false
		}),

		context: () => ({ em: orm.em })
	})

	apolloServer.applyMiddleware({ app })

	app.listen(5000, () => console.log('server started...'))
}

main().catch((err) => console.error(err))
