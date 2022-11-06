import {authenticate, TokenService} from '@loopback/authentication';
import {
  Credentials,
  MyUserService,
  TokenServiceBindings,
  UserRepository,
  UserServiceBindings,
} from '@loopback/authentication-jwt';
import {inject} from '@loopback/core';
import {model, property, repository} from '@loopback/repository';
import {
  del,
  get,
  getModelSchemaRef,
  param,
  patch,
  post,
  requestBody,
  response,
  SchemaObject,
} from '@loopback/rest';
import {SecurityBindings, securityId, UserProfile} from '@loopback/security';
import {genSalt, hash} from 'bcryptjs';
import _ from 'lodash';
import {User} from '../models';
import {CustomResponse} from '../services/types';
@model()
export class CreateUser extends User {
  @property({
    type: 'string',
    required: true,
  })
  password: string;
}

const UserSchema: SchemaObject = {
  type: 'object',
  required: ['email', 'password'],
  properties: {
    email: {
      type: 'string',
      format: 'email',
    },
    password: {
      type: 'string',
      minLength: 6,
    },
  },
};

export const RequestBody = {
  description: 'The input of login function',
  required: true,
  content: {
    'application/json': {schema: UserSchema},
  },
};

export class UserController {
  constructor(
    @inject(TokenServiceBindings.TOKEN_SERVICE)
    public jwtService: TokenService,
    @inject(UserServiceBindings.USER_SERVICE)
    public userService: MyUserService,
    @inject(SecurityBindings.USER, {optional: true})
    public user: UserProfile,
    @repository(UserRepository) protected userRepository: UserRepository,
  ) {}

  @post('/signup', {
    responses: {
      '200': {
        description: 'User',
        content: {
          'application/json': {
            schema: {
              'x-ts-type': User,
            },
          },
        },
      },
    },
  })
  async signUp(
    @requestBody({
      content: {
        'application/json': {
          schema: getModelSchemaRef(User, {
            title: 'NewUser',
          }),
        },
      },
    })
    newUserRequest: User,
  ): Promise<CustomResponse> {
    const emailPattern = /^[\w-\.]+@([\w-]+\.)+[\w-]{2,4}$/g;
    try {
      if (!emailPattern.test(newUserRequest.email))
        throw new Error('Email is invalid');
      if (!newUserRequest.password) throw new Error('Password is empty');

      const findUser = await this.userRepository.find({
        where: {email: newUserRequest.email},
      });
      if (findUser.length > 0) throw new Error('Email is already registered');

      const password = await hash(newUserRequest.password, await genSalt());
      const savedUser = await this.userRepository.create(
        _.omit(newUserRequest, 'password'),
      );

      await this.userRepository
        .userCredentials(savedUser.id)
        .create({password});

      return {data: savedUser, status: true, message: ''};
    } catch (err) {
      return {data: [], status: false, message: err.message};
    }
  }

  @post('/signin', {
    responses: {
      '200': {
        description: 'Token',
        content: {
          'application/json': {
            schema: {
              type: 'object',
              properties: {
                token: {
                  type: 'string',
                },
              },
            },
          },
        },
      },
    },
  })
  async signIn(
    @requestBody(RequestBody) credentials: Credentials,
  ): Promise<CustomResponse> {
    try {
      const foundUser = (await this.userRepository.findOne({
        where: {and: [{email: credentials.email}]},
      })) as User;
      if (!foundUser) throw new Error('Invalid user credentials');
      if (!foundUser.isActive) throw new Error('User is not active yet');

      const user = await this.userService.verifyCredentials(credentials);
      const userProfile = this.userService.convertToUserProfile(user);
      const token = await this.jwtService.generateToken(userProfile);
      if (!user) throw new Error('Invalid user credentials');

      return {
        data: {token: token},
        status: true,
        message: 'User credential is valid',
      };
    } catch (err) {
      return {data: [], status: false, message: err.message};
    }
  }

  @authenticate('jwt')
  @get('/whoami', {
    responses: {
      '200': {
        description: 'Return current user',
        content: {
          'application/json': {
            schema: {
              type: 'string',
            },
          },
        },
      },
    },
  })
  async whoAmI(
    @inject(SecurityBindings.USER)
    loggedInUserProfile: UserProfile,
  ): Promise<CustomResponse> {
    let userId = loggedInUserProfile[securityId];
    const user = await this.userRepository.findById(userId);
    return {data: user, status: true, message: 'User found'};
  }

  @authenticate('jwt')
  @get('/users/list', {
    responses: {
      '200': {
        description: 'Return all users',
        content: {
          'application/json': {
            schema: {
              type: 'string',
            },
          },
        },
      },
    },
  })
  async findUsers(): Promise<CustomResponse> {
    try {
      const user = await this.userRepository.find();
      if (user.length === 0) throw new Error('No user found');

      return {
        data: user,
        status: true,
        message: 'All user has been fetched',
      };
    } catch (err) {
      return {data: [], status: false, message: err.message};
    }
  }

  @authenticate('jwt')
  @patch('/user/{id}')
  @response(204, {
    description: 'User PATCH success',
  })
  async updateById(
    @param.path.string('id') id: string,
    @requestBody({
      content: {
        'application/json': {
          schema: getModelSchemaRef(User, {partial: true}),
        },
      },
    })
    user: User,
  ): Promise<CustomResponse> {
    try {
      await this.userRepository.updateById(id, user);
      return {
        data: [],
        status: true,
        message: 'User has been updated',
      };
    } catch (err) {
      return {data: [], status: false, message: err};
    }
  }

  @authenticate('jwt')
  @del('/user/{id}')
  @response(204, {
    description: 'User DELETE success',
  })
  async deleteById(
    @param.path.string('id') id: string,
  ): Promise<CustomResponse> {
    try {
      await this.userRepository.deleteById(id);
      return {
        data: [],
        status: true,
        message: 'User has been deleted',
      };
    } catch (err) {
      return {data: [], status: false, message: err};
    }
  }
}
