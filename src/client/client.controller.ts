import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  UseGuards,
  UsePipes,
  ValidationPipe,
} from '@nestjs/common';
import {
  ApiBasicAuth,
  ApiConflictResponse,
  ApiCreatedResponse,
  ApiForbiddenResponse,
  ApiInternalServerErrorResponse,
  ApiOkResponse,
  ApiOperation,
  ApiTags,
  ApiUnauthorizedResponse,
} from '@nestjs/swagger';
import { ClientService } from './client.service';
import { RegisterClientDto } from './dto/req/registerClient.dto';
import { ClientResDto } from './dto/res/clientRes.dto';
import { DeleteClientDto } from './dto/req/deleteClient.dto';
import { ClientGuard } from './guard/client.guard';
import { GetClient } from './decorator/getClient.decorator';
import { Client } from '@prisma/client';
import { PermissionDto } from './dto/req/permission.dto';
import { ExpandedClientResDto } from './dto/res/expandedClientRes.dto';
import { UpdateClientDto } from './dto/req/updateClient.dto';

@ApiTags('client')
@Controller('client')
@UsePipes(new ValidationPipe({ transform: true }))
export class ClientController {
  constructor(private readonly clientService: ClientService) {}

  @ApiOperation({
    summary: 'Get clients',
    description: 'Get clients with name and uuid',
  })
  @ApiOkResponse({
    description: 'The clients have been successfully fetched.',
    type: [ExpandedClientResDto],
  })
  @ApiInternalServerErrorResponse({
    description: 'Unknown errors',
  })
  @Get(':uuid')
  async getClient(@Param('uuid') uuid: string): Promise<ExpandedClientResDto> {
    return this.clientService.getClient(uuid);
  }

  @ApiOperation({
    summary: 'Register a new client',
    description:
      'Register a new client with name, and return the client object with the password(Secret key)',
  })
  @ApiCreatedResponse({
    description: 'The client has been successfully registered.',
    type: ClientResDto,
  })
  @ApiConflictResponse({
    description: 'The client name already exists.',
  })
  @ApiInternalServerErrorResponse({
    description: 'Unknown errors',
  })
  @Post()
  async register(@Body() body: RegisterClientDto): Promise<ClientResDto> {
    return this.clientService.register(body);
  }

  @ApiOperation({
    summary: 'Update a client',
    description: 'Update the redirect URI of the client by uuid',
  })
  @ApiOkResponse({
    description: 'The client has been successfully updated.',
  })
  @ApiInternalServerErrorResponse({
    description: 'Unknown errors',
  })
  @Patch(':uuid')
  async update(
    @Param('uuid') uuid: string,
    @Body() body: UpdateClientDto,
  ): Promise<void> {
    return this.clientService.update(body, uuid);
  }

  @ApiOperation({
    summary: 'Delete a client',
    description: 'Delete a client by uuid and password(Secret key)',
  })
  @ApiOkResponse({
    description: 'The client has been successfully deleted.',
  })
  @ApiForbiddenResponse({
    description: 'Invalid password or client not found',
  })
  @ApiInternalServerErrorResponse({
    description: 'Unknown errors',
  })
  @Delete(':uuid')
  async delete(
    @Param('uuid') uuid: string,
    @Body() { password }: DeleteClientDto,
  ): Promise<void> {
    await this.clientService.delete(uuid, password);
  }

  @ApiOperation({
    summary: 'Add permission to a client',
    description: 'Add permission to a client by uuid',
  })
  @ApiOkResponse()
  @ApiUnauthorizedResponse()
  @ApiForbiddenResponse()
  @ApiInternalServerErrorResponse()
  @ApiBasicAuth('client')
  @Post('permission')
  @UseGuards(ClientGuard)
  async addPermission(
    @GetClient() client: Client,
    @Body() { permission }: PermissionDto,
  ): Promise<void> {
    await this.clientService.addPermission(client.uuid, permission);
  }

  @ApiOperation({
    summary: 'Remove permission from a client',
    description: 'Remove permission from a client by uuid',
  })
  @ApiOkResponse()
  @ApiUnauthorizedResponse()
  @ApiForbiddenResponse()
  @ApiInternalServerErrorResponse()
  @ApiBasicAuth('client')
  @Delete('permission')
  @UseGuards(ClientGuard)
  async removePermission(
    @GetClient() client: Client,
    @Body() { permission }: PermissionDto,
  ): Promise<void> {
    await this.clientService.removePermission(client.uuid, permission);
  }
}
