import { Exclude, Expose, Transform } from 'class-transformer';

export class ClientWithAuthoritiesDto {
  @Expose()
  uuid: string;

  @Expose()
  name: string;

  @Expose()
  createdAt: Date;

  @Expose()
  updatedAt: Date;

  @Expose()
  grant: boolean;

  @Expose()
  @Transform(({ obj }) => obj.ExternalAuthority.map(auth => auth.authority))
  authorities: string[];
}