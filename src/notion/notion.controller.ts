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
  ApiOAuth2,
  ApiOkResponse,
  ApiOperation,
  ApiTags,
} from '@nestjs/swagger';
import { GroupsGuard } from 'src/auth/guard/groups.guard';

@ApiTags('notion')
@ApiOAuth2(['openid', 'email', 'profile'])
@Controller('notion')
@UseGuards(GroupsGuard)
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
