export declare class ValidationRuleDto {
    type: string;
    value?: any;
    message: string;
}
export declare class FormFieldDto {
    id: string;
    type: string;
    label: string;
    placeholder?: string;
    required: boolean;
    validationRules?: ValidationRuleDto[];
    options?: string[];
    defaultValue?: any;
}
export declare class CreateFormDto {
    title: string;
    description?: string;
    fields: FormFieldDto[];
    rules?: any;
}
