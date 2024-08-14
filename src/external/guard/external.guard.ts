import { AuthGuard } from '@nestjs/passport';

export class ExternalGuard extends AuthGuard('external') {}
