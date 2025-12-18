"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.FormsService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../prisma/prisma.service");
let FormsService = class FormsService {
    prisma;
    constructor(prisma) {
        this.prisma = prisma;
    }
    async createForm(userId, createFormDto) {
        const user = await this.prisma.user.findUnique({
            where: { id: userId },
        });
        if (!user) {
            throw new common_1.NotFoundException('Kullanıcı bulunamadı');
        }
        const form = await this.prisma.form.create({
            data: {
                title: createFormDto.title,
                description: createFormDto.description,
                structure: createFormDto.fields,
                rules: createFormDto.rules,
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
    async getUserForms(userId) {
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
    async getFormById(id) {
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
            throw new common_1.NotFoundException('Form bulunamadı');
        }
        return form;
    }
    async updateForm(id, updateFormDto) {
        const existingForm = await this.prisma.form.findUnique({
            where: { id },
        });
        if (!existingForm) {
            throw new common_1.NotFoundException('Form bulunamadı');
        }
        const updateData = {};
        if (updateFormDto.title !== undefined) {
            updateData.title = updateFormDto.title;
        }
        if (updateFormDto.description !== undefined) {
            updateData.description = updateFormDto.description;
        }
        if (updateFormDto.fields !== undefined) {
            updateData.structure = updateFormDto.fields;
        }
        if (updateFormDto.rules !== undefined) {
            updateData.rules = updateFormDto.rules;
        }
        const form = await this.prisma.form.update({
            where: { id },
            data: updateData,
        });
        return {
            message: 'Form başarıyla güncellendi',
            form,
        };
    }
    async deleteForm(id) {
        const existingForm = await this.prisma.form.findUnique({
            where: { id },
        });
        if (!existingForm) {
            throw new common_1.NotFoundException('Form bulunamadı');
        }
        await this.prisma.form.delete({
            where: { id },
        });
        return {
            message: 'Form başarıyla silindi',
            id,
        };
    }
    async submitForm(formId, data) {
        const form = await this.prisma.form.findUnique({
            where: { id: formId },
        });
        if (!form) {
            throw new common_1.NotFoundException('Form bulunamadı');
        }
        const submission = await this.prisma.submission.create({
            data: {
                formId,
                data: data,
            },
        });
        return {
            message: 'Form başarıyla gönderildi',
            submission,
        };
    }
    async getFormSubmissions(formId) {
        const submissions = await this.prisma.submission.findMany({
            where: { formId },
            orderBy: { createdAt: 'desc' },
        });
        return submissions;
    }
    validateField(value, field) {
        const errors = [];
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
    validateRule(value, rule, fieldType) {
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
                }
                catch (error) {
                    return 'Geçersiz regex pattern';
                }
                break;
        }
        return null;
    }
    validateForm(data, fields) {
        const errors = {};
        for (const field of fields) {
            const fieldErrors = this.validateField(data[field.id], field);
            if (fieldErrors.length > 0) {
                errors[field.id] = fieldErrors;
            }
        }
        return errors;
    }
};
exports.FormsService = FormsService;
exports.FormsService = FormsService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], FormsService);
//# sourceMappingURL=forms.service.js.map