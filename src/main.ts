import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { ConfigService } from '@nestjs/config';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  // load config service
  const configService = app.get(ConfigService);
  // swagger config
  const config = new DocumentBuilder()
    .setTitle('Groups API')
    .setDescription('The Groups API')
    .setVersion('1.0')
    .addBasicAuth(
      {
        type: 'http',
      },
      'client',
    )
    .addOAuth2(
      {
        type: 'oauth2',
        scheme: 'bearer',
        in: 'header',
        bearerFormat: 'token',
        flows: {
          authorizationCode: {
            authorizationUrl: configService.get('IDP_AUTH_URL'),
            tokenUrl: configService.get('IDP_TOKEN_URL'),
            scopes: {
              openid: 'openid',
              email: 'email',
              profile: ' profile',
            },
          },
        },
      },
      'oauth2',
    )
    .build();
  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api', app, document, {
    swaggerOptions: {
      oauth2RedirectUrl: `${configService.getOrThrow('BASE_URL')}/api/oauth2-redirect.html`,
      displayRequestDuration: true,
    },
  });
  // start server
  await app.listen(3000);
}
bootstrap();
