import {
  ConflictException,
  Injectable,
  InternalServerErrorException,
  Logger,
  NotFoundException,
} from '@nestjs/common';
import { Group, Role } from '@prisma/client';
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
  async getRoles({ name }: Pick<Group, 'name'>): Promise<Role[]> {
    this.logger.log(`Retrieving roles for group ${name}`);
    return this.prismaService.role.findMany({
      where: {
        groupName: name,
      },
    });
  }

  /**
   * this method creates a role for a group
   * @param param0 object containing the role name and group uuid and optionally it may containing authorities and external authorities
   * @returns the created role
   */
  async createRole({
    name,
    groupName,
    authoities,
    externalAuthoities,
  }: Pick<Role, 'name' | 'groupName'> &
    Partial<Pick<Role, 'authoities' | 'externalAuthoities'>>): Promise<Role> {
    this.logger.log(`Creating role ${name} for group ${groupName}`);
    return this.prismaService.role
      .create({
        data: {
          id:
            (await this.prismaService.role.count({ where: { groupName } })) + 1,
          name,
          groupName,
          authoities,
          externalAuthoities,
        },
      })
      .catch((error) => {
        if (error instanceof PrismaClientKnownRequestError) {
          if (error.code === 'P2002') {
            this.logger.debug(`Role already exists for group ${groupName}`);
            throw new ConflictException('Role already exists');
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
  async updateRole({
    id,
    groupName,
    authoities,
    externalAuthoities,
  }: Pick<Role, 'groupName' | 'id'> &
    Partial<Pick<Role, 'authoities' | 'externalAuthoities'>>): Promise<Role> {
    return this.prismaService.role
      .update({
        where: {
          id_groupName: {
            id,
            groupName,
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
            this.logger.debug(`Role not found for group ${groupName}`);
            throw new NotFoundException('Role not found');
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
  async deleteRole({
    id,
    groupName,
  }: Pick<Role, 'groupName' | 'id'>): Promise<Role> {
    return this.prismaService.role
      .delete({
        where: {
          id_groupName: {
            id,
            groupName,
          },
        },
      })
      .catch((error) => {
        if (error instanceof PrismaClientKnownRequestError) {
          if (error.code === 'P2025') {
            this.logger.debug(`Role not found for group ${groupName}`);
            throw new NotFoundException('Role not found');
          }
          this.logger.error(`Database error: ${error.message}`);
          throw new InternalServerErrorException('Database error');
        }
        this.logger.error(`Unknown error: ${error.message}`);
        throw new InternalServerErrorException('Unknown error');
      });
  }
}
