import { INestApplication } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import * as request from 'supertest';
import { AppModule } from '../src/app.module';

// DB에 연결되었는지 확인
describe('GroupController (e2e)', () => {
  let app: INestApplication;

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    await app.init();
  });

  it('/group (GET) should return group list', async () => {
    const response = await request(app.getHttpServer())
      .get('/group')
      .expect(200);
    // 실제로 아래 조건에 해당하는 값이 return 되었는가
    expect(Array.isArray(response.body)).toBe(true);
    expect(response.body.length).toBeGreaterThan(0);
    response.body.forEach((group: any)  => {
      expect(group).toHaveProperty('name');
      expect(group).toHaveProperty('description');
    });
  });

  afterAll(async () => {
    await app.close();
  });
});

// POST요청으로 group 만들기
describe('GroupController (e2e)', () => {
  let app: INestApplication;

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    await app.init();
  });

  it('/group (POST) should create a new group', () => {
    const dto = {
      name: 'Infoteam',
      description: 'Infoteam is...',
    };

    return request(app.getHttpServer())
      .post('/group')
      .send(dto)
      .expect(201) 
      .then((response) => {
        expect(response.body).toEqual({
          ...dto,
        });
      });
  });

  afterAll(async () => {
    await app.close();
  });
});