import { Test, TestingModule } from '@nestjs/testing';
import { GroupRepository } from '../../src/group/group.repository';
import { PrismaService } from 'src/prisma/prisma.service';
import { PrismaModule } from 'src/prisma/prisma.module';
import { testConfigModule } from 'test/config/testConfig.module';
import { CreateGroupDto } from 'src/group/dto/req/createGroup.dto';

/*
// create group
describe('create group', () => {
  let repository: GroupRepository;
  let prismaService: PrismaService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      imports: [PrismaModule, testConfigModule],
      providers: [
        GroupRepository,
      ],
    }).compile();

    repository = module.get<GroupRepository>(GroupRepository);
    prismaService = module.get<PrismaService>(PrismaService);
  });

  it('should be defined', () => {
    expect(repository).toBeDefined();
  });

  describe('createGroup', () => {
    it("should create a new group", async () => {
      const groupDto: CreateGroupDto = {
        name: "TestGroup2",
        description: "This is a test group",
      };

      const result = await repository.createGroup(groupDto);
      expect(result).toHaveProperty('name');
      expect(result.name).toBe(groupDto.name);  
      expect(result.description).toBe(groupDto.description);

    });
  });
});
*/

// create user role
describe('create user role', () => {
  let repository: GroupRepository;
  let prismaService: PrismaService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      imports: [PrismaModule, testConfigModule],
      providers: [GroupRepository],
    }).compile();

    repository = module.get<GroupRepository>(GroupRepository);
    prismaService = module.get<PrismaService>(PrismaService);
  });

  it('should add a userRole to the database using existing data', async () => {
    const testGroupName = "TestGroup2"; 
    const testUserUuid = "e9f3ea37-a636-466c-b4cd-4ae52f4cac8c"; 
    const testRoleId = 2; 

    // add userRole 
    await repository.addUserRole({
      userUuid: testUserUuid,
      groupName: testGroupName,
      roleId: testRoleId,
    });

    // validate userRole 
    const addedUserRole = await prismaService.userRole.findFirst({
      where: {
        userUuid: testUserUuid,
        groupName: testGroupName,
        roleId: testRoleId,
      },
    });

    expect(addedUserRole).not.toBeNull();
    expect(addedUserRole?.userUuid).toEqual(testUserUuid);
    expect(addedUserRole?.groupName).toEqual(testGroupName);
    expect(addedUserRole?.roleId).toEqual(testRoleId);
  });
});


/*
// get user role
describe('get user role', () => {
  let repository: GroupRepository;
  let prismaService: PrismaService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      imports: [PrismaModule, testConfigModule],
      providers: [GroupRepository],
    }).compile();

    repository = module.get<GroupRepository>(GroupRepository);
    prismaService = module.get<PrismaService>(PrismaService);
  });
  it('should retrieve roles for a specific user within a group', async () => {
    const testGroupName = 'TestGroup';
    const testUserUuid = '266aa207-4b69-455b-9e53-df8cd2351f36'; 
  
    // find user-role tuple
    const roles = await repository.getUserRoles(testUserUuid, testGroupName);

    expect(roles).not.toBeNull();
    expect(roles.length).toBe(1);
  });
});
*/

/*
// delete user role
describe('delete user role', () => {
  let repository: GroupRepository;
  let prismaService: PrismaService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      imports: [PrismaModule, testConfigModule],
      providers: [GroupRepository],
    }).compile();

    repository = module.get<GroupRepository>(GroupRepository);
    prismaService = module.get<PrismaService>(PrismaService);
  });

  it('should add a userRole to the database using existing data', async () => {
    const testGroupName = "TestGroup"; 
    const testUserUuid = "266aa207-4b69-455b-9e53-df8cd2351f36"; 
    const testRoleId = 1; 

    // check user-role tuple
    let addedUserRole = await prismaService.userRole.findFirst({
      where: {
        userUuid: testUserUuid,
        groupName: testGroupName,
        roleId: testRoleId,
      },
    });

    expect(addedUserRole).not.toBeNull();

    // delete userRole
    await repository.deleteGroupMemberRoles(testGroupName, testUserUuid);

    // userRole validation
    let deletedUserRole = await prismaService.userRole.findFirst({
      where: {
        userUuid: testUserUuid,
        groupName: testGroupName,
        roleId: testRoleId,
      },
    });

    expect(deletedUserRole).toBeNull();
  });
});
*/