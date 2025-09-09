import { PrismaService } from '@lib/prisma';
import {
  ForbiddenException,
  Injectable,
  InternalServerErrorException,
} from '@nestjs/common';
import { Client } from '@prisma/client';
import { PrismaClientKnownRequestError } from '@prisma/client/runtime/library';
import { UserGroupInfo } from './types/userGroupInfo.type';

@Injectable()
export class ThirdPartyRepository {
  constructor(private readonly prismaService: PrismaService) {}

  async findClientById(clientId: string): Promise<Client> {
    return this.prismaService.client
      .findUniqueOrThrow({
        where: { uuid: clientId },
      })
      .catch((error) => {
        if (
          error instanceof PrismaClientKnownRequestError &&
          error.code === 'P2025'
        ) {
          throw new ForbiddenException(`Client with ID ${clientId} not found`);
        }
        throw new InternalServerErrorException();
      });
  }

  async findGroupByClientUuidAndUserUuid(
    clientUuid: string,
    userUuid: string,
  ): Promise<UserGroupInfo[]> {
    return this.prismaService.group.findMany({
      where: {
        deletedAt: null,
        UserRole: {
          some: {
            userUuid,
          },
        },
      },
      include: {
        Role: {
          where: {
            userRole: {
              some: {
                userUuid,
              },
            },
          },
          include: {
            RoleExternalPermission: {
              where: {
                clientUuid,
              },
            },
          },
        },
      },
    });
  }
}
