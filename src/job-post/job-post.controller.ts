import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  Ip,
  Query,
  Headers,
} from '@nestjs/common';
import { JobPostService } from './job-post.service';
import { UpdateJobPostDto } from './dto/update-job-post.dto';
import { MyLoggerService } from 'src/my-logger/my-logger.service';
import { JobStatus, Prisma } from '@prisma/client';
import { SkipThrottle } from '@nestjs/throttler';

@Controller('job-post')
export class JobPostController {
  constructor(private readonly jobPostService: JobPostService) {}
  private readonly logger = new MyLoggerService(JobPostController.name);

  @Post()
  create(
    @Headers('token') token: string,
    @Body() createJobPostDto: Prisma.JobPostingAdminCreateInput,
  ) {
    return this.jobPostService.create(createJobPostDto, token);
  }

  @SkipThrottle({ default: false })
  @Get()
  findAll(
    @Ip() ip: string,
    @Query('role') jobStatus?: JobStatus,
    @Query('page') page = 1,
    @Query('limit') limit = 10,
  ) {
    this.logger.log(`Request for ALL Job Post\t${ip}`, JobPostController.name);

    const pageNum = parseInt(page as any, 10);
    const limitNum = parseInt(limit as any, 10);

    return this.jobPostService.findAll(jobStatus, pageNum, limitNum);
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.jobPostService.findOne(id);
  }

  @Patch(':id')
  update(
    @Headers('token') token: string,
    @Param('id') id: string,
    @Body() updateJobPostDto: Prisma.JobPostingAdminUpdateInput,
  ) {
    return this.jobPostService.update(id, updateJobPostDto, token);
  }

  @Delete(':id')
  remove(@Headers('token') token: string, @Param('id') id: string) {
    return this.jobPostService.remove(id, token);
  }
}
