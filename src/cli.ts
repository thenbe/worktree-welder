import { cancel, intro, isCancel, outro, select } from '@clack/prompts';
import { execa } from 'execa';
import color from 'picocolors';

async function getWorktrees(): Promise<Worktree[]> {
	const { stdout } = await execa('git', ['worktree', 'list']);
	const worktrees = stdout.split('\n').map((line) => {
		const [path] = line.split(' ');
		return {
			value: path,
			label: path,
		};
	});

	if (
		!worktrees.every(
			(wt): wt is { label: string; value: string } => !!wt.label && !!wt.value,
		)
	) {
		console.log('Invalid value');
		process.exit(1);
	}

	return worktrees;
}

async function switchWorktree() {
	intro('Worktree Welder');

	let worktrees: Worktree[];
	try {
		worktrees = await getWorktrees();
	} catch (error) {
		console.log(
			color.red('Error getting worktrees. Make sure you are in a git repo.'),
		);
		process.exit(1);
	}

	if (worktrees.length < 2) {
		console.log(color.yellow('No other worktrees found.'));
		process.exit(1);
	}

	const selectedWorktree = await select({
		message: '',
		options: worktrees,
	});

	if (isCancel(selectedWorktree)) {
		cancel('Operation cancelled.');
		process.exit(1);
	}

	const wt = selectedWorktree;
	await execa('echo', [wt]).pipeStdout?.('/tmp/worktree-welder');
	outro(color.green('Success'));
}

await switchWorktree();

type Worktree = {
	label: string;
	value: string;
};
