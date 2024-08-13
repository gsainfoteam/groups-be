import { AuthGuard } from '@nestjs/passport';

export class CertGuard extends AuthGuard('cert') {}
