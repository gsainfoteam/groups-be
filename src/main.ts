import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { ConfigService } from '@nestjs/config';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  // set CORS config
  const whitelist = [
    /https:\/\/.*groups.gistory.me/,
    /https:\/\/.*groups-fe.pages.dev/,
    /http:\/\/localhost:3000/,
  ];
  app.enableCors({
    origin: function (origin, callback) {
      if (!origin || whitelist.some((regex) => regex.test(origin))) {
        callback(null, origin);
      } else {
        callback(new Error('Not allowed by CORS'));
      }
    },
    methods: 'GET,HEAD,PUT,PATCH,POST,DELETE,OPTIONS',
    preflightContinue: false,
    optionsSuccessStatus: 204,
    credentials: true,
  });
  // load config service
  const configService = app.get(ConfigService);
  // swagger config
  const config = new DocumentBuilder()
    .setTitle('Groups API')
    .setDescription('The Groups API')
    .setVersion('1.0')
    .addBearerAuth(
      {
        type: 'http',
        description: 'Third-party client authentication',
      },
      'third-party',
    )
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
              profile: 'profile',
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
      initOAuth: {
        usePkceWithAuthorizationCodeGrant: true,
        additionalQueryStringParams: { nonce: 'TheNonce' },
      },
    },
  });
  // start server
  await app.listen(3000);
}
bootstrap();
