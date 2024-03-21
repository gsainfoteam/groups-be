import { Test, TestingModule } from '@nestjs/testing';
import { GroupRepository } from '../../src/group/group.repository';
import { PrismaService } from 'src/prisma/prisma.service';
import { CreateGroupDto } from 'src/group/dto/req/createGroup.dto';
import { PrismaModule } from 'src/prisma/prisma.module';
import { testConfigModule } from 'test/config/testConfig.module';

describe('GroupRepository', () => {
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
