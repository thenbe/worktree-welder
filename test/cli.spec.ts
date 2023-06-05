import { execa } from 'execa';
import { describe, expect, test, vi } from 'vitest';
import { Worktree, getOptions, getWorktrees } from '../src/cli';

vi.mock('execa');

const WORKTREES: Worktree[] = [
	{
		path: '/mock/path/1',
		commit: 'a473e8930eb7b2636973f62b6d8935da70fd4978',
		ref: 'refs/heads/main',
	},
	{
		path: '/mock/path/2',
		commit: '2e45acb56cfe608d9fc72ab027738d12e5f54ed9',
		ref: 'refs/heads/feature',
	},
];

describe('cli.ts', () => {
	test('getWorktrees should return an array of worktrees', async () => {
		const execaMock = vi.mocked(execa);
		execaMock.mockResolvedValueOnce({
			// @ts-ignore
			stdout:
				'worktree /mock/path/1\x00HEAD a473e8930eb7b2636973f62b6d8935da70fd4978\x00branch refs/heads/main\x00\x00worktree /mock/path/2\x00HEAD 2e45acb56cfe608d9fc72ab027738d12e5f54ed9\x00branch refs/heads/feature\x00\x00',
		});

		const worktrees = await getWorktrees();
		expect(worktrees).toEqual(WORKTREES);
	});

	test('getOptions should return an array of options with label, value, and hint', async () => {
		const execaMock = vi.mocked(execa);
		execaMock.mockResolvedValueOnce({
			// @ts-ignore
			stdout: '',
		});

		const options = await getOptions(WORKTREES);
		expect(options).toEqual([
			{
				label: 'main',
				value: '/mock/path/1',
				hint: '/mock/path/1',
			},
			{
				label: 'feature',
				value: '/mock/path/2',
				hint: '/mock/path/2',
			},
		]);
	});

	// TODO: Add more tests for switchWorktree and other functions as needed
});
