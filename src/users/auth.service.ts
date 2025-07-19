import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { UsersService } from './users.service';
import { randomBytes, scrypt as _script } from 'crypto';
import { promisify } from 'util';
const scrypt = promisify(_script);

@Injectable()
export class AuthService {
  constructor(private readonly usersService: UsersService) {}

  async signup(email: string, password: string) {
    const users = await this.usersService.find(email);
    if (users.length) {
      throw new BadRequestException('email in use');
    }
    // hash password
    // generate salt
    const salt = randomBytes(8).toString('hex');
    // hash the salt and the password together
    const hash = (await scrypt(password, salt, 32)) as Buffer;
    // join hash and salt
    const reslut = salt + '.' + hash.toString('hex');

    // create new user with it and return
    return await this.usersService.create({
      email,
      password: reslut,
    });
  }

  async signin(email: string, password: string) {
    // look at database for email
    const [user] = await this.usersService.find(email);
    if (!user) throw new NotFoundException('user not found');
    // extract salt from password:salt.hash
    const [salt, storedHash] = user.password.split('.');

    const hash = ((await scrypt(password, salt, 32)) as Buffer).toString('hex');

    if (hash !== storedHash)
      throw new BadRequestException('email or password is wrong');

    // valid user
    return user;
  }
}
