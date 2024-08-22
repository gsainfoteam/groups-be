import { Injectable } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { Client } from '@prisma/client';
import { IdpService } from 'src/idp/idp.service';
import { UserService } from 'src/user/user.service';
import { GroupService } from 'src/group/group.service';
import { ExternalTokenResDto } from './dto/res/externalTokenRes.dto';
import { ExternalPayload } from './types/certPayload';
import { ExternalInfoResDto } from './dto/res/externalInfoRes.dto';

@Injectable()
export class ExternalService {
  constructor(
    private readonly jwtService: JwtService,
    private readonly idpService: IdpService,
    private readonly userService: UserService,
    private readonly groupService: GroupService,
  ) {}

  async createExternalToken(
    idpToken: string,
    client: Client,
  ): Promise<ExternalTokenResDto> {
    const userInfo = await this.idpService.getUserInfo(idpToken);
    const user = await this.userService.getUserInfo(userInfo.uuid);
    return {
      token: this.jwtService.sign(
        {},
        {
          subject: user.uuid,
          audience: client.uuid,
        },
      ),
    };
  }

  async getExternalInfo(payload: ExternalPayload): Promise<ExternalInfoResDto> {
    return this.groupService.getGroupListWithRole(payload.sub, payload.aud);
  }
}
