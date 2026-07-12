import { Test, TestingModule } from '@nestjs/testing';
import { readFileSync } from 'fs';
import { dirname, join } from 'path';
import { VersionController } from './version.controller';

const coreVersion = JSON.parse(
  readFileSync(
    join(dirname(require.resolve('@qualweb/core')), '..', 'package.json'),
    'utf8',
  ),
).version;

describe('VersionController', () => {
  let controller: VersionController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [VersionController],
    }).compile();

    controller = module.get<VersionController>(VersionController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  it('returns the installed @qualweb/core version', () => {
    expect(controller.getVersion()).toEqual({ version: coreVersion });
  });
});
