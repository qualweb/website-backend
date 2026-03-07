import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import request from 'supertest';
import { AppModule } from './../src/app.module';
import { AppService } from './../src/app.service';

describe('AppController (e2e)', () => {
  let app: INestApplication;
  const mockAppService = {
    evaluate: jest.fn().mockResolvedValue({ 
      /* mock report data */ 
      modules: { 'act-rules': {}, 'wcag-techniques': {} } 
    }),
  };

  beforeEach(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    })
    .overrideProvider(AppService)
    .useValue(mockAppService)
    .compile();

    app = moduleFixture.createNestApplication();
    await app.init();
  });

  it('/app/url (POST)', () => {
    return request(app.getHttpServer())
      .post('/app/url')
      .send({ 
        url: encodeURIComponent('https://example.com'), 
        act: true, 
        wcag: true 
      })
      .expect(201)
      .expect((res) => {
        expect(res.body.status).toBe(1);
        expect(res.body.message).toBe('Evaluation done successfully.');
        expect(res.body.report).toBeDefined();
      });
  });

  afterAll(async () => {
    await app.close();
  });
});