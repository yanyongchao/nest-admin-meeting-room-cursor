import { 
  Entity, 
  PrimaryGeneratedColumn, 
  Column 
} from 'typeorm';

@Entity('permissions')
export class Permission {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ length: 20 })
  code: string;

  @Column({ length: 50 })
  name: string;

  @Column({ length: 100 })
  description: string;
}