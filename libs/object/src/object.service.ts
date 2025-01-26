import {
  DeleteObjectCommand,
  PutObjectCommand,
  S3Client,
} from '@aws-sdk/client-s3';
import {
  Injectable,
  InternalServerErrorException,
  Logger,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

/**
 * Service for using AWS S3.
 */
@Injectable()
export class ObjectService {
  /** The object for logging */
  private readonly logger = new Logger(ObjectService.name);
  /** The object for connecting to aws s3 */
  private readonly s3Client: S3Client;
  /** Creating the s3 client object */
  constructor(private readonly configService: ConfigService) {
    this.s3Client = new S3Client({
      region: configService.getOrThrow('AWS_S3_REGION'),
      credentials: {
        accessKeyId: configService.getOrThrow('AWS_ACCESS_KEY_ID'),
        secretAccessKey: configService.getOrThrow('AWS_SECRET_ACCESS_KEY'),
      },
    });
  }

  /**
   * Uploads an object to S3. The object will be stored in the bucket defined in the configuration.
   * Note that the type of the file is provided by multer.
   * @param key the key of the object
   * @param file the file to upload
   * @returns the uploaded object key
   * @throws InternalServerErrorException if the upload fails
   */
  async uploadObject(key: string, file: Express.Multer.File): Promise<string> {
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

  /**
   * Deletes an object from S3.
   * @param key the key of the object to delete
   * @throws InternalServerErrorException if the deletion fails
   */
  async deleteObject(key: string): Promise<void> {
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
