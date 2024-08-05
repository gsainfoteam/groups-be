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
}
