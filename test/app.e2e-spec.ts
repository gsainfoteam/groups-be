import { Test, TestingModule } from '@nestjs/testing';
import { AppModule } from '../src/app.module';
import * as request from 'supertest';
import { INestApplication, ExecutionContext } from '@nestjs/common';
import { UserGuard } from 'src/user/guard/user.guard';
import { PrismaService } from '@lib/prisma';

describe('GroupController (e2e)', () => {
  let app: INestApplication;
  let prismaService: PrismaService;
  /*
  데이터베이스에 있어야 하는 값들
  Group : TestTeam
  User : d75f9a3b-b110-437e-9287-eaaf5965849d (인증 역할)
       : 9cb6a0d8-3c07-4311-a5eb-3e1dd6628bbd (테스트 역할)
  */
  async function initializeApp(
    overrideGuardFunction?: (context: ExecutionContext) => boolean,
  ) {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    })
      .overrideGuard(UserGuard)
      .useValue({
        canActivate: overrideGuardFunction
          ? overrideGuardFunction
          : (context: ExecutionContext) => {
              const req = context.switchToHttp().getRequest();
              req.user = { uuid: 'd75f9a3b-b110-437e-9287-eaaf5965849d' }; // TestUser
              return true;
            },
      })
      .compile();

    app = moduleFixture.createNestApplication();
    await app.init();
    prismaService = app.get<PrismaService>(PrismaService);
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
        description: 'A new team for testing',
      };

      await request(app.getHttpServer())
        .post('/group')
        .send(newGroup)
        .expect(201)
        .then((response) => {
          expect(response.body.name).toEqual(newGroup.name);
          expect(response.body.description).toEqual(newGroup.description);
        });
    });

    it('이미 존재하는 Group을 만들 때 처리할 수 있는가.', async () => {
      app = await initializeApp();
      const newGroup = {
        name: 'NewTestTeam',
        description: 'A new team for testing',
      };

      await request(app.getHttpServer())
        .post('/group')
        .send(newGroup)
        .expect(409)
        .then((response) => {
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
        .then((response) => {
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
        .then((response) => {
          expect(response.body.message).toContain('does not exist');
        });
    });
  });

  describe('/group/:name (PATCH)', () => {
    it('Group을 올바르게 수정할 수 있는가.', async () => {
      app = await initializeApp();
      const groupName = 'NewTestTeam';
      const updateData = {
        description: 'Updated description for testing',
      };

      await request(app.getHttpServer())
        .patch(`/group/${groupName}`)
        .send(updateData)
        .expect(200)
        .then((response) => {
          expect(response.body.description).toEqual(updateData.description);
        });
    });

    it('존재하지 않는 Group을 수정할 때 처리할 수 있는가.', async () => {
      app = await initializeApp();
      const groupName = 'NonExistentGroup';
      const updateData = {
        description: 'This update should fail',
      };

      await request(app.getHttpServer())
        .patch(`/group/${groupName}`)
        .send(updateData)
        .expect(404)
        .then((response) => {
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
        .then((response) => {
          expect(response.body).toBeTruthy();
        });
    });

    it('존재하지 않는 Group을 삭제할 때 처리할 수 있는가.', async () => {
      app = await initializeApp();
      const groupName = 'NonExistentGroup';

      await request(app.getHttpServer())
        .delete(`/group/${groupName}`)
        .expect(404)
        .then((response) => {
          expect(response.body.message).toContain('does not exist');
        });
    });
  });

  describe('/group/:name/member (POST)', () => {
    it('group에 member을 올바르게 추가할 수 있는가.', async () => {
      app = await initializeApp();
      const groupName = 'TestTeam';
      const newMember = {
        uuid: '9cb6a0d8-3c07-4311-a5eb-3e1dd6628bbd', // 새로운 user
      };

      await request(app.getHttpServer())
        .post(`/group/${groupName}/member`)
        .send(newMember)
        .expect(201)
        .then((response) => {
          expect(response.body).toHaveProperty('groupName', groupName);
          expect(response.body).toHaveProperty('userUuid', newMember.uuid);
          expect(response.body).toHaveProperty('createdAt');
        });
    });

    it('member가 이미 group에 있을 때 처리할 수 있는가.', async () => {
      app = await initializeApp();
      const groupName = 'TestTeam';
      const existingMember = {
        uuid: '9cb6a0d8-3c07-4311-a5eb-3e1dd6628bbd',
      };

      await request(app.getHttpServer())
        .post(`/group/${groupName}/member`)
        .send(existingMember)
        .expect(409)
        .then((response) => {
          expect(response.body.message).toContain(
            'User already exists in group',
          );
        });
    });
  });

  describe('/group/:name/member (GET)', () => {
    it('성공적으로 group member 리스트를 받아오는가.', async () => {
      app = await initializeApp();
      const groupName = 'TestTeam';

      await request(app.getHttpServer())
        .get(`/group/${groupName}/member`)
        .expect(200)
        .then((response) => {
          expect(Array.isArray(response.body)).toBeTruthy();
          expect(response.body.length).toBeGreaterThan(0);
          expect(response.body[0]).toHaveProperty('uuid');
        });
    });
  });

  describe('/group/:name/member/:uuid (DELETE)', () => {
    it('group에 추가했던 user을 성공적으로 제거할 수 있는가.', async () => {
      app = await initializeApp();
      const groupName = 'TestTeam';
      const memberUuid = '9cb6a0d8-3c07-4311-a5eb-3e1dd6628bbd';

      await request(app.getHttpServer())
        .delete(`/group/${groupName}/member/${memberUuid}`)
        .expect(200)
        .then((response) => {
          expect(response.body).toHaveProperty('groupName', groupName);
          expect(response.body).toHaveProperty('userUuid', memberUuid);
        });
    });

    it('group에서 존재하지 않는 user을 제거할 때 처리 가능한가.', async () => {
      app = await initializeApp();
      const groupName = 'TestTeam';
      const nonExistentMemberUuid = '9cb6a0d8-3c07-4311-a5eb-3e1dd6628bbd';

      await request(app.getHttpServer())
        .delete(`/group/${groupName}/member/${nonExistentMemberUuid}`)
        .expect(403)
        .then((response) => {
          expect(response.body.message).toContain("doesn't have permission");
        });
    });

    describe('/group/:groupName/role (GET)', () => {
      it('group의 role들을 올바르게 가져올 수 있는가.', async () => {
        app = await initializeApp();
        const groupName = 'TestTeam';

        await request(app.getHttpServer())
          .get(`/group/${groupName}/role`)
          .expect(200)
          .then((response) => {
            expect(Array.isArray(response.body.list)).toBeTruthy();
            expect(response.body.list.length).toBeGreaterThan(0);
            expect(response.body.list[0]).toHaveProperty('id');
            expect(response.body.list[0]).toHaveProperty('name');
            expect(response.body.list[0]).toHaveProperty('authoities');
          });
      });
    });

    describe('/group/:groupName/role (POST)', () => {
      it('successfully creates a new role within a group', async () => {
        app = await initializeApp();
        const groupName = 'TestTeam';
        const newRole = {
          name: 'NewRole',
          authorities: ['ROLE_CREATE'],
          externalAuthorities: ['ZIGGLE_WRITE_NOTICE'],
        };

        await request(app.getHttpServer())
          .post(`/group/${groupName}/role`)
          .send(newRole)
          .expect(201);
        // role 부분의 출력이 없기에 그냥 오류 없는 것만 감지
      });

      it('이미 있는 user role을 추가할 때 처리할 수 있는가.', async () => {
        app = await initializeApp();
        const groupName = 'TestTeam';
        const newRole = {
          name: 'NewRole',
          authorities: ['ROLE_CREATE'],
          externalAuthorities: ['ZIGGLE_WRITE_NOTICE'],
        };

        await request(app.getHttpServer())
          .post(`/group/${groupName}/role`)
          .send(newRole)
          .expect(409)
          .then((response) => {
            expect(response.body.message).toContain('Role already exists');
          });
      });

      it('없는 group에 role을 추가할 수 있는가.', async () => {
        app = await initializeApp();
        const groupName = 'notExistTeam';
        const newRole = {
          name: 'NewRole',
          authorities: ['ROLE_CREATE'],
          externalAuthorities: ['ZIGGLE_WRITE_NOTICE'],
        };

        await request(app.getHttpServer())
          .post(`/group/${groupName}/role`)
          .send(newRole)
          .expect(403)
          .then((response) => {
            expect(response.body.message).toContain('Group not found');
          });
      });
    });
  });

  describe('/group/:groupName/role/:id (PUT)', () => {
    it('role이 정상적으로 update될 수 있는가.', async () => {
      const groupName = 'TestTeam';
      const roleId = 2;
      const updateRoleDto = {
        authorities: ['ROLE_UPDATE'],
        externalAuthorities: ['ZIGGLE_MANAGE_TASKS'],
      };

      await request(app.getHttpServer())
        .put(`/group/${groupName}/role/${roleId}`)
        .send(updateRoleDto)
        .expect(200);
    });

    it('없는 group을 update할 때 처리할 수 있는가.', async () => {
      const groupName = 'TestTeam1';
      const roleId = 1;
      const updateRoleDto = {
        authorities: ['ROLE_UPDATE'],
        externalAuthorities: ['ZIGGLE_MANAGE_TASKS'],
      };

      await request(app.getHttpServer())
        .put(`/group/${groupName}/role/${roleId}`)
        .send(updateRoleDto)
        .expect(403)
        .then((response) => {
          expect(response.body.message).toContain('Group not found');
        });
    });
  });

  describe('/group/:groupName/member/:uuid/role/:id (POST)', () => {
    it('user에 role을 적용할 수 있는가.', async () => {
      const groupName = 'TestTeam';
      const roleId = 2; // 존재하는 역할 ID
      const newMember = {
        uuid: '9cb6a0d8-3c07-4311-a5eb-3e1dd6628bbd', // 새로운 user
      };

      await request(app.getHttpServer())
        .post(`/group/${groupName}/member/${newMember.uuid}/role/${roleId}`)
        .expect(201);
    });
  });

  describe('/group/:groupName/member/:uuid/role/:id (DELETE)', () => {
    it('user에게 적용된 rule을 지울 수 있는가.', async () => {
      const groupName = 'TestTeam';
      const memberUuid = '9cb6a0d8-3c07-4311-a5eb-3e1dd6628bbd';
      const roleId = 2;

      await request(app.getHttpServer())
        .delete(`/group/${groupName}/member/${memberUuid}/role/${roleId}`)
        .expect(200);
    });
  });

  describe('/group/:groupName/role/:id (DELETE)', () => {
    it('group의 role을 성공적으로 삭제할 수 있는가.', async () => {
      app = await initializeApp();
      const groupName = 'TestTeam';
      const roleId = 2;

      await request(app.getHttpServer())
        .delete(`/group/${groupName}/role/${roleId}`)
        .expect(200);
      // role 부분의 출력이 없기에 그냥 오류 없는 것만 감지
    });

    it('없는 user-role을 삭제할 때 처리할 수 있는가.', async () => {
      app = await initializeApp();
      const groupName = 'TestTeam';
      const roleId = 2;

      await request(app.getHttpServer())
        .delete(`/group/${groupName}/role/${roleId}`)
        .expect(403)
        .then((response) => {
          expect(response.body.message).toContain('Role not found');
        });
    });
  });

  afterEach(async () => {
    await app.close();
  });
});
