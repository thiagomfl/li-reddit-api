import { Arg, Ctx, Field, InputType, Mutation, ObjectType, Resolver } from 'type-graphql'
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

@ObjectType()
class FieldError {
  @Field()
  field: string

  @Field()
  message: string
}

@ObjectType()
class UserResponse {
  @Field(() => [FieldError], { nullable: true })
  errors?: FieldError[]

  @Field(() => User, { nullable: true })
  user?: User
}

@Resolver()
export class UserResolver {
  @Mutation(() => UserResponse)
  async register(
    @Arg('options') options: UsernamePasswordInput,
    @Ctx() ctx: MyContext
  ): Promise<UserResponse> {
    if (options.username.length <= 2) {
      return {
        errors: [
          {
            field: 'username',
            message: 'Length must be greater than 2'
          }
        ]
      }
    }

    if (options.username.length <= 3) {
      return {
        errors: [
          {
            field: 'password',
            message: 'Length must be greater than 3'
          }
        ]
      }
    }

    const hashedPwd = await argon2.hash(options.password)
    const user = ctx.em.create(User, {
      username: options.username,
      password: hashedPwd
    })

    try {
      await ctx.em.persistAndFlush(user)
    } catch(err) {
      // Duplicate username error
      if (err.code === '23505' || err.detail.includes('already exists')) {
        return {
          errors: [
            {
              field: 'username',
              message: 'username already taken'
            }
          ]
        }        
      }
    }

    return { user }
  }

  @Mutation(() => UserResponse)
  async login(
    @Arg('options') options: UsernamePasswordInput,
    @Ctx() ctx: MyContext
  ): Promise<UserResponse> {
    const user = await ctx.em.findOne(User, { username: options.username })

    if (!user) {
      return {
        errors: [
          {
            field: 'username',
            message: 'That username doesn\'t exist'
          }
        ]
      }
    }

    const valid = await argon2.verify(user.password, options.password)

    if (!valid) {
      return {
        errors: [
          {
            field: 'password',
            message: 'username or password are invalids'
          }
        ]
      }
    }

    return { user }
  }
}