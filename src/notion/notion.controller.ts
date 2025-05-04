import {
  Controller,
  Get,
  Param,
  UseGuards,
  UsePipes,
  ValidationPipe,
} from '@nestjs/common';
import { NotionService } from './notion.service';
import {
  ApiInternalServerErrorResponse,
  ApiOkResponse,
  ApiOperation,
  ApiTags,
} from '@nestjs/swagger';
import { UserGuard } from 'src/auth/guard/user.guard';

@ApiTags('notion')
@Controller('notion')
@UseGuards(UserGuard)
@UsePipes(new ValidationPipe({ transform: true }))
export class NotionController {
  constructor(private readonly notionService: NotionService) {}

  @ApiOperation({
    summary: 'Get record map',
    description: 'Notion pageId를 바탕으로 record map을 가져오는 API 입니다.',
  })
  @ApiOkResponse()
  @ApiInternalServerErrorResponse()
  @Get(':pageId')
  async getRecordMap(@Param('pageId') pageId: string): Promise<JSON> {
    return this.notionService.getRecordMap(pageId);
  }
}
