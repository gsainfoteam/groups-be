import { Body, Controller, Get, Post, Req, UseGuards } from '@nestjs/common';
import {
  ApiBasicAuth,
  ApiBearerAuth,
  ApiForbiddenResponse,
  ApiInternalServerErrorResponse,
  ApiOperation,
  ApiTags,
  ApiUnauthorizedResponse,
} from '@nestjs/swagger';
import { ClientGuard } from 'src/client/guard/client.guard';
import { GetClient } from 'src/client/decorator/getClient.decorator';
import { Client } from '@prisma/client';
import { ExternalGuard } from './guard/external.guard';
import { ExternalTokenResDto } from './dto/res/externalTokenRes.dto';
import { ExternalInfoResDto } from './dto/res/externalInfoRes.dto';
import { CreateExternalTokenDto } from './dto/req/createExternalToken.dto';
import { ExternalService } from './external.service';

@Controller('external')
@ApiTags('external')
export class ExternalController {
  constructor(private readonly externalService: ExternalService) {}

  @ApiOperation({
    summary: 'Create certificate token',
    description:
      '해당 유저가 가입된 그룹 들을 확인할 수 있는 토큰을 생성합니다.',
  })
  @UseGuards(ClientGuard)
  @ApiUnauthorizedResponse()
  @ApiForbiddenResponse()
  @ApiInternalServerErrorResponse()
  @ApiBasicAuth('client')
  @Post()
  async createCertToken(
    @GetClient() client: Client,
    @Body() { idpToken }: CreateExternalTokenDto,
  ): Promise<ExternalTokenResDto> {
    return this.externalService.createExternalToken(idpToken, client);
  }

  @ApiOperation({
    summary: 'Get certificate information',
    description: '해당 유저가 가입된 그룹 들에 관한 정보를 가져옵니다.',
  })
  @UseGuards(ExternalGuard)
  @ApiUnauthorizedResponse()
  @ApiInternalServerErrorResponse()
  @ApiBearerAuth('external')
  @Get('info')
  async getCertInfo(@Req() req: any): Promise<ExternalInfoResDto> {
    return this.externalService.getExternalInfo(req.user);
  }
}
