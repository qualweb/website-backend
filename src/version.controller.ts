import { Controller, Get } from '@nestjs/common';
import { readFileSync } from 'fs';
import { dirname, join } from 'path';

// Read the installed @qualweb/core version from its package.json. Its "exports"
// map doesn't expose ./package.json, so a bare `require('@qualweb/core/package.json')`
// throws ERR_PACKAGE_PATH_NOT_EXPORTED. Instead we resolve the package entry
// point (the "." export) and read package.json from the package root by path.
const corePackageJsonPath = join(
  dirname(require.resolve('@qualweb/core')),
  '..',
  'package.json',
);
const { version } = JSON.parse(readFileSync(corePackageJsonPath, 'utf8')) as {
  version: string;
};

@Controller()
export class VersionController {
  @Get('version')
  getVersion(): { version: string } {
    return { version };
  }
}
