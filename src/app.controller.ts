import { Body, Controller, Get, Post } from '@nestjs/common';
import { AppService } from './app.service';

@Controller()
export class AppController {
  constructor(private readonly appService: AppService) {}

  @Get()
  getHello(): string {
    return this.appService.getHello();
  }

  @Post('courses')
  getCoursesFromSwayam(@Body() body: any) {
    return this.appService.getCoursesFromSwayam(body);
  }

  @Post('courses/select')
  selectCourse(@Body() body: any) {
    return this.appService.handleSelect(body);
  }

  @Post('courses/init')
  initCourse(@Body() body: any) {
    return this.appService.handleInit(body);
  }

  @Post('courses/confirm')
  confirmCourse(@Body() body: any) {
    return this.appService.handleConfirm(body);
  }
}
