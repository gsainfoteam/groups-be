import { Test, TestingModule } from '@nestjs/testing';
import { IdpService } from '../../src/idp/idp.service';

describe('IdpService', () => {
  let service: IdpService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [IdpService],
    }).compile();

    service = module.get<IdpService>(IdpService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
