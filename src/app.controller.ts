import { Body, Controller, Get, Post } from '@nestjs/common';
import { AppService } from './app.service';

@Controller()
export class AppController {
  constructor(private readonly appService: AppService) {}

  // BPP SIDE
  @Get('bpp')
  getHello(): string {
    return this.appService.getHello();
  }

  @Post('bpp/search')
  getCoursesFromSwayam(@Body() body: any) {
    return this.appService.getCoursesFromSwayam(body);
  }

  @Post('bpp/select')
  selectCourse(@Body() body: any) {
    return this.appService.handleSelect(body);
  }

  @Post('bpp/init')
  initCourse(@Body() body: any) {
    return this.appService.handleInit(body);
  }

  @Post('bpp/confirm')
  confirmCourse(@Body() body: any) {
    return this.appService.handleConfirm(body);
  }

  // BAP SIDE
  @Get('bap')
  getHelloBap(): string {
    return this.appService.getHelloBap();
  }

  @Post('bap/on_search')
  onSearch(@Body() body: any) {
    return this.appService.handleOnSearch(body);
  }
}
