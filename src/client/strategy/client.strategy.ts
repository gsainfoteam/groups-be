import { Injectable, UnauthorizedException } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { BasicStrategy } from 'passport-http';
import { ClientService } from '../client.service';

@Injectable()
export class ClientStrategy extends PassportStrategy(BasicStrategy, 'client') {
  constructor(private readonly clientService: ClientService) {
    super();
  }

  async validate(username: string, password: string) {
    const client = await this.clientService.validate(username, password);
    if (!client) {
      throw new UnauthorizedException();
    }
    return client;
  }
}
