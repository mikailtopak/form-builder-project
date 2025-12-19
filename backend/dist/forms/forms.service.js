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
        let user = await this.prisma.user.findUnique({
            where: { id: userId },
        });
        if (!user) {
            user = await this.prisma.user.create({
                data: {
                    id: 1,
                    email: 'demo@formbuilder.com',
                    name: 'Demo User',
                    password: 'demo123'
                },
            });
        }
        const form = await this.prisma.form.create({
            data: {
                title: createFormDto.title,
                description: createFormDto.description || '',
                structure: createFormDto.fields,
                rules: createFormDto.rules,
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
    async getFormById(id) {
        const form = await this.prisma.form.findUnique({
            where: { id },
        });
        if (!form) {
            throw new common_1.NotFoundException('Form bulunamadı');
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
            form: {
                id: form.id,
                title: form.title,
                fields: form.structure,
                rules: form.rules,
                createdAt: form.createdAt,
            },
        };
    }
    async deleteForm(id) {
        const existingForm = await this.prisma.form.findUnique({
            where: { id },
        });
        if (!existingForm) {
            throw new common_1.NotFoundException('Form bulunamadı');
        }
        await this.prisma.submission.deleteMany({
            where: { formId: id },
        });
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
    async getFormSubmissions(formId) {
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
    validateForm(data, fields) {
        const errors = {};
        for (const field of fields) {
            const fieldErrors = [];
            const value = data[field.id];
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
};
exports.FormsService = FormsService;
exports.FormsService = FormsService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], FormsService);
//# sourceMappingURL=forms.service.js.map