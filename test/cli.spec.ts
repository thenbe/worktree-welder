import { execa } from 'execa';
import { describe, expect, test, vi } from 'vitest';
import { Worktree, getOptions, getWorktrees, switchWorktree } from '../src/cli';
import { select } from '@clack/prompts';

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

	test('switchWorktree should switch to the selected worktree', async () => {
		const execaMock = vi.mocked(execa);
		execaMock.mockResolvedValueOnce({ stdout: '' }); // getWorktrees
		execaMock.mockResolvedValueOnce({ stdout: '' }); // getOptions
		execaMock.mockResolvedValueOnce({}); // switchWorktree

		await switchWorktree(() => {});

		expect(execaMock).toHaveBeenCalledWith('echo', ['/mock/path/1']);
		expect(execaMock).toHaveBeenCalledWith('echo', ['/mock/path/2']);
	});

	test('switchWorktree should handle no other worktrees', async () => {
		const execaMock = vi.mocked(execa);
		execaMock.mockResolvedValueOnce({ stdout: '' }); // getWorktrees

		await expect(switchWorktree(() => {})).rejects.toThrow(
			'No other worktrees found.',
		);

		expect(execaMock).not.toHaveBeenCalledWith('echo', expect.anything());
	});

	test('switchWorktree should handle user cancel', async () => {
		const execaMock = vi.mocked(execa);
		execaMock.mockResolvedValueOnce({ stdout: '' }); // getWorktrees
		execaMock.mockResolvedValueOnce({ stdout: '' }); // getOptions

		const selectMock = vi.spyOn(select, 'default');
		selectMock.mockResolvedValueOnce(Symbol.for('cancel'));

		await expect(switchWorktree(() => {})).rejects.toThrow(
			'Operation cancelled.',
		);

		expect(execaMock).not.toHaveBeenCalledWith('echo', expect.anything());
	});

	test('switchWorktree should handle error when fetching worktrees', async () => {
		const execaMock = vi.mocked(execa);
		execaMock.mockRejectedValueOnce(new Error('Error getting worktrees.'));

		await expect(switchWorktree(() => {})).rejects.toThrow(
			'Error getting worktrees. Make sure you are in a git repo.',
		);

		expect(execaMock).not.toHaveBeenCalledWith('echo', expect.anything());
	});
});
