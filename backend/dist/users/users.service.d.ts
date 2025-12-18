import { PrismaService } from '../prisma/prisma.service';
import { CreateUserDto } from './dto/create-user.dto';
import { LoginUserDto } from './dto/login-user.dto';
export declare class UsersService {
    private prisma;
    constructor(prisma: PrismaService);
    register(createUserDto: CreateUserDto): Promise<{
        message: string;
        user: {
            email: string;
            name: string | null;
            id: number;
            createdAt: Date;
        };
    }>;
    login(loginUserDto: LoginUserDto): Promise<{
        message: string;
        user: {
            id: number;
            email: string;
            name: string | null;
        };
    }>;
    getProfile(userId: number): Promise<{
        email: string;
        name: string | null;
        id: number;
        createdAt: Date;
        forms: {
            id: number;
            createdAt: Date;
            title: string;
            description: string | null;
            rules: import("@prisma/client/runtime/library").JsonValue | null;
            structure: import("@prisma/client/runtime/library").JsonValue;
            userId: number;
        }[];
    }>;
    findAll(): Promise<{
        email: string;
        name: string | null;
        id: number;
        createdAt: Date;
        _count: {
            forms: number;
        };
    }[]>;
}
