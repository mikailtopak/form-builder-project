import { FormsService } from './forms.service';
import { CreateFormDto } from './dto/create-form.dto';
import { UpdateFormDto } from './dto/update-form.dto';
export declare class FormsController {
    private readonly formsService;
    constructor(formsService: FormsService);
    createForm(createFormDto: CreateFormDto): Promise<{
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
    getForm(id: number): Promise<{
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
    submitForm(id: number, data: any): Promise<{
        success: boolean;
        message: string;
        submissionId: number;
        submittedAt: Date;
    }>;
    getFormSubmissions(id: number): Promise<{
        id: number;
        data: import("@prisma/client/runtime/library").JsonValue;
        submittedAt: Date;
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
