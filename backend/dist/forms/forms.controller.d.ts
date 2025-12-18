import { FormsService } from './forms.service';
import { CreateFormDto } from './dto/create-form.dto';
import { UpdateFormDto } from './dto/update-form.dto';
export declare class FormsController {
    private readonly formsService;
    constructor(formsService: FormsService);
    createForm(createFormDto: CreateFormDto): Promise<{
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
    getUserForms(): Promise<{
        id: number;
        createdAt: Date;
        _count: {
            submissions: number;
        };
        title: string;
        description: string | null;
    }[]>;
    getForm(id: number): Promise<{
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
    submitForm(id: number, data: any): Promise<{
        message: string;
        submission: {
            id: number;
            createdAt: Date;
            data: import("@prisma/client/runtime/library").JsonValue;
            formId: number;
        };
    }>;
    getFormSubmissions(id: number): Promise<{
        id: number;
        createdAt: Date;
        data: import("@prisma/client/runtime/library").JsonValue;
        formId: number;
    }[]>;
    validateForm(body: {
        data: any;
        fields: any[];
    }): Promise<{
        isValid: boolean;
        errors: Record<string, string[]>;
    }>;
    health(): {
        status: string;
        service: string;
        timestamp: string;
        features: string[];
    };
}
