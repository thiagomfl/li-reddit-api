import { Arg, Ctx, Field, InputType, Mutation, Resolver } from 'type-graphql'
import argon2 from 'argon2'

import { MyContext } from '../types'
import { User } from '../entities/User'

@InputType()
class UsernamePasswordInput {
  @Field()
  username: string

  @Field()
  password: string
}

@Resolver()
export class UserResolver {
  @Mutation(() => User)
  async register(
    @Arg('options') options: UsernamePasswordInput,
    @Ctx() ctx: MyContext
  ): Promise<User> {
    const hashedPwd = await argon2.hash(options.password)
    const user = ctx.em.create(User, { 
      username: options.username,
      password: hashedPwd
    })
    
    await ctx.em.persistAndFlush(user)
    
    return user
  }
}