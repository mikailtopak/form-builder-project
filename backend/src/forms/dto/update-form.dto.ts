import { IsOptional, IsString, IsArray, IsObject } from 'class-validator';
import { FormFieldDto } from './create-form.dto';

export class UpdateFormDto {
  @IsOptional()
  @IsString()
  title?: string;

  @IsOptional()
  @IsString()
  description?: string;

  @IsOptional()
  @IsArray()
  fields?: FormFieldDto[];

  @IsOptional()
  @IsObject()
  rules?: any;
}