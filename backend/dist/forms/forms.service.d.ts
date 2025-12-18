import { PrismaService } from '../prisma/prisma.service';
import { CreateFormDto, FormFieldDto } from './dto/create-form.dto';
import { UpdateFormDto } from './dto/update-form.dto';
export declare class FormsService {
    private prisma;
    constructor(prisma: PrismaService);
    createForm(userId: number, createFormDto: CreateFormDto): Promise<{
        message: string;
        form: {
            user: {
                email: string;
                name: string | null;
                id: number;
            };
        } & {
            id: number;
            createdAt: Date;
            title: string;
            description: string | null;
            rules: import("@prisma/client/runtime/library").JsonValue | null;
            structure: import("@prisma/client/runtime/library").JsonValue;
            userId: number;
        };
    }>;
    getUserForms(userId: number): Promise<{
        id: number;
        createdAt: Date;
        _count: {
            submissions: number;
        };
        title: string;
        description: string | null;
    }[]>;
    getFormById(id: number): Promise<{
        user: {
            email: string;
            name: string | null;
            id: number;
        };
    } & {
        id: number;
        createdAt: Date;
        title: string;
        description: string | null;
        rules: import("@prisma/client/runtime/library").JsonValue | null;
        structure: import("@prisma/client/runtime/library").JsonValue;
        userId: number;
    }>;
    updateForm(id: number, updateFormDto: UpdateFormDto): Promise<{
        message: string;
        form: {
            id: number;
            createdAt: Date;
            title: string;
            description: string | null;
            rules: import("@prisma/client/runtime/library").JsonValue | null;
            structure: import("@prisma/client/runtime/library").JsonValue;
            userId: number;
        };
    }>;
    deleteForm(id: number): Promise<{
        message: string;
        id: number;
    }>;
    submitForm(formId: number, data: any): Promise<{
        message: string;
        submission: {
            id: number;
            createdAt: Date;
            data: import("@prisma/client/runtime/library").JsonValue;
            formId: number;
        };
    }>;
    getFormSubmissions(formId: number): Promise<{
        id: number;
        createdAt: Date;
        data: import("@prisma/client/runtime/library").JsonValue;
        formId: number;
    }[]>;
    validateField(value: any, field: FormFieldDto): string[];
    private validateRule;
    validateForm(data: Record<string, any>, fields: FormFieldDto[]): Record<string, string[]>;
}
