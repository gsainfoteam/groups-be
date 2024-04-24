import { Test, TestingModule } from '@nestjs/testing';
import { GroupController } from 'src/group/group.controller';
import { GroupService } from 'src/group/group.service';
import { CreateGroupDto } from 'src/group/dto/req/createGroup.dto';

describe('GroupController', () => {
  let controller: GroupController;
  let mockGroupService: Partial<GroupService>;

  beforeEach(async () => {
    mockGroupService = {
      createGroup: jest.fn(dto => Promise.resolve({
        uuid: 'some-uuid',
        name: dto.name,
        description: dto.description || null,
        createdAt: new Date(),
      })),

    };

    const module: TestingModule = await Test.createTestingModule({
      controllers: [GroupController],
      providers: [
        {
          provide: GroupService,
          useValue: mockGroupService,
        },
      ],
    }).compile();

    controller = module.get<GroupController>(GroupController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  it('createGroup should create a group', async () => {
    const dto: CreateGroupDto = { name: 'Infoteam', description: 'Infoteam is...' };
    const result = await controller.createGroup(dto);

    expect(mockGroupService.createGroup).toHaveBeenCalledWith(dto);
    expect(result).toEqual(expect.objectContaining(dto));
  });
});
