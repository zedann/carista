import { Test } from '@nestjs/testing';
import { AuthService } from './auth.service';
import { UsersService } from './users.service';
import { User } from './user.entity';
describe('AuthService', () => {
  let service: AuthService;
  let fakeUsersService: Partial<UsersService>;

  beforeEach(async () => {
    // create fake copy of UsersService
    fakeUsersService = {
      find: () => Promise.resolve([]),
      create: (user: Partial<User>) => {
        return Promise.resolve({
          id: 1,
          email: user.email,
          password: user.password,
        } as User);
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
    service.signin('zeda434@asdas.com', '21345').then(()=>{
      done.fail('expected error to throw')
    }).catch(()=>{
      done()
    })
    
  });

  it('should return a user if correct password is provided' , () => {

  })
});
