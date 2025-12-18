import { 
  Controller, 
  Get, 
  Post, 
  Put, 
  Delete, 
  Body, 
  Param, 
  ParseIntPipe, 
  UsePipes, 
  ValidationPipe,
  HttpCode,
  HttpStatus,
  Query
} from '@nestjs/common';
import { FormsService } from './forms.service';
import { CreateFormDto } from './dto/create-form.dto';
import { UpdateFormDto } from './dto/update-form.dto';

@Controller('forms')
export class FormsController {
  constructor(private readonly formsService: FormsService) {}

  @Post()
  @UsePipes(new ValidationPipe({ whitelist: true }))
  async createForm(@Body() createFormDto: CreateFormDto) {
    // TODO: Gerçek user ID'sini auth'dan alacağız
    // Şimdilik demo user ID: 1
    const userId = 1;
    return this.formsService.createForm(userId, createFormDto);
  }

  @Get()
  async getUserForms() {
    // TODO: Gerçek user ID'sini auth'dan alacağız
    const userId = 1;
    return this.formsService.getUserForms(userId);
  }

  @Get(':id')
  async getForm(@Param('id', ParseIntPipe) id: number) {
    return this.formsService.getFormById(id);
  }

  @Put(':id')
  @UsePipes(new ValidationPipe({ whitelist: true }))
  async updateForm(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateFormDto: UpdateFormDto,
  ) {
    return this.formsService.updateForm(id, updateFormDto);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.OK)
  async deleteForm(@Param('id', ParseIntPipe) id: number) {
    return this.formsService.deleteForm(id);
  }

  @Post(':id/submit')
  async submitForm(
    @Param('id', ParseIntPipe) id: number,
    @Body() data: any,
  ) {
    return this.formsService.submitForm(id, data);
  }

  @Get(':id/submissions')
  async getFormSubmissions(@Param('id', ParseIntPipe) id: number) {
    return this.formsService.getFormSubmissions(id);
  }

  @Post('validate')
  async validateForm(@Body() body: { data: any; fields: any[] }) {
    const errors = this.formsService.validateForm(body.data, body.fields);
    return {
      isValid: Object.keys(errors).length === 0,
      errors,
    };
  }

  @Get('health')
  @HttpCode(HttpStatus.OK)
  health() {
    return {
      status: 'ok',
      service: 'Forms API',
      timestamp: new Date().toISOString(),
      features: ['CRUD Operations', 'Validation Engine', 'Form Submissions'],
    };
  }
}