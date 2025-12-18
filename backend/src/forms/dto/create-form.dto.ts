import { IsArray, IsNotEmpty, IsObject, IsOptional, IsString } from 'class-validator';

export class ValidationRuleDto {
  @IsString()
  @IsNotEmpty()
  type: string;

  @IsOptional()
  value?: any;

  @IsString()
  @IsNotEmpty()
  message: string;
}

export class FormFieldDto {
  @IsString()
  @IsNotEmpty()
  id: string;

  @IsString()
  @IsNotEmpty()
  type: string;

  @IsString()
  @IsNotEmpty()
  label: string;

  @IsOptional()
  @IsString()
  placeholder?: string;

  @IsNotEmpty()
  required: boolean;

  @IsOptional()
  @IsArray()
  validationRules?: ValidationRuleDto[];

  @IsOptional()
  @IsArray()
  options?: string[];

  @IsOptional()
  defaultValue?: any;
}

export class CreateFormDto {
  @IsString()
  @IsNotEmpty()
  title: string;

  @IsOptional()
  @IsString()
  description?: string;

  @IsArray()
  @IsNotEmpty()
  fields: FormFieldDto[];

  @IsOptional()
  @IsObject()
  rules?: any; // Kural motoru kuralları
}