import { Test, TestingModule } from '@nestjs/testing';
import { GroupService } from '../../src/group/group.service';
import { GroupRepository } from '../../src/group/group.repository';

describe('GroupService', () => {
  let service: GroupService;
  let mockGroupRepository: Partial<GroupRepository>;

  beforeEach(async () => {

    mockGroupRepository = {

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
});
