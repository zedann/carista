import { Injectable, NestMiddleware } from '@nestjs/common';
import { Request, Response, NextFunction } from 'express';
import { UsersService } from '../users.service';
import { User } from '../user.entity';

export interface AuthRequest extends Request {
  currentUser?: User | null;
  session?: {
    userId: number | null;
  };
}
@Injectable()
export class CurrentUserMiddleware implements NestMiddleware {
  constructor(private readonly usersService: UsersService) {}
  async use(req: AuthRequest, res: Response, next: NextFunction) {
    const userId = req?.session?.userId;
    if (userId) {
      const user = await this.usersService.findOne(userId);
      req.currentUser = user;
    }

    console.log(req.currentUser);
    next();
  }
}
