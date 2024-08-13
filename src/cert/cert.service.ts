import { Injectable } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { CertTokenResDto } from './dto/res/certTokenRes.dto';
import { Client } from '@prisma/client';
import { IdpService } from 'src/idp/idp.service';
import { UserService } from 'src/user/user.service';
import { GroupService } from 'src/group/group.service';
import { CertPayload } from './types/certPayload';
import { CertInfoResDto } from './dto/res/certInfoRes.dto';

@Injectable()
export class CertService {
  constructor(
    private readonly jwtService: JwtService,
    private readonly idpService: IdpService,
    private readonly userService: UserService,
    private readonly groupService: GroupService,
  ) {}

  async createCertToken(
    idpToken: string,
    client: Client,
  ): Promise<CertTokenResDto> {
    const userInfo = await this.idpService.getUserInfo(idpToken);
    const user = await this.userService.getUserInfo(userInfo.uuid);
    return {
      token: this.jwtService.sign(
        { uuid: user.uuid },
        {
          audience: client.uuid,
        },
      ),
    };
  }

  async getCertInfo(payload: CertPayload): Promise<CertInfoResDto> {
    return this.groupService.getGroupListWithRole(payload.uuid, payload.aud);
  }
}
