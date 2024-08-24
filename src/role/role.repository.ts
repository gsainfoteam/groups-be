import {
  ConflictException,
  ForbiddenException,
  Injectable,
  InternalServerErrorException,
  Logger,
  NotFoundException,
} from '@nestjs/common';
import { Authority, Group, Role } from '@prisma/client';
import { PrismaClientKnownRequestError } from '@prisma/client/runtime/library';
import { PrismaService } from 'src/prisma/prisma.service';

@Injectable()
export class RoleRepository {
  private readonly logger = new Logger(RoleRepository.name);
  constructor(private readonly prismaService: PrismaService) {}

  /**
   * this method retrieves the list of roles for a group
   * @param param0 object containing the group uuid
   * @returns the list of roles for the group
   */
  async getRoles(
    { name }: Pick<Group, 'name'>,
    userUuid: string,
  ): Promise<Role[]> {
    this.logger.log(`Retrieving roles for group ${name}`);
    return this.prismaService.role.findMany({
      where: {
        Group: {
          name,
          UserGroup: {
            some: {
              userUuid,
            },
          },
        },
      },
    });
  }

  /**
   * this method creates a role for a group
   * @param param0 object containing the role name and group uuid and optionally it may containing authorities and external authorities
   * @returns the created role
   */
  async createRole(
    {
      name,
      groupUuid,
      authorities,
    }: Pick<Role, 'name' | 'groupUuid'> & Partial<Pick<Role, 'authorities'>>,
    userUuid: string,
  ): Promise<Role> {
    this.logger.log(`Creating role ${name} for group ${groupUuid}`);
    return this.prismaService.role
      .create({
        data: {
          id:
            (await this.prismaService.role.count({ where: { groupUuid } })) + 1,
          name,
          authorities,
          Group: {
            connect: {
              uuid: groupUuid,
              UserRole: {
                some: {
                  userUuid,
                  Role: {
                    authorities: {
                      has: Authority.ROLE_CREATE,
                    },
                  },
                },
              },
            },
          },
        },
      })
      .catch((error) => {
        if (error instanceof PrismaClientKnownRequestError) {
          if (error.code === 'P2002') {
            this.logger.debug(`Role already exists for group ${groupUuid}`);
            throw new ConflictException('Role already exists');
          }
          if (error.code === 'P2025') {
            this.logger.debug(`Group ${groupUuid} not found`);
            throw new NotFoundException('Group not found');
          }
          this.logger.error(`Database error: ${error.message}`);
          throw new InternalServerErrorException('Database error');
        }
        this.logger.error(`Unknown error: ${error.message}`);
        throw new InternalServerErrorException('Unknown error');
      });
  }

  /**
   * this method updates a role for a group
   * @param param0 object containing the role id, group uuid and optionally it may containing authorities and external authorities
   * @returns the updated role
   */
  async updateRole(
    {
      id,
      groupUuid,
      authorities,
    }: Pick<Role, 'groupUuid' | 'id'> & Partial<Pick<Role, 'authorities'>>,
    userUuid: string,
  ): Promise<Role> {
    return this.prismaService.role
      .update({
        where: {
          id_groupUuid: {
            id,
            groupUuid,
          },
          Group: {
            UserRole: {
              some: {
                userUuid,
                Role: {
                  authorities: {
                    has: Authority.ROLE_UPDATE,
                  },
                },
              },
            },
          },
        },
        data: {
          authorities,
        },
      })
      .catch((error) => {
        if (error instanceof PrismaClientKnownRequestError) {
          if (error.code === 'P2025') {
            this.logger.debug(`Group ${groupUuid} not found`);
            throw new NotFoundException('Group not found');
          }
          this.logger.error(`Database error: ${error.message}`);
          throw new InternalServerErrorException('Database error');
        }
        this.logger.error(`Unknown error: ${error.message}`);
        throw new InternalServerErrorException('Unknown error');
      });
  }

  /**
   * this method deletes a role for a group
   * @param param0 object containing the role id and group uuid
   * @returns the deleted role
   */
  async deleteRole(
    { id, groupUuid }: Pick<Role, 'groupUuid' | 'id'>,
    userUuid: string,
  ): Promise<Role> {
    return this.prismaService.role
      .delete({
        where: {
          id_groupUuid: {
            id,
            groupUuid,
          },
          Group: {
            UserRole: {
              some: {
                userUuid,
                Role: {
                  authorities: {
                    has: Authority.ROLE_DELETE,
                  },
                },
              },
            },
          },
        },
      })
      .catch((error) => {
        if (error instanceof PrismaClientKnownRequestError) {
          if (error.code === 'P2025') {
            this.logger.debug(`Role not found for group ${groupUuid}`);
            throw new ForbiddenException('Role not found');
          }
          this.logger.error(`Database error: ${error.message}`);
          throw new InternalServerErrorException('Database error');
        }
        this.logger.error(`Unknown error: ${error.message}`);
        throw new InternalServerErrorException('Unknown error');
      });
  }
}
