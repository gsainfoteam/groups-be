import {
  ConflictException,
  ForbiddenException,
  Injectable,
  InternalServerErrorException,
  Logger,
} from '@nestjs/common';
import { Client } from '@prisma/client';
import { PrismaClientKnownRequestError } from '@prisma/client/runtime/library';
import { PrismaService } from 'src/prisma/prisma.service';

@Injectable()
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
  }: Pick<Client, 'name' | 'password'>): Promise<Client> {
    this.logger.log(`creating client: ${name}`);
    return this.prismaService.client
      .create({
        data: { name, password },
      })
      .catch((error) => {
        if (error instanceof PrismaClientKnownRequestError) {
          if (error.code === 'P2002') {
            this.logger.debug(`client name already exists`);
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
    this.logger.log(`finding client: ${uuid}`);
    return this.prismaService.client.findUnique({
      where: { uuid },
    });
  }

  /**
   * Delete a client by uuid
   * @param uuid the uuid of the client to delete
   * @returns Deleted client
   */
  async deleteByUuid(uuid: string): Promise<Client> {
    this.logger.log(`deleting client: ${uuid}`);
    return this.prismaService.client
      .delete({
        where: {
          uuid,
        },
      })
      .catch((error) => {
        if (error instanceof PrismaClientKnownRequestError) {
          if (error.code === 'P2025') {
            this.logger.debug(`client not found`);
            throw new ForbiddenException('client not found');
          }
          this.logger.error(`unknown database error`);
          throw new InternalServerErrorException('unknown database error');
        }
        this.logger.error(`unknown error`);
        throw new InternalServerErrorException('unknown error');
      });
  }

  async addAuthority(uuid: string, authority: string): Promise<void> {
    this.logger.log(`adding authority: ${authority} to client: ${uuid}`);
    await this.prismaService.client
      .update({
        where: { uuid },
        data: {
          ExternalAuthority: {
            create: {
              authority,
            },
          },
        },
      })
      .catch((error) => {
        if (error instanceof PrismaClientKnownRequestError) {
          if (error.code === 'P2025') {
            this.logger.debug(`client not found`);
            throw new ForbiddenException('client not found');
          }
          this.logger.error(`unknown database error`);
          throw new InternalServerErrorException('unknown database error');
        }
        this.logger.error(`unknown error`);
        throw new InternalServerErrorException('unknown error');
      });
  }

  async removeAuthority(uuid: string, authority: string): Promise<void> {
    this.logger.log(`removing authority: ${authority} from client: ${uuid}`);
    await this.prismaService.externalAuthority
      .delete({
        where: {
          clientUuid_authority: {
            authority,
            clientUuid: uuid,
          },
        },
      })
      .catch((error) => {
        if (error instanceof PrismaClientKnownRequestError) {
          if (error.code === 'P2025') {
            this.logger.debug(`client not found`);
            throw new ForbiddenException('client not found');
          }
          this.logger.error(`unknown database error`);
          throw new InternalServerErrorException('unknown database error');
        }
        this.logger.error(`unknown error`);
        throw new InternalServerErrorException('unknown error');
      });
  }
  /**
   * Get the list of authorities assigned to a client by UUID
   * @param clientUuid UUID of the client
   * @returns Array of authorities
   */
  async getAuthoritiesByClientUuid(clientUuid: string): Promise<string[]> {
    this.logger.log(`Retrieving authorities for client: ${clientUuid}`);
    const client = await this.prismaService.client.findUnique({
      where: { uuid: clientUuid },
      select: { ExternalAuthority: { select: { authority: true } } },
    });

    if (!client) {
      this.logger.debug(`client not found`);
      throw new ForbiddenException('client not found');
    }

    // 권한 목록만 배열로 반환
    return client.ExternalAuthority.map((auth) => auth.authority);
  }
  /**
   * Retrieve client information along with authorities in a single query
   * @param uuid UUID of the client
   * @returns Client object with authorities
   */
  async getClientWithAuthorities(
    uuid: string,
  ): Promise<Client & { ExternalAuthority: { authority: string }[] }> {
    this.logger.log(`Retrieving client with authorities for uuid: ${uuid}`);
    return this.prismaService.client
      .findUnique({
        where: { uuid },
        include: {
          ExternalAuthority: {
            select: { authority: true },
          },
        },
      })
      .then((client) => {
        if (!client) {
          this.logger.debug(`client not found`);
          throw new ForbiddenException('client not found');
        }
        return client;
      })
      .catch((error) => {
        if (error instanceof PrismaClientKnownRequestError) {
          this.logger.error(`unknown database error`);
          throw new InternalServerErrorException('unknown database error');
        }
        this.logger.error(`unknown error`);
        throw new InternalServerErrorException('unknown error');
      });
    
  }
}
