import { Injectable, Logger } from '@nestjs/common';
import { RoleRepository } from './role.repository';
import { GetRoleListResDto } from './dto/res/getRoleRes.dto';
import { CreateRoleDto } from './dto/req/createRole.dto';
import { UpdateRoleDto } from './dto/req/updateRole.dto';

@Injectable()
export class RoleService {
  private readonly logger = new Logger(RoleService.name);
  constructor(private readonly roleRepository: RoleRepository) {}

  /**
   * this method retrieves the list of roles for a group
   * @param groupUuid the uuid of the group
   * @returns the list of roles for the group
   */
  async getRoles(groupUuid: string): Promise<GetRoleListResDto> {
    this.logger.log(`Retrieving roles for group ${groupUuid}`);
    return {
      list: await this.roleRepository.getRoles({ uuid: groupUuid }),
    };
  }

  /**
   * this method creates a role for a group
   * @param groupUuid
   * @param createRoleDto object containing the role name and optionally it may containing authorities and external authorities
   * @returns the created role
   */
  async createRole(
    groupUuid: string,
    createRoleDto: CreateRoleDto,
  ): Promise<void> {
    this.logger.log(`Creating role`);
    await this.roleRepository.createRole({ groupUuid, ...createRoleDto });
  }

  /**
   * this method updates a role for a group
   * @param groupUuid the uuid of the group
   * @param id the id of the role
   * @param updateRoleDto object containing the role name and optionally it may containing authorities and external authorities
   */
  async updateRole(
    groupUuid: string,
    id: number,
    updateRoleDto: UpdateRoleDto,
  ): Promise<void> {
    this.logger.log(`Updating role`);
    await this.roleRepository.updateRole({ id, groupUuid, ...updateRoleDto });
  }

  /**
   * this method deletes a role for a group
   * @param groupUuid the uuid of the group
   * @param id the id of the role
   */
  async deleteRole(groupUuid: string, id: number): Promise<void> {
    this.logger.log(`Deleting role ${id} for group ${groupUuid}`);
    await this.roleRepository.deleteRole({ groupUuid, id });
  }
}
