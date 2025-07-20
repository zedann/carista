import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  AfterInsert,
  AfterUpdate,
  AfterRemove,
  OneToMany,
} from 'typeorm';
import { Report } from 'src/reports/report.entity';

@Entity()
export class User {
  @PrimaryGeneratedColumn()
  id: number;
  @Column()
  email: string;
  @Column()
  password: string;

  @OneToMany(() => Report, (report) => report.user)
  reports: Report[];

  @AfterInsert()
  logInsert() {
    console.log(`User Inserted with id ${this.id}`);
  }
  @AfterUpdate()
  logUpdate() {
    console.log(`User Updated with id ${this.id}`);
  }
  @AfterRemove()
  logRemove() {
    console.log(`User Removed with id ${this.id}`);
  }
}
