import { PrismaService } from '../prisma/prisma.service';
import { CreateFormDto } from './dto/create-form.dto';
import { UpdateFormDto } from './dto/update-form.dto';
export declare class FormsService {
    private prisma;
    constructor(prisma: PrismaService);
    createForm(userId: number, createFormDto: CreateFormDto): Promise<{
        id: number;
        title: string;
        fields: import("@prisma/client/runtime/library").JsonValue;
        rules: import("@prisma/client/runtime/library").JsonValue;
        createdAt: Date;
        message: string;
    }>;
    getAllForms(): Promise<{
        id: number;
        title: string;
        description: string | null;
        fields: import("@prisma/client/runtime/library").JsonValue;
        rules: import("@prisma/client/runtime/library").JsonValue;
        createdAt: Date;
    }[]>;
    getFormById(id: number): Promise<{
        id: number;
        title: string;
        description: string | null;
        fields: import("@prisma/client/runtime/library").JsonValue;
        rules: import("@prisma/client/runtime/library").JsonValue;
        createdAt: Date;
    }>;
    updateForm(id: number, updateFormDto: UpdateFormDto): Promise<{
        message: string;
        form: {
            id: number;
            title: string;
            fields: import("@prisma/client/runtime/library").JsonValue;
            rules: import("@prisma/client/runtime/library").JsonValue;
            createdAt: Date;
        };
    }>;
    deleteForm(id: number): Promise<{
        message: string;
        id: number;
    }>;
    submitForm(formId: number, data: any): Promise<{
        success: boolean;
        message: string;
        submissionId: number;
        submittedAt: Date;
    }>;
    getFormSubmissions(formId: number): Promise<{
        id: number;
        data: import("@prisma/client/runtime/library").JsonValue;
        submittedAt: Date;
        formId: number;
    }[]>;
    validateForm(data: Record<string, any>, fields: any[]): Record<string, string[]>;
}
