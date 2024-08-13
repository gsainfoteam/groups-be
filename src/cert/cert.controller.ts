import { Body, Controller, Get, Post, Req, UseGuards } from '@nestjs/common';
import { CertService } from './cert.service';
import {
  ApiForbiddenResponse,
  ApiInternalServerErrorResponse,
  ApiOperation,
  ApiTags,
  ApiUnauthorizedResponse,
} from '@nestjs/swagger';
import { ClientGuard } from 'src/client/guard/client.guard';
import { GetClient } from 'src/client/decorator/getClient.decorator';
import { Client } from '@prisma/client';
import { CreateCertTokenDto } from './dto/req/createCertToken.dto';
import { CertTokenResDto } from './dto/res/certTokenRes.dto';
import { CertGuard } from './guard/cert.guard';
import { CertInfoResDto } from './dto/res/certInfoRes.dto';

@Controller('cert')
@ApiTags('cert')
export class CertController {
  constructor(private readonly certService: CertService) {}

  @ApiOperation({
    summary: 'Create certificate token',
    description:
      '해당 유저가 가입된 그룹 들을 확인할 수 있는 토큰을 생성합니다.',
  })
  @UseGuards(ClientGuard)
  @ApiUnauthorizedResponse()
  @ApiForbiddenResponse()
  @ApiInternalServerErrorResponse()
  @Post()
  async createCertToken(
    @GetClient() client: Client,
    @Body() { idpToken }: CreateCertTokenDto,
  ): Promise<CertTokenResDto> {
    return this.certService.createCertToken(idpToken, client);
  }

  @ApiOperation({
    summary: 'Get certificate information',
    description: '해당 유저가 가입된 그룹 들에 관한 정보를 가져옵니다.',
  })
  @UseGuards(CertGuard)
  @ApiUnauthorizedResponse()
  @ApiInternalServerErrorResponse()
  @Get('info')
  async getCertInfo(@Req() req: any): Promise<CertInfoResDto> {
    return this.certService.getCertInfo(req.user);
  }
}
