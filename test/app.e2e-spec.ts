import { Test, TestingModule } from '@nestjs/testing';
import { AppModule } from '../src/app.module';
import * as request from 'supertest';
import { INestApplication, ExecutionContext } from '@nestjs/common';
import { UserGuard } from 'src/user/guard/user.guard';

describe('GroupController (e2e)', () => {
  let app: INestApplication;

  async function initializeApp(overrideGuardFunction?: (context: ExecutionContext) => boolean) {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    })
    .overrideGuard(UserGuard)
    .useValue({
      canActivate: overrideGuardFunction ? overrideGuardFunction : (context: ExecutionContext) => {
        const req = context.switchToHttp().getRequest();
        req.user = { uuid: 'd75f9a3b-b110-437e-9287-eaaf5965849d' }; // TestUser
        return true;
      }
    })
    .compile();

    app = moduleFixture.createNestApplication();
    await app.init();
    return app;
  }

  afterEach(async () => {
    await app.close();
  });

  describe('/group (POST)', () => {
    it('올바르게 Group을 만들 수 있는가.', async () => {
      app = await initializeApp();
      const newGroup = {
        name: 'NewTestTeam',
        description: 'A new team for testing'
      };

      await request(app.getHttpServer())
        .post('/group')
        .send(newGroup)
        .expect(201)
        .then(response => {
          expect(response.body.name).toEqual(newGroup.name);
          expect(response.body.description).toEqual(newGroup.description);
        });
    });

    it('이미 존재하는 Group을 만들 때 처리할 수 있는가.', async () => {
      app = await initializeApp();
      const newGroup = {
        name: 'NewTestTeam',
        description: 'A new team for testing'
      };

      await request(app.getHttpServer())
        .post('/group')
        .send(newGroup)
        .expect(409)
        .then(response => {
          expect(response.body.message).toContain('already exists');
        });
    });
  });

  describe('/group (GET)', () => {
    it('올바르게 Group 리스트를 반환하는가.', async () => {
      app = await initializeApp();
      const { body } = await request(app.getHttpServer())
        .get('/group')
        .expect(200);

      expect(body).toBeInstanceOf(Array);
      expect(body.length).toBeGreaterThan(0);
      expect(body[0]).toHaveProperty('name');
      expect(body[0]).toHaveProperty('description');
    });

    it('올바르게 Group을 반환하는가.', async () => {
        app = await initializeApp();
        const groupName = 'NewTestTeam'; 
        await request(app.getHttpServer())
          .get(`/group/${groupName}`)
          .expect(200)
          .then(response => {
            expect(response.body).toHaveProperty('name', groupName);
            expect(response.body).toHaveProperty('description');
          });
      });
  
      it('없는 Group을 Get요청할 때 처리할 수 있는가.', async () => {
        app = await initializeApp();
        const groupName = 'NonExistentGroup';
        await request(app.getHttpServer())
          .get(`/group/${groupName}`)
          .expect(404)
          .then(response => {
            expect(response.body.message).toContain('does not exist');
          });
      });
  });

  describe('/group/:name (PATCH)', () => {
    it('Group을 올바르게 수정할 수 있는가.', async () => {
      app = await initializeApp();
      const groupName = 'NewTestTeam';
      const updateData = {
        description: 'Updated description for testing'
      };

      await request(app.getHttpServer())
        .patch(`/group/${groupName}`)
        .send(updateData)
        .expect(200)
        .then(response => {
          expect(response.body.description).toEqual(updateData.description);
        });
    });

    it('존재하지 않는 Group을 수정할 때 처리할 수 있는가.', async () => {
      app = await initializeApp();
      const groupName = 'NonExistentGroup';
      const updateData = {
        description: 'This update should fail'
      };

      await request(app.getHttpServer())
        .patch(`/group/${groupName}`)
        .send(updateData)
        .expect(404)
        .then(response => {
          expect(response.body.message).toContain('does not exist');
        });
    });
  });

  describe('/group/:name (DELETE)', () => {
    it('Group을 올바르게 삭제할 수 있는가.', async () => {
      app = await initializeApp();
      const groupName = 'NewTestTeam';

      await request(app.getHttpServer())
        .delete(`/group/${groupName}`)
        .expect(200)
        .then(response => {
          expect(response.body).toBeTruthy();
        });
    });

    it('존재하지 않는 Group을 삭제할 때 처리할 수 있는가.', async () => {
      app = await initializeApp();
      const groupName = 'NonExistentGroup';

      await request(app.getHttpServer())
        .delete(`/group/${groupName}`)
        .expect(404)
        .then(response => {
          expect(response.body.message).toContain('does not exist');
        });
    });
  });

  afterEach(async () => {
    await app.close();
  });
});
