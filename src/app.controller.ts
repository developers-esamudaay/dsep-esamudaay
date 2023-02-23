import { Body, Controller, Get, Post } from '@nestjs/common';
import { AppService } from './app.service';

@Controller()
export class AppController {
  constructor(private readonly appService: AppService) {}

  @Get('bpp')
  getHello(): string {
    return this.appService.getHello();
  }

  @Post('bpp/courses')
  getCoursesFromSwayam(@Body() body: any) {
    return this.appService.getCoursesFromSwayam(body);
  }

  @Post('bpp/courses/select')
  selectCourse(@Body() body: any) {
    return this.appService.handleSelect(body);
  }

  @Post('bpp/courses/init')
  initCourse(@Body() body: any) {
    return this.appService.handleInit(body);
  }

  @Post('bpp/courses/confirm')
  confirmCourse(@Body() body: any) {
    return this.appService.handleConfirm(body);
  }
}
