import { Test, TestingModule } from '@nestjs/testing';
import { UsersController } from './users.controller';
import { UsersService } from './users.service';
import { AuthService } from './auth.service';
import { User } from './user.entity';

describe('UsersController', () => {
  let controller: UsersController;
  let fakeUsersService: Partial<UsersService>;
  let fakeAuthService: Partial<AuthService>;
  beforeEach(async () => {
    fakeUsersService = {
      findOne: (id: number) => {
        return Promise.resolve({
          id,
          email: 'zedan@gmail.com',
          password: '123456',
        } as User);
      },
      find: (email: string) => {
        return Promise.resolve([{ id: 1, email, password: '123456' } as User]);
      },
      // remove: () => {},
      // update: () => {},
    };
    fakeAuthService = {
      // signup: () => {},
      signin: (email: string, password: string) => {
        return Promise.resolve({ id: 1, email } as User);
      },
    };
    const module: TestingModule = await Test.createTestingModule({
      controllers: [UsersController],
      providers: [
        {
          provide: AuthService,
          useValue: fakeAuthService,
        },
        {
          provide: UsersService,
          useValue: fakeUsersService,
        },
      ],
    }).compile();

    controller = module.get<UsersController>(UsersController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('findAllUsers', () => {
    it('should return list of users with email', async () => {
      const users = await controller.findAllUsers('zedan@gmail.com');
      expect(users.length).toEqual<number>(1);
      expect(users[0].email).toBe('zedan@gmail.com');
    });
  });

  describe('findUser', () => {
    it('should return a single user with a given id', async () => {
      const user = await controller.findUser('1');
      expect(user).toBeDefined();
    });
    it('should throw an error if user with a given id not found', async () => {
      fakeUsersService.findOne = (id: number) => Promise.resolve(null);
      const user = await controller.findUser('1');
      expect(user).toBeNull();
    });
  });

  describe('signin', () => {
    it('should update session object and return user', async () => {
      const session: {
        userId?: number;
      } = {};
      const user = await controller.signin(
        {
          email: 'zedan@gmail.com',
          password: '123456',
        },
        session,
      );
      expect(user).toBeDefined();
      expect(user.id).toEqual(1);
      expect(session.userId).toBeDefined();
      expect(session.userId).toEqual(1);
    });
  });
});
