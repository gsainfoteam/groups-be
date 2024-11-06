import { ForbiddenException, Injectable, Logger } from '@nestjs/common';
import { ClientRepository } from './client.repository';
import { Client } from '@prisma/client';
import * as bcrypt from 'bcryptjs';
import * as crypto from 'crypto';
import { RegisterClientDto } from './dto/req/registerClient.dto';
import { ConfigService } from '@nestjs/config';
import { firstValueFrom } from 'rxjs';
import { HttpService } from '@nestjs/axios';

@Injectable()
export class ClientService {
  private readonly logger = new Logger(ClientService.name);
  private readonly SlACK_WEBHOOK_URL: string;
  constructor(
    private readonly clientRepository: ClientRepository,
    private readonly httpService: HttpService,
    private readonly configService: ConfigService,
  ) {
    this.SlACK_WEBHOOK_URL =
      this.configService.getOrThrow<string>('SLACK_WEBHOOK_URL');
  }

  /**
   * generate a password and create a new client and grant the request through slack
   * @param param0 dto object containing the client name
   * @returns created client object
   */
  async register({ name }: RegisterClientDto): Promise<Client> {
    this.logger.log(`registering client: ${name}`);
    const { secretKey, hashed } = this.generateClientSecret();
    const result = await this.clientRepository.create({
      name,
      password: hashed,
    });
    await this.grantRequestThroughSlack(result);
    return {
      ...result,
      password: secretKey,
    };
  }

  /**
   * validate the client and delete the client
   * @param uuid uuid of the client to delete
   * @param password password of the client to delete
   */
  async delete(uuid: string, password: string): Promise<void> {
    this.logger.log(`deleting client: ${uuid}`);
    if (!(await this.validate(uuid, password))) {
      this.logger.debug(`invalid password`);
      throw new ForbiddenException('invalid password');
    }
    await this.clientRepository.deleteByUuid(uuid);
  }

  async addAuthority(uuid: string, authority: string): Promise<void> {
    this.logger.log(`adding authority: ${authority} to client: ${uuid}`);
    await this.clientRepository.addAuthority(uuid, authority);
  }

  async removeAuthority(uuid: string, authority: string): Promise<void> {
    this.logger.log(`removing authority: ${authority} from client: ${uuid}`);
    await this.clientRepository.removeAuthority(uuid, authority);
  }

  /**
   * validate the client
   * @param uuid uuid of the client to validate
   * @param password password of the client to validate
   * @returns Client object if the client is valid, otherwise null
   */
  async validate(uuid: string, password: string): Promise<Client | null> {
    this.logger.log(`validating client: ${uuid}`);
    const client = await this.clientRepository.findByUuid(uuid);
    if (client && (await bcrypt.compare(password, client.password))) {
      return client;
    }
    return null;
  }

  private async grantRequestThroughSlack({
    uuid,
    name,
  }: Client): Promise<void> {
    this.logger.log(`granting request through slack for client uuid: ${uuid}`);
    await firstValueFrom(
      this.httpService.post(this.SlACK_WEBHOOK_URL, {
        text: `Service server sends permission request for client ${name}(${uuid})`,
        attachments: [
          {
            color: '#36a64f',
            title: 'Details',
            fields: [
              { title: 'client name', value: name },
              { title: 'client uuid', value: uuid },
            ],
          },
        ],
      }),
    );
  }

  private generateClientSecret(): { secretKey: string; hashed: string } {
    const secretKey = crypto
      .randomBytes(32)
      .toString('base64')
      .replace(/[+\/=]/g, '');
    return {
      secretKey,
      hashed: bcrypt.hashSync(secretKey, bcrypt.genSaltSync(10)),
    };
  }
  /**
   * Retrieve the client information along with the list of authorities assigned to the client
   * @param uuid uuid of the client
   * @returns ClientWithAuthoritiesDto containing client info and authorities
   */
  async getClientWithAuthorities(uuid: string): Promise<ClientWithAuthoritiesDto> {
    this.logger.log(`Retrieving client info and authorities for client: ${uuid}`);
    const clientData = await this.clientRepository.getClientWithAuthorities(uuid);

    if (!clientData) {
      this.logger.debug(`Client not found with uuid: ${uuid}`);
      throw new ForbiddenException('invalid client');
    }

    // Convert data to match ClientWithAuthoritiesDto structure
    return {
      uuid: clientData.uuid,
      name: clientData.name,
      createdAt: clientData.createdAt,
      updatedAt: clientData.updatedAt,
      grant: clientData.grant,
      authorities: clientData.ExternalAuthority.map((auth) => auth.authority),
    };
  }
}