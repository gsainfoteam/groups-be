import { Exclude, Expose, Transform } from 'class-transformer';
import { IsString, IsDate, IsBoolean, IsArray } from 'class-validator';

export class ClientWithAuthoritiesDto {
  @Expose()
  @IsString()
  uuid: string;

  @Expose()
  @IsString()
  name: string;

  @Expose()
  @IsDate()
  createdAt: Date;

  @Expose()
  @IsDate()
  updatedAt: Date;

  @Expose()
  @IsBoolean()
  grant: boolean;

  @Expose()
  @IsArray()
  @Transform(({ obj }) => 
      obj.ExternalAuthority?.map((auth: { authority: string }) => auth.authority) ?? []
    )
  authorities: string[];
}