import { Controller, Get } from '@nestjs/common';
import {
  ApiInternalServerErrorResponse,
  ApiOkResponse,
  ApiOperation,
  ApiTags,
} from '@nestjs/swagger';

@Controller()
@ApiTags('health-check')
export class AppController {
  @ApiOperation({
    summary: 'Health check',
    description: 'Check if the server is up and running',
  })
  @ApiOkResponse({
    description: 'Server is up and running',
    content: {
      'application/json': {
        examples: {
          pong: {
            value: 'pong',
            description: 'Server is up and running',
          },
        },
      },
    },
  })
  @ApiInternalServerErrorResponse({ description: 'Internal server error' })
  @Get()
  async health(): Promise<string> {
    return 'pong';
  }
}
