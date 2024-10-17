import { Injectable } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { Client } from '@prisma/client';
import { IdpService } from 'src/idp/idp.service';
import { UserService } from 'src/user/user.service';
import { GroupService } from 'src/group/group.service';
import { ExternalTokenResDto } from './dto/res/externalTokenRes.dto';
import { ExternalPayload } from './types/certPayload';
import {
  ExternalInfoResDto,
  GroupWithRoleResDto,
} from './dto/res/externalInfoRes.dto';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class ExternalService {
  private readonly s3Url: string;
  constructor(
    private readonly jwtService: JwtService,
    private readonly idpService: IdpService,
    private readonly userService: UserService,
    private readonly groupService: GroupService,
    private readonly configService: ConfigService,
  ) {
    this.s3Url = `https://s3.${configService.get<string>(
      'AWS_S3_REGION',
    )}.amazonaws.com/${configService.get<string>('AWS_S3_BUCKET_NAME')}`;
  }

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
    return {
      list: (
        await this.groupService.getGroupListWithRole(payload.sub, payload.aud)
      ).map(
        (groupWithRole) =>
          new GroupWithRoleResDto({ s3Url: this.s3Url, ...groupWithRole }),
      ),
    };
  }
}
