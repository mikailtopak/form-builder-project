import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateFormDto, FormFieldDto } from './dto/create-form.dto';
import { UpdateFormDto } from './dto/update-form.dto';

@Injectable()
export class FormsService {
  constructor(private prisma: PrismaService) {}

  async createForm(userId: number, createFormDto: CreateFormDto) {
    // User kontrolü
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
    });

    if (!user) {
      throw new NotFoundException('Kullanıcı bulunamadı');
    }

    // Form oluştur
    const form = await this.prisma.form.create({
      data: {
        title: createFormDto.title,
        description: createFormDto.description,
        structure: createFormDto.fields as any,
        rules: createFormDto.rules as any,
        userId: userId,
      },
      include: {
        user: {
          select: {
            id: true,
            email: true,
            name: true,
          },
        },
      },
    });

    return {
      message: 'Form başarıyla oluşturuldu',
      form,
    };
  }

  async getUserForms(userId: number) {
    const forms = await this.prisma.form.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' },
      select: {
        id: true,
        title: true,
        description: true,
        createdAt: true,
        _count: {
          select: {
            submissions: true,
          },
        },
      },
    });

    return forms;
  }

  async getFormById(id: number) {
    const form = await this.prisma.form.findUnique({
      where: { id },
      include: {
        user: {
          select: {
            id: true,
            email: true,
            name: true,
          },
        },
      },
    });

    if (!form) {
      throw new NotFoundException('Form bulunamadı');
    }

    return form;
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
      form,
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
        data: data as any,
      },
    });

    return {
      message: 'Form başarıyla gönderildi',
      submission,
    };
  }

  async getFormSubmissions(formId: number) {
    const submissions = await this.prisma.submission.findMany({
      where: { formId },
      orderBy: { createdAt: 'desc' },
    });

    return submissions;
  }

  // Validation service (kural motoru)
  validateField(value: any, field: FormFieldDto): string[] {
    const errors: string[] = [];

    if (!field.validationRules || field.validationRules.length === 0) {
      return errors;
    }

    for (const rule of field.validationRules) {
      const error = this.validateRule(value, rule, field.type);
      if (error) {
        errors.push(error);
      }
    }

    return errors;
  }

  private validateRule(value: any, rule: any, fieldType: string): string | null {
    if (value === undefined || value === null || value === '') {
      if (rule.type === 'required') {
        return rule.message || 'Bu alan zorunludur';
      }
      return null;
    }

    switch (rule.type) {
      case 'required':
        if (!value && value !== false && value !== 0) {
          return rule.message || 'Bu alan zorunludur';
        }
        break;

      case 'minLength':
        if (String(value).length < Number(rule.value)) {
          return rule.message || `Minimum ${rule.value} karakter olmalıdır`;
        }
        break;

      case 'maxLength':
        if (String(value).length > Number(rule.value)) {
          return rule.message || `Maksimum ${rule.value} karakter olmalıdır`;
        }
        break;

      case 'min':
        if (Number(value) < Number(rule.value)) {
          return rule.message || `Minimum değer ${rule.value} olmalıdır`;
        }
        break;

      case 'max':
        if (Number(value) > Number(rule.value)) {
          return rule.message || `Maksimum değer ${rule.value} olmalıdır`;
        }
        break;

      case 'email':
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(value)) {
          return rule.message || 'Geçerli bir e-posta adresi giriniz';
        }
        break;

      case 'pattern':
        try {
          const regex = new RegExp(rule.value);
          if (!regex.test(value)) {
            return rule.message || 'Geçerli bir format giriniz';
          }
        } catch (error) {
          return 'Geçersiz regex pattern';
        }
        break;
    }

    return null;
  }

  validateForm(data: Record<string, any>, fields: FormFieldDto[]): Record<string, string[]> {
    const errors: Record<string, string[]> = {};

    for (const field of fields) {
      const fieldErrors = this.validateField(data[field.id], field);
      if (fieldErrors.length > 0) {
        errors[field.id] = fieldErrors;
      }
    }

    return errors;
  }
}