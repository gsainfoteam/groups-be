import { Injectable } from '@nestjs/common';
import { RoleRepository } from './role.repository';
import { CreateRoleDto } from './dto/req/createRole.dto';
import { UpdateRoleDto } from './dto/req/updateRole.dto';
import { RoleListResDto } from './dto/res/roleRes.dto';
import { Loggable } from '@lib/logger/decorator/loggable';

@Injectable()
@Loggable()
export class RoleService {
  constructor(private readonly roleRepository: RoleRepository) {}

  /**
   * this method retrieves the list of roles for a group
   * @param groupUuid the uuid of the group
   * @param userUuid the uuid of the user
   * @returns the list of roles for the group
   */
  async getRoles(groupUuid: string, userUuid: string): Promise<RoleListResDto> {
    return {
      list: await this.roleRepository.getRoles({ groupUuid }, userUuid),
    };
  }

  /**
   * this method creates a role for a group
   * @param groupName
   * @param createRoleDto object containing the role name and optionally it may containing authorities and external authorities
   * @param userUuid the uuid of the user
   * @returns the created role
   */
  async createRole(
    groupUuid: string,
    createRoleDto: CreateRoleDto,
  ): Promise<void> {
    await this.roleRepository.createRole({ groupUuid, ...createRoleDto });
  }

  /**
   * this method updates a role for a group
   * @param groupName the name of the group
   * @param id the id of the role
   * @param updateRoleDto object containing the role name and optionally it may containing authorities and external authorities
   * @param userUuid the uuid of the user
   */
  async updateRole(
    groupUuid: string,
    id: number,
    updateRoleDto: UpdateRoleDto,
  ): Promise<void> {
    await this.roleRepository.updateRole({ id, groupUuid, ...updateRoleDto });
  }

  /**
   * this method deletes a role for a group
   * @param groupName the name of the group
   * @param id the id of the role
   * @param userUuid the uuid of the user
   */
  async deleteRole(groupUuid: string, id: number): Promise<void> {
    await this.roleRepository.deleteRole({ groupUuid, id });
  }
}
