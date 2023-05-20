import type { Options } from 'tsup';

export const tsup: Options = {
	entry: ['src/cli.ts'],
	format: ['esm'],
};
