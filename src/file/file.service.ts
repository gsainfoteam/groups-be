import {
  DeleteObjectCommand,
  PutObjectCommand,
  S3Client,
} from '@aws-sdk/client-s3';
import { Loggable } from '@lib/logger/decorator/loggable';
import {
  Injectable,
  InternalServerErrorException,
  Logger,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

@Injectable()
@Loggable()
export class FileService {
  private readonly logger = new Logger(FileService.name);
  private readonly s3Client: S3Client;
  constructor(private readonly configService: ConfigService) {
    this.s3Client = new S3Client({
      region: configService.getOrThrow('AWS_S3_REGION'),
      credentials: {
        accessKeyId: configService.getOrThrow('AWS_ACCESS_KEY_ID'),
        secretAccessKey: configService.getOrThrow('AWS_SECRET_ACCESS_KEY'),
      },
    });
  }

  async uploadFile(key: string, file: Express.Multer.File): Promise<string> {
    await this.s3Client
      .send(
        new PutObjectCommand({
          Bucket: this.configService.getOrThrow('AWS_S3_BUCKET'),
          Key: key,
          Body: file.buffer,
          Metadata: {
            originalName: encodeURIComponent(file.originalname),
          },
        }),
      )
      .catch((error) => {
        this.logger.error(error);
        throw new InternalServerErrorException();
      });
    return key;
  }

  async deleteFile(key: string): Promise<void> {
    await this.s3Client
      .send(
        new DeleteObjectCommand({
          Bucket: this.configService.getOrThrow('AWS_S3_BUCKET'),
          Key: key,
        }),
      )
      .catch((error) => {
        this.logger.error(error);
        throw new InternalServerErrorException();
      });
  }
}
