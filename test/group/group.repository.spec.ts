import { Test, TestingModule } from '@nestjs/testing';
import { GroupRepository } from '../../src/group/group.repository';
import { PrismaModule } from 'src/prisma/prisma.module';
import { testConfigModule } from 'test/config/testConfig.module';

describe('GroupRepository', () => {
  let repository: GroupRepository;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      imports: [PrismaModule, testConfigModule],
      providers: [GroupRepository],
    }).compile();

    repository = module.get<GroupRepository>(GroupRepository);
  });

  it('should be defined', () => {
    expect(repository).toBeDefined();
  });
});
