import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { ConfigService } from '@nestjs/config';
import { MethodNotAllowedException } from '@nestjs/common';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  // set CORS config
  const whitelist = [
    /https:\/\/.*groups.gistory.me/,
    /https:\/\/.*groups-fe.pages.dev/,
    /http:\/\/localhost:3000/,
  ];
  const pathWhitelist = [
    '/third-party/authorize',
    '/third-party/token',
    '/third-party/userinfo',
  ];
  app.enableCors((req, callback) => {
    const origin = req.headers.origin;
    const url = req.url;
    // Extract pathname from URL (remove query parameters)
    const pathname = url.split('?')[0];
    if (!origin) {
      // No origin, no CORS
      callback(null, {
        origin: whitelist,
        methods: ['GET', 'HEAD', 'PUT', 'PATCH', 'POST', 'DELETE'],
        optionsSuccessStatus: 204,
        preflightContinue: false,
        credentials: true,
      });
      return;
    } else if (pathWhitelist.some((path) => pathname.endsWith(path))) {
      // Allow all origins for the specified paths
      callback(null, {
        origin,
        methods: ['GET', 'HEAD', 'PUT', 'PATCH', 'POST', 'DELETE'],
        optionsSuccessStatus: 204,
        preflightContinue: false,
        credentials: true,
      });
    } else if (whitelist.some((regex) => regex.test(origin))) {
      // Allow only whitelisted origins
      callback(null, {
        origin,
        methods: ['GET', 'HEAD', 'PUT', 'PATCH', 'POST', 'DELETE'],
        optionsSuccessStatus: 204,
        preflightContinue: false,
        credentials: true,
      });
    } else {
      callback(new MethodNotAllowedException(), {
        origin: false,
        methods: ['GET', 'HEAD', 'PUT', 'PATCH', 'POST', 'DELETE'],
        optionsSuccessStatus: 204,
        preflightContinue: false,
        credentials: true,
      });
    }
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
