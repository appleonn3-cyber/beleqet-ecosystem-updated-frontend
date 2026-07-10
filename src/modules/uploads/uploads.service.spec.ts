import { Test, TestingModule } from '@nestjs/testing';
import { describe, beforeEach, it, expect, jest } from '@jest/globals'; // 💡 Explicit imports to clear typing issues
import { UploadsService } from './uploads.service';
import { ConfigService } from '@nestjs/config';

const mockConfigService = {
  get: (jest.fn() as any)((key: string) => { // 💡 Cast jest.fn() to any to clear downstream typings if needed
    const values: Record<string, string> = {
      AWS_S3_BUCKET: 'test-bucket',
      AWS_REGION: 'us-east-1',
    };
    return values[key] ?? undefined;
  }),
};

describe('UploadsService', () => {
  let service: UploadsService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        UploadsService,
        { provide: ConfigService, useValue: mockConfigService },
      ],
    }).compile();

    service = module.get<UploadsService>(UploadsService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});