import {
  ConflictException,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { Prisma, JobStatus } from '@prisma/client';
import slugify from 'slugify';
import { DatabaseService } from 'src/database/database.service';
import * as jwt from 'jsonwebtoken';

@Injectable()
export class JobPostService {
  constructor(private readonly databaseService: DatabaseService) {}

  async create(
    createJobPostDto: Prisma.JobPostingAdminCreateInput,
    token: string,
  ) {
    const decoded: any = jwt.decode(token);
    const adminEmail = decoded?.adminUserData?.email;

    // console.log('Decoded JWT:', adminEmail);

    if (adminEmail !== 'devUk9298@gmail.com') {
      throw new UnauthorizedException('Invalid admin email in token');
    }

    const slug = slugify(createJobPostDto.jobTitle, {
      lower: true,
      strict: true,
    });

    // ✅ Check for duplicates
    const existingJob = await this.databaseService.jobPostingAdmin.findUnique({
      where: { slug }, // assumes 'slug' is unique
    });

    if (existingJob) {
      throw new ConflictException(
        'Job post with the same title/slug already exists',
      );
    }

    const jobWithSlug = {
      ...createJobPostDto,
      slug,
    };

    return this.databaseService.jobPostingAdmin.create({
      data: jobWithSlug,
    });
  }

  async findAll(jobStatus?: JobStatus, page = 1, limit = 10) {
    const skip = (page - 1) * limit;

    const whereClause = jobStatus ? { status: jobStatus } : {};

    const [data, total] = await this.databaseService.$transaction([
      this.databaseService.jobPostingAdmin.findMany({
        where: whereClause,
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' }, // optional
      }),
      this.databaseService.jobPostingAdmin.count({
        where: whereClause,
      }),
    ]);

    return {
      data,
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    };
  }

  async findOne(id: number) {
    return this.databaseService.jobPostingAdmin.findUnique({
      where: {
        id,
      },
    });
  }

  async update(
    id: number,
    updateJobPostDto: Prisma.JobPostingAdminUpdateInput,
    token: string,
  ) {
    const decoded: any = jwt.decode(token);
    const adminEmail = decoded?.adminUserData?.email;

    // console.log('Decoded JWT:', adminEmail);

    if (adminEmail !== 'devUk9298@gmail.com') {
      throw new UnauthorizedException('Invalid admin email in token');
    }

    return this.databaseService.jobPostingAdmin.update({
      where: { id },
      data: updateJobPostDto,
    });
  }

  async remove(id: number, token: string) {
    const decoded: any = jwt.decode(token);
    const adminEmail = decoded?.adminUserData?.email;

    // console.log('Decoded JWT:', adminEmail);

    if (adminEmail !== 'devUk9298@gmail.com') {
      throw new UnauthorizedException('Invalid admin email in token');
    }

    return this.databaseService.jobPostingAdmin.delete({
      where: { id },
    });
  }
}
