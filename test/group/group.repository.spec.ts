import { Test, TestingModule } from '@nestjs/testing';

import { ConflictException, ForbiddenException, NotFoundException } from '@nestjs/common';
import { GroupService } from 'src/group/group.service';
import { GroupRepository } from 'src/group/group.repository';
import { CreateGroupDto } from 'src/group/dto/req/createGroup.dto';
import { UpdateGroupDto } from 'src/group/dto/req/updateGroup.dto';

describe('GroupService', () => {
  let service: GroupService;
  let mockGroupRepository: { 
    createGroup: jest.Mock;
    getGroup: jest.Mock;
    updateGroup: jest.Mock;
    deleteGroup: jest.Mock;
    getGroupMember: jest.Mock;
    addGroupMember: jest.Mock;
    deleteGroupMember: jest.Mock;
    addUserRole: jest.Mock;
    deleteUserRole: jest.Mock;
    getUserRoles: jest.Mock;
  };

  beforeEach(async () => {
    // Define the mock for GroupRepository with explicit typing
    mockGroupRepository = {
      createGroup: jest.fn(),
      getGroup: jest.fn(),
      updateGroup: jest.fn(),
      deleteGroup: jest.fn(),
      getGroupMember: jest.fn(),
      addGroupMember: jest.fn(),
      deleteGroupMember: jest.fn(),
      addUserRole: jest.fn(),
      deleteUserRole: jest.fn(),
      getUserRoles: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        GroupService,
        {
          provide: GroupRepository,
          useValue: mockGroupRepository,
        },
      ],
    }).compile();

    service = module.get<GroupService>(GroupService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });


  // Create Group 테스트
  describe('createGroup', () => {
    it('should successfully create a group', async () => {
      const groupDto: CreateGroupDto = { name: 'New Group', description: 'A new group for testing' };
      const userUuid = 'd75f9a3b-b110-437e-9287-eaaf5965849d';
      mockGroupRepository.createGroup.mockResolvedValue({
        id: 1,
        name: 'New Group',
        description: 'A new group for testing',
        users: [],
        userRoles: [],
      });

      const result = await service.createGroup(groupDto, userUuid);

      expect(mockGroupRepository.createGroup).toHaveBeenCalledWith(groupDto, userUuid);
      expect(result).toEqual({
        id: 1,
        name: 'New Group',
        description: 'A new group for testing',
        users: [],
        userRoles: [],
      });
    });

    it('should throw a conflict exception if the group already exists', async () => {
      const groupDto: CreateGroupDto = { name: 'New Group', description: 'A new group for testing' };
      const userUuid = 'd75f9a3b-b110-437e-9287-eaaf5965849d';

      mockGroupRepository.createGroup.mockRejectedValue(
        new ConflictException(`group with name '${groupDto.name}' already exists`)
      );

      await expect(service.createGroup(groupDto, userUuid))
        .rejects
        .toThrow(ConflictException);
    });
  });

  // Get Group 테스트
  describe('getGroup', () => {
    it('should retrieve and return a group by name', async () => {
      const groupName = 'Existing Group';
      const userUuid = 'user-123';
      const mockGroup = { id: 1, name: groupName, description: "A group's description" };
  
      mockGroupRepository.getGroup.mockResolvedValue(mockGroup);
  
      const result = await service.getGroup(groupName, userUuid);
      expect(result).toEqual(mockGroup);
      expect(mockGroupRepository.getGroup).toHaveBeenCalledWith(groupName, userUuid);
    });
  
    it('should throw an error if the group does not exist', async () => {
      const groupName = 'Nonexistent Group';
      const userUuid = 'user-123';
  
      mockGroupRepository.getGroup.mockRejectedValue(new NotFoundException('Group not found'));
  
      await expect(service.getGroup(groupName, userUuid))
        .rejects
        .toThrow(NotFoundException);
    });
  });
  
  // update 테스트
  describe('updateGroup', () => {
    it('should update a group successfully and return the updated group', async () => {
      const groupName = 'TestGroup';
      const initialDescription = 'Initial Description';
      const updatedDescription = 'Updated Description';
      const updateData: UpdateGroupDto = { description: updatedDescription };
      const userUuid = 'user-123';
      const mockInitialGroup = {
        id: 1,
        name: groupName,
        description: initialDescription,
      };
      const expectedUpdatedGroup = {
        id: 1,
        name: groupName,
        description: updatedDescription,
      };
      mockGroupRepository.updateGroup.mockImplementation((name, data, uuid) => {
        if (name === groupName && uuid === userUuid) {
          return Promise.resolve({ ...mockInitialGroup, ...data });
        }
        return Promise.reject(new Error("Group not found"));
      });
      
      const result = await service.updateGroup(groupName, updateData, userUuid);
      expect(mockGroupRepository.updateGroup).toHaveBeenCalledWith(groupName, updateData, userUuid);
      expect(result).toEqual(expectedUpdatedGroup);
    });
  
    it('should throw NotFoundException if the group does not exist', async () => {
      const groupName = 'NonExistingGroup';
      const updateData: UpdateGroupDto = { description: 'Does Not Exist' };
      const userUuid = 'user-123';
  
      mockGroupRepository.updateGroup.mockRejectedValue(new NotFoundException('Group not found'));
  
      await expect(service.updateGroup(groupName, updateData, userUuid))
        .rejects
        .toThrow(NotFoundException);
    });
  });

  // delete 테스트
  describe('deleteGroup', () => {
    it('should delete a group successfully', async () => {
      const groupName = 'TestGroup';
      const userUuid = 'user-123';
      mockGroupRepository.deleteGroup.mockResolvedValue(undefined);
  
      await expect(service.deleteGroup(groupName, userUuid)).resolves.toBe(undefined);
      expect(mockGroupRepository.deleteGroup).toHaveBeenCalledWith(groupName, userUuid);
    });
  
    it('should throw NotFoundException if the group does not exist', async () => {
      const groupName = 'NonExistingGroup';
      const userUuid = 'user-123';
      mockGroupRepository.deleteGroup.mockRejectedValue(new NotFoundException('Group not found'));
  
      await expect(service.deleteGroup(groupName, userUuid))
        .rejects
        .toThrowError(new NotFoundException('Group not found'));
    });
  
    it('should throw ForbiddenException if the user does not have permission to delete the group', async () => {
      const groupName = 'TestGroup';
      const userUuid = 'user-456';
      mockGroupRepository.deleteGroup.mockRejectedValue(new ForbiddenException("User doesn't have permission"));
  
      await expect(service.deleteGroup(groupName, userUuid))
        .rejects
        .toThrowError(new ForbiddenException("User doesn't have permission"));
    });
  });

  // getGroupMember 테스트
  describe('getGroupMember', () => {
    it('should retrieve group members successfully', async () => {
      const groupName = 'TestGroup';
      const userUuid = 'user-123';
      const mockMembers = [{ uuid: 'user-123', name: 'John Doe' }];

      mockGroupRepository.getGroupMember.mockResolvedValue(mockMembers);

      const result = await service.getGroupMember(groupName, userUuid);
      expect(mockGroupRepository.getGroupMember).toHaveBeenCalledWith(groupName, userUuid);
      expect(result).toEqual(mockMembers);
    });

    it('should throw an error if no permission to view group members', async () => {
      const groupName = 'TestGroup';
      const userUuid = 'user-123';

      mockGroupRepository.getGroupMember.mockRejectedValue(new ForbiddenException("User doesn't have permission"));

      await expect(service.getGroupMember(groupName, userUuid))
        .rejects
        .toThrow(ForbiddenException);
    });
  });

  // addGroupMember 테스트
  describe('addGroupMember', () => {
    it('should add a group member successfully', async () => {
      const groupName = 'TestGroup';
      const newUserUuid = 'new-user-456';
      const userUuid = 'user-123';
      const addGroupMemberDto = { uuid: newUserUuid };

      mockGroupRepository.addGroupMember.mockResolvedValue(undefined);

      await expect(service.addGroupMember(groupName, addGroupMemberDto, userUuid)).resolves.toBe(undefined);
      expect(mockGroupRepository.addGroupMember).toHaveBeenCalledWith(groupName, addGroupMemberDto, userUuid);
    });

    it('should throw a conflict exception if user already in group', async () => {
      const groupName = 'TestGroup';
      const newUserUuid = 'new-user-456';
      const userUuid = 'user-123';
      const addGroupMemberDto = { uuid: newUserUuid };

      mockGroupRepository.addGroupMember.mockRejectedValue(new ConflictException(`User already exists in group '${groupName}'`));

      await expect(service.addGroupMember(groupName, addGroupMemberDto, userUuid))
        .rejects
        .toThrow(ConflictException);
    });

    it('should throw forbidden exception if no permission to add member', async () => {
      const groupName = 'TestGroup';
      const newUserUuid = 'new-user-456';
      const userUuid = 'user-123';
      const addGroupMemberDto = { uuid: newUserUuid };

      mockGroupRepository.addGroupMember.mockRejectedValue(new ForbiddenException("User doesn't have permission"));

      await expect(service.addGroupMember(groupName, addGroupMemberDto, userUuid))
        .rejects
        .toThrow(ForbiddenException);
    });
  });

  // deleteGroupMember 테스트
  describe('deleteGroupMember', () => {
    it('should delete a group member successfully', async () => {
      const groupName = 'TestGroup';
      const deleteUserUuid = 'user-456';
      const userUuid = 'user-123';

      mockGroupRepository.deleteGroupMember.mockResolvedValue(undefined);

      await expect(service.deleteGroupMember(groupName, deleteUserUuid, userUuid)).resolves.toBe(undefined);
      expect(mockGroupRepository.deleteGroupMember).toHaveBeenCalledWith(groupName, deleteUserUuid, userUuid);
    });

    it('should throw forbidden exception if no permission to delete member', async () => {
      const groupName = 'TestGroup';
      const deleteUserUuid = 'user-456';
      const userUuid = 'user-123';

      mockGroupRepository.deleteGroupMember.mockRejectedValue(new ForbiddenException("User doesn't have permission"));

      await expect(service.deleteGroupMember(groupName, deleteUserUuid, userUuid))
        .rejects
        .toThrow(ForbiddenException);
    });
  });

  // addUserRoles 테스트
  describe('addUserRole', () => {
    it('should successfully add a user role', async () => {
      const createUserRoleDto = {
        createUserUuid: 'new-user-123',
        groupName: 'TestGroup',
        roleId: 1
      };
      const userUuid = 'user-123';

      mockGroupRepository.addUserRole.mockResolvedValue(undefined);

      await expect(service.addUserRole(createUserRoleDto, userUuid)).resolves.toBe(undefined);
      expect(mockGroupRepository.addUserRole).toHaveBeenCalledWith(createUserRoleDto, userUuid);
    });

    it('should throw a conflict exception if the role already exists', async () => {
      const createUserRoleDto = {
        createUserUuid: 'new-user-123',
        groupName: 'TestGroup',
        roleId: 1
      };
      const userUuid = 'user-123';

      mockGroupRepository.addUserRole.mockRejectedValue(new ConflictException("UserRole already exists"));

      await expect(service.addUserRole(createUserRoleDto, userUuid))
        .rejects
        .toThrow(ConflictException);
    });
  });

  // getUserRoles 테스트
  describe('getUserRoles', () => {
    it('should retrieve user roles successfully', async () => {
      const targetUuid = 'user-123';
      const groupName = 'TestGroup';
      const userUuid = 'user-456';
      const mockRoles = [
        { id: 1, name: 'admin', groupName: 'TestGroup' }
      ];

      mockGroupRepository.getUserRoles.mockResolvedValue(mockRoles);

      const result = await service.getUserRoles(targetUuid, groupName, userUuid);
      expect(mockGroupRepository.getUserRoles).toHaveBeenCalledWith(targetUuid, groupName, userUuid);
      expect(result).toEqual(mockRoles);
    });

    it('should handle cases where no roles are found', async () => {
      const targetUuid = 'user-123';
      const groupName = 'TestGroup';
      const userUuid = 'user-456';

      mockGroupRepository.getUserRoles.mockResolvedValue([]);

      const result = await service.getUserRoles(targetUuid, groupName, userUuid);
      expect(result).toEqual([]);
    });
  });

  // deleteUserRole 테스트
  describe('deleteUserRole', () => {
    it('should delete a user role successfully', async () => {
      const deleteUserRoleDto = {
        deleteUserUuid: 'user-456',
        groupName: 'TestGroup',
        roleId: 1
      };
      const userUuid = 'user-123';
  
      mockGroupRepository.deleteUserRole.mockResolvedValue(undefined);
  
      await expect(service.deleteUserRole(deleteUserRoleDto, userUuid)).resolves.toBe(undefined);
      expect(mockGroupRepository.deleteUserRole).toHaveBeenCalledWith(
        deleteUserRoleDto.deleteUserUuid,
        deleteUserRoleDto.roleId,
        deleteUserRoleDto.groupName,
        userUuid
      );
    });

    it('should throw a forbidden exception if the user does not have permission', async () => {
      const deleteUserRoleDto = {
        deleteUserUuid: 'user-456',
        groupName: 'TestGroup',
        roleId: 1
      };
      const userUuid = 'user-123';

      mockGroupRepository.deleteUserRole.mockRejectedValue(new ForbiddenException("User doesn't have permission"));

      await expect(service.deleteUserRole(deleteUserRoleDto, userUuid))
        .rejects
        .toThrow(ForbiddenException);
    });
  });
});
