import { Loggable } from '@lib/logger/decorator/loggable';
import { PrismaService } from '@lib/prisma';
import {
  ConflictException,
  ForbiddenException,
  Injectable,
  InternalServerErrorException,
  Logger,
  NotFoundException,
} from '@nestjs/common';
import { Client } from '@prisma/client';
import { PrismaClientKnownRequestError } from '@prisma/client/runtime/library';
import { ExpandedClient } from './types/ExpandedClient.type';

@Injectable()
@Loggable()
export class ClientRepository {
  private readonly logger = new Logger(ClientRepository.name);
  constructor(private readonly prismaService: PrismaService) {}

  /**
   * Create a new client
   * @param param0 the object containing the client name and password
   * @returns Client object
   */
  async create({
    name,
    password,
    redirectUri,
  }: Pick<Client, 'name' | 'password'> &
    Partial<Pick<Client, 'redirectUri'>>): Promise<Client> {
    return this.prismaService.client
      .create({
        data: { name, password, redirectUri },
      })
      .catch((error) => {
        if (error instanceof PrismaClientKnownRequestError) {
          if (error.code === 'P2002') {
            this.logger.warn(`client name already exists`);
            throw new ConflictException('client name already exists');
          }
          this.logger.error(`unknown database error`);
          throw new InternalServerErrorException('unknown database error');
        }
        this.logger.error(`unknown error`);
        throw new InternalServerErrorException('unknown error');
      });
  }

  /**
   * Find a client by uuid. if the client is not found, return null
   * @param uuid the uuid of the client to find
   * @returns Founded client or null
   */
  async findByUuid(uuid: string): Promise<Client | null> {
    this.logger.debug(`finding client by uuid`);
  
    const client = await this.prismaService.client.findUnique({
      where: { uuid },
    });

    if (!client) {
      this.logger.debug(`client not found`);
    }
    return client;
  }

  /**
   * Find a client by uuid with permissions. if the client is not found, return null
   * @param uuid the uuid of the client to find
   * @returns Founded client or null
   */
  async findByUuidWithPermission(uuid: string): Promise<ExpandedClient | null> {
    this.logger.debug(`finding client with permissions`);
    const client = await this.prismaService.client.findUnique({
      where: { uuid },
      include: { ExternalPermission: true },
    });

    if (!client) {
      this.logger.warn(`client not found`);
    }
    return client;
  }

  /**
   * Update the redirect URI of a client
   * @param redirectUri new redirect URI
   * @param uuid uuid of the client to update
   */
  async updateRedirectUri(redirectUri: string[], uuid: string): Promise<void> {
    await this.prismaService.client.update({
      where: { uuid },
      data: { redirectUri },
    });
  }

  /**
   * Delete a client by uuid
   * @param uuid the uuid of the client to delete
   * @returns Deleted client
   */
  async deleteByUuid(uuid: string): Promise<Client> {
    return this.prismaService.client
      .delete({
        where: {
          uuid,
        },
      })
      .catch((error) => {
        if (error instanceof PrismaClientKnownRequestError) {
          if (error.code === 'P2025') {
            this.logger.warn(`client not found`);
            throw new NotFoundException('client not found');
          }
          this.logger.error(`unknown database error`);
          throw new InternalServerErrorException('unknown database error');
        }
        this.logger.error(`unknown error`);
        throw new InternalServerErrorException('unknown error');
      });
  }

  async addPermission(uuid: string, permission: string): Promise<void> {
    await this.prismaService.client
      .update({
        where: { uuid },
        data: {
          ExternalPermission: {
            create: {
              permission,
            },
          },
        },
      })
      .catch((error) => {
        if (error instanceof PrismaClientKnownRequestError) {
          if (error.code === 'P2025') {
            this.logger.warn(`client not found`);
            throw new NotFoundException('client not found');
          }
          this.logger.error(`unknown database error`);
          throw new InternalServerErrorException('unknown database error');
        }
        this.logger.error(`unknown error`);
        throw new InternalServerErrorException('unknown error');
      });
  }

  async removePermission(uuid: string, permission: string): Promise<void> {
    await this.prismaService.externalPermission
      .delete({
        where: {
          clientUuid_permission: {
            permission,
            clientUuid: uuid,
          },
        },
      })
      .catch((error) => {
        if (error instanceof PrismaClientKnownRequestError) {
          if (error.code === 'P2025') {
            this.logger.warn(`client not found`);
            throw new ForbiddenException('client not found');
          }
          this.logger.error(`unknown database error`);
          throw new InternalServerErrorException('unknown database error');
        }
        this.logger.error(`unknown error`);
        throw new InternalServerErrorException('unknown error');
      });
  }
}
