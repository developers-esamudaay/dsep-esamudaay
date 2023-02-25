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
    this.appService.getCoursesFromSwayam(body);
    return this.appService.aknowledge();
  }

  @Post('bpp/select')
  selectCourse(@Body() body: any) {
    this.appService.handleSelect(body);
    return this.appService.aknowledge();
  }

  @Post('bpp/init')
  initCourse(@Body() body: any) {
    this.appService.handleInit(body);
    return this.appService.aknowledge();
  }

  @Post('bpp/confirm')
  confirmCourse(@Body() body: any) {
    this.appService.handleConfirm(body);
    return this.appService.aknowledge();
  }

  // BAP SIDE
  @Get('bap')
  getHelloBap(): string {
    return this.appService.getHelloBap();
  }

  @Post('bap/on_search')
  onSearch(@Body() body: any) {
    this.appService.handleOnSearch(body);
    return this.appService.aknowledge();
  }
}
