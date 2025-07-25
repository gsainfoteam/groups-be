import { Injectable } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';

@Injectable()
export class ThirdPartyGuard extends AuthGuard('third-party') {}
