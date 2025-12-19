import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateFormDto } from './dto/create-form.dto';
import { UpdateFormDto } from './dto/update-form.dto';

@Injectable()
export class FormsService {
  constructor(private prisma: PrismaService) {}

  async createForm(userId: number, createFormDto: CreateFormDto) {
    // Demo user oluştur eğer yoksa
    let user = await this.prisma.user.findUnique({
      where: { id: userId },
    });

    if (!user) {
      // Demo user oluştur
      user = await this.prisma.user.create({
        data: {
          id: 1,
          email: 'demo@formbuilder.com',
          name: 'Demo User',
          password: 'demo123'
        },
      });
    }

    // Form oluştur
    const form = await this.prisma.form.create({
      data: {
        title: createFormDto.title,
        description: createFormDto.description || '',
        structure: createFormDto.fields as any,
        rules: createFormDto.rules as any,
        userId: userId,
      },
    });

    return {
      id: form.id,
      title: form.title,
      fields: form.structure,
      rules: form.rules,
      createdAt: form.createdAt,
      message: 'Form başarıyla oluşturuldu',
    };
  }

  async getAllForms() {
    const forms = await this.prisma.form.findMany({
      orderBy: { createdAt: 'desc' },
      select: {
        id: true,
        title: true,
        description: true,
        structure: true,
        rules: true,
        createdAt: true,
      },
    });

    return forms.map(form => ({
      id: form.id,
      title: form.title,
      description: form.description,
      fields: form.structure,
      rules: form.rules,
      createdAt: form.createdAt,
    }));
  }

  async getFormById(id: number) {
    const form = await this.prisma.form.findUnique({
      where: { id },
    });

    if (!form) {
      throw new NotFoundException('Form bulunamadı');
    }

    return {
      id: form.id,
      title: form.title,
      description: form.description,
      fields: form.structure,
      rules: form.rules,
      createdAt: form.createdAt,
    };
  }

  async updateForm(id: number, updateFormDto: UpdateFormDto) {
    // Form var mı kontrol et
    const existingForm = await this.prisma.form.findUnique({
      where: { id },
    });

    if (!existingForm) {
      throw new NotFoundException('Form bulunamadı');
    }

    // Güncellenecek veriyi hazırla
    const updateData: any = {};
    
    if (updateFormDto.title !== undefined) {
      updateData.title = updateFormDto.title;
    }
    
    if (updateFormDto.description !== undefined) {
      updateData.description = updateFormDto.description;
    }
    
    if (updateFormDto.fields !== undefined) {
      updateData.structure = updateFormDto.fields as any;
    }
    
    if (updateFormDto.rules !== undefined) {
      updateData.rules = updateFormDto.rules as any;
    }

    // Formu güncelle
    const form = await this.prisma.form.update({
      where: { id },
      data: updateData,
    });

    return {
      message: 'Form başarıyla güncellendi',
      form: {
        id: form.id,
        title: form.title,
        fields: form.structure,
        rules: form.rules,
        createdAt: form.createdAt,
      },
    };
  }

  async deleteForm(id: number) {
    // Form var mı kontrol et
    const existingForm = await this.prisma.form.findUnique({
      where: { id },
    });

    if (!existingForm) {
      throw new NotFoundException('Form bulunamadı');
    }

    // Önce submissions'ları sil
    await this.prisma.submission.deleteMany({
      where: { formId: id },
    });

    // Formu sil
    await this.prisma.form.delete({
      where: { id },
    });

    return {
      message: 'Form başarıyla silindi',
      id,
    };
  }

  // Form submission (form doldurma)
  async submitForm(formId: number, data: any) {
    const form = await this.prisma.form.findUnique({
      where: { id: formId },
    });

    if (!form) {
      throw new NotFoundException('Form bulunamadı');
    }

    const submission = await this.prisma.submission.create({
      data: {
        formId,
        data: data.answers || data,
      },
    });

    return {
      success: true,
      message: 'Form başarıyla gönderildi',
      submissionId: submission.id,
      submittedAt: submission.createdAt,
    };
  }

  async getFormSubmissions(formId: number) {
    const submissions = await this.prisma.submission.findMany({
      where: { formId },
      orderBy: { createdAt: 'desc' },
    });

    return submissions.map(sub => ({
      id: sub.id,
      data: sub.data,
      submittedAt: sub.createdAt,
      formId: sub.formId,
    }));
  }

  // Validation service (kural motoru)
  validateForm(data: Record<string, any>, fields: any[]): Record<string, string[]> {
    const errors: Record<string, string[]> = {};

    for (const field of fields) {
      const fieldErrors: string[] = [];
      const value = data[field.id];

      // Required kontrolü
      if (field.required) {
        if (value === undefined || value === null || value === '' || 
            (field.type === 'checkbox' && value === false)) {
          fieldErrors.push('Bu alan zorunludur');
        }
      }

      if (fieldErrors.length > 0) {
        errors[field.id] = fieldErrors;
      }
    }

    return errors;
  }
}