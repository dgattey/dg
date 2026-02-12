#!/usr/bin/env node

// Development runner - uses tsx for on-the-fly TypeScript compilation
import { execute } from '@oclif/core';

await execute({ development: true, dir: import.meta.url });
