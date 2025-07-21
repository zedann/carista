import { Injectable, NotFoundException } from '@nestjs/common';
import { CreateReportDto } from './dtos/create-report.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Report } from './report.entity';
import { User } from 'src/users/user.entity';
import { GetEstimateDto } from './dtos/get-estimate.dto';

@Injectable()
export class ReportsService {
  constructor(
    @InjectRepository(Report)
    private readonly reportsRepository: Repository<Report>,
  ) {}
  async create(createReportDto: CreateReportDto, user: User) {
    const report = this.reportsRepository.create(createReportDto);
    report.user = user;

    return await this.reportsRepository.save(report);
  }

  async changeApproval(id: number, approved: boolean) {
    const report = await this.reportsRepository.findOne({
      where: {
        id,
      },
    });

    if (!report) throw new NotFoundException('Report Not Found');
    report.approved = approved;
    return await this.reportsRepository.save(report);
  }

  async createEstimate(estimateDto: GetEstimateDto) {
    return this.reportsRepository
      .createQueryBuilder()
      .select('AVG(price)', 'price')
      .where(
        `(make = :make) AND 
        (model=:model) AND 
        (lng - :lng BETWEEN -5 AND 5) AND 
        (lat - :lat BETWEEN -5 AND 5) AND 
        (year - :year BETWEEN -3 AND 3) AND
        (approved IS TRUE)
         
        `,
        {
          make: estimateDto.make,
          model: estimateDto.model,
          lng: estimateDto.lng,
          lat: estimateDto.lat,
          year: estimateDto.year,
        },
      )
      .orderBy('ABS(mileage - :mileage)', 'ASC')
      .setParameters({ mileage: estimateDto.mileage })
      .limit(3)
      .getRawOne();
  }
}
