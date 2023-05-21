import { cancel, intro, isCancel, outro, select } from '@clack/prompts';
import { execa } from 'execa';
import color from 'picocolors';

interface Worktree {
	ref: string;
	commit: string;
	path: string;
}

async function getWorktrees(): Promise<Worktree[]> {
	const { stdout } = await execa('git', [
		'worktree',
		'list',
		'--porcelain',
		'-z', // NUL separated
	]);

	const worktrees: Worktree[] = [];
	const lines = stdout.split('\0');

	for (let i = 0; i < lines.length; i++) {
		const line = lines[i];

		if (line && line.startsWith('worktree ')) {
			const path = line.split(' ')[1];
			const commit = lines[++i]?.split(' ')[1];
			const ref = lines[++i]?.split(' ')[1];

			worktrees.push({ path, ref, commit });
		}
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
		options: worktrees.map((w) => ({
			label: w.ref.split('/')[2],
			value: w.path,
			hint: w.path,
		})),
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
