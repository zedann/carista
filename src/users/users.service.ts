import { Injectable, NotFoundException } from '@nestjs/common';
import { CreateUserDto } from './dtos/create-user.dto';
import { Repository } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';
import { User } from './user.entity';
import { UpdateUserDto } from './dtos/update-user.dto';

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(User) private readonly userRepository: Repository<User>,
  ) {}
  async create(createUserDto: CreateUserDto) {
    const user = this.userRepository.create({
      email: createUserDto.email,
      password: createUserDto.password,
    });
    return await this.userRepository.save(user);
  }

  async findOne(id: number) {
    if (!id) return null;
    const user = await this.userRepository.findOne({
      where: {
        id,
      },
    });
    if (!user) throw new NotFoundException('user not found');

    return user;
  }

  async find(email: string) {
    return await this.userRepository.find({
      where: {
        email,
      },
    });
  }

  async update(id: number, updateUserDto: UpdateUserDto) {
    const user = await this.findOne(id);
    if (!user) throw new NotFoundException('User Not Found');
    Object.assign(user, updateUserDto);
    return this.userRepository.save(user);
  }

  async remove(id: number) {
    const user = await this.findOne(id);
    if (!user) throw new NotFoundException('User Not Found');
    return this.userRepository.remove(user);
  }
}
