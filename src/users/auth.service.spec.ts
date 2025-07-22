import { Test } from '@nestjs/testing';
import { AuthService } from './auth.service';
import { UsersService } from './users.service';
import { User } from './user.entity';
describe('AuthService', () => {
  let service: AuthService;
  let fakeUsersService: Partial<UsersService>;

  beforeEach(async () => {
    const users: User[] = [];
    // create fake copy of UsersService
    fakeUsersService = {
      find: (email: string) => {
        const filteredUsers = users.filter((user) => user.email == email);
        return Promise.resolve(filteredUsers);
      },
      create: (user: Partial<User>) => {
        const userToCreate = {
          id: Math.floor(Math.random() * 99999),
          email: user.email,
          password: user.password,
        } as User;

        users.push(userToCreate);
        return Promise.resolve(userToCreate);
      },
    };
    const module = await Test.createTestingModule({
      providers: [
        AuthService,
        {
          provide: UsersService,
          useValue: fakeUsersService,
        },
      ],
    }).compile();

    service = module.get(AuthService);
  });
  it('can create an instance of AuthService', async () => {
    expect(service).toBeDefined();
  });
  it('should create a new user with a salted and hashed password', async () => {
    const user = await service.signup('zedan@email.com', '123456');
    expect(user.password).not.toEqual('123456');
    const [salt, hash] = user.password.split('.');
    expect(salt).toBeDefined();
    expect(hash).toBeDefined();
  });
  it('should throw an error if user signs up with email that is in use', (done) => {
    fakeUsersService.find = () =>
      Promise.resolve([
        {
          id: 1,
          email: 'zedan@gmail.com',
          password: '123456',
        } as User,
      ]);

    service
      .signup('zedan1@gmail.com', '123456')
      .then(() => {
        console.log('doesnt throw');
        done.fail('Expected error to be thrown');
      })
      .catch(() => {
        done();
      });
  });
  it('should throw an error if signin with unused email', (done) => {
    service
      .signin('zeda434@asdas.com', '21345')
      .then(() => {
        done.fail('expected error to throw');
      })
      .catch(() => {
        done();
      });
  });

  it('should return a user if correct password is provided', async () => {
    await service.signup('zedan@gmail.com', '123456');
    try {
      await service.signin('zedan@gmail.com', '1234564');
    } catch (err) {
      fail();
    }
  });
});
