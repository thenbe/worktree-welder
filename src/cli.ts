import {
	cancel,
	intro,
	isCancel,
	outro,
	select,
	spinner,
} from '@clack/prompts';
import { execa } from 'execa';

async function getWorktrees() {
	const { stdout } = await execa('git', ['worktree', 'list']);
	return stdout.split('\n').map((line) => {
		const [path] = line.split(' ');
		return {
			value: path,
			label: path,
		};
	});
}

async function switchWorktree() {
	intro('Worktree Switcher');

	const worktrees = await getWorktrees();
	if (!worktrees.length) {
		console.log('No worktrees found.');
		process.exit(0);
	}

	const selectedWorktree = await select({
		message: 'Select a worktree to switch to',
		options: worktrees,
	});

	if (isCancel(selectedWorktree)) {
		cancel('Operation cancelled.');
		process.exit(0);
	}

	const s = spinner();
	s.start(`Switching to ${selectedWorktree}`);
	console.log(`cd ${selectedWorktree}`);
	s.stop(`Switched to ${selectedWorktree}`);

	outro('Worktree switched successfully.');
}

switchWorktree();
