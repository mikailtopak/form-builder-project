"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const core_1 = require("@nestjs/core");
const app_module_1 = require("./app.module");
async function bootstrap() {
    const app = await core_1.NestFactory.create(app_module_1.AppModule);
    app.enableCors({
        origin: 'http://localhost:3000',
        methods: 'GET,HEAD,PUT,PATCH,POST,DELETE,OPTIONS',
        credentials: true,
        allowedHeaders: 'Content-Type, Authorization, Accept',
    });
    const port = process.env.PORT || 3001;
    await app.listen(port);
    console.log(`🚀 Form Builder Backend çalışıyor: http://localhost:${port}`);
    console.log(`📊 Health check: http://localhost:${port}/health`);
    console.log(`👤 Users API: http://localhost:${port}/users/health`);
    console.log(`📝 Forms API: http://localhost:${port}/forms/health`);
}
bootstrap();
//# sourceMappingURL=main.js.map