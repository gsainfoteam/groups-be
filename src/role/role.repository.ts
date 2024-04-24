import {
  ConflictException,
  ForbiddenException,
  Injectable,
  InternalServerErrorException,
  Logger,
} from '@nestjs/common';
import { Authoity, Group, Role } from '@prisma/client';
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
          users: {
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
      groupName,
      authoities,
      externalAuthoities,
    }: Pick<Role, 'name' | 'groupName'> &
      Partial<Pick<Role, 'authoities' | 'externalAuthoities'>>,
    userUuid: string,
  ): Promise<Role> {
    this.logger.log(`Creating role ${name} for group ${groupName}`);
    return this.prismaService.role
      .create({
        data: {
          id:
            (await this.prismaService.role.count({ where: { groupName } })) + 1,
          name,
          authoities,
          externalAuthoities,
          Group: {
            connect: {
              name: groupName,
              userRoles: {
                some: {
                  userUuid,
                  Role: {
                    authoities: {
                      has: Authoity.ROLE_CREATE,
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
            this.logger.debug(`Role already exists for group ${groupName}`);
            throw new ConflictException('Role already exists');
          }
          if (error.code === 'P2025') {
            this.logger.debug(`Group ${groupName} not found`);
            throw new ForbiddenException('Group not found');
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
      groupName,
      authoities,
      externalAuthoities,
    }: Pick<Role, 'groupName' | 'id'> &
      Partial<Pick<Role, 'authoities' | 'externalAuthoities'>>,
    userUuid: string,
  ): Promise<Role> {
    return this.prismaService.role
      .update({
        where: {
          id_groupName: {
            id,
            groupName,
          },
          Group: {
            userRoles: {
              some: {
                userUuid,
                Role: {
                  authoities: {
                    has: Authoity.ROLE_UPDATE,
                  },
                },
              },
            },
          },
        },
        data: {
          authoities,
          externalAuthoities,
        },
      })
      .catch((error) => {
        if (error instanceof PrismaClientKnownRequestError) {
          if (error.code === 'P2025') {
            this.logger.debug(`Group ${groupName} not found`);
            throw new ForbiddenException('Group not found');
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
    { id, groupName }: Pick<Role, 'groupName' | 'id'>,
    userUuid: string,
  ): Promise<Role> {
    return this.prismaService.role
      .delete({
        where: {
          id_groupName: {
            id,
            groupName,
          },
          Group: {
            userRoles: {
              some: {
                userUuid,
                Role: {
                  authoities: {
                    has: Authoity.ROLE_DELETE,
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
            this.logger.debug(`Role not found for group ${groupName}`);
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
