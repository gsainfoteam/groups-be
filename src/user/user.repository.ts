import {
  ConflictException,
  Injectable,
  InternalServerErrorException,
  Logger,
} from '@nestjs/common';
import { User } from '@prisma/client';
import { PrismaClientKnownRequestError } from '@prisma/client/runtime/library';
import { PrismaService } from 'src/prisma/prisma.service';

@Injectable()
export class UserRepository {
  private readonly logger = new Logger(UserRepository.name);
  constructor(private readonly prismaService: PrismaService) {}

  async getUserByUuid({ uuid }: Pick<User, 'uuid'>): Promise<User | null> {
    this.logger.log('Fetching user by uuid');
    return this.prismaService.user.findUnique({
      where: { uuid },
    });
  }

  async createUser({ uuid }: Pick<User, 'uuid'>): Promise<User> {
    this.logger.log('Creating user');
    return this.prismaService.user
      .create({
        data: { uuid },
      })
      .catch((error) => {
        if (error instanceof PrismaClientKnownRequestError) {
          if (error.code === 'P2002') {
            this.logger.debug('User already exists');
            throw new ConflictException('User already exists');
          }
        }
        this.logger.error('Unknown database error', error);
        throw new InternalServerErrorException('Unknown database error');
      });
  }
}
