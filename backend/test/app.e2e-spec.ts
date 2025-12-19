// test/app.e2e-spec.ts
import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import * as request from 'supertest';
import { AppModule } from './../src/app.module';

describe('Form Builder Backend - E2E Tests', () => {
  let app: INestApplication;

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    await app.init();
  });

  afterAll(async () => {
    await app.close();
  });

  describe('✅ Health Check Tests', () => {
    it('GET /health should return API status', async () => {
      const response = await request(app.getHttpServer())
        .get('/health')
        .expect(200);

      expect(response.body).toHaveProperty('status');
      expect(response.body.status).toBe('ok');
      expect(response.body).toHaveProperty('timestamp');
      console.log('Health check passed:', response.body);
    });
  });

  describe('📊 Basic API Tests', () => {
    it('GET /api should return API info', async () => {
      const response = await request(app.getHttpServer())
        .get('/api')
        .expect(200);

      expect(response.body).toHaveProperty('name');
      expect(response.body).toHaveProperty('version');
      console.log('API info:', response.body);
    });

    it('GET non-existent route should return 404', async () => {
      await request(app.getHttpServer())
        .get('/non-existent-route')
        .expect(404);
    });
  });

  describe('🧪 Simple Unit Tests in E2E context', () => {
    it('should pass basic assertions', () => {
      expect(1 + 1).toBe(2);
      expect('test').toBe('test');
      expect({ a: 1 }).toEqual({ a: 1 });
    });

    it('should handle async operations', async () => {
      const result = await Promise.resolve('success');
      expect(result).toBe('success');
    });
  });
});