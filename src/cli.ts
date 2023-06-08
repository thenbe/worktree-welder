import { cancel, intro, isCancel, outro, select } from '@clack/prompts';
import { cac } from 'cac';
import { execa } from 'execa';
import path from 'node:path';
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

			if (!path || !commit || !ref) {
				throw new Error('Could not parse worktree');
			}

			worktrees.push({ path, ref, commit });
		}
	}

	return worktrees;
}

async function getOptions(worktrees: Worktree[]) {
	/** Path relative to the repo root */
	const { stdout: pathWithinRepo } = await execa('git', [
		'rev-parse',
		'--show-prefix',
	]);

	return worktrees.map((w) => {
		// preserve the current path within the repo when switching worktrees
		const matchingPath = path.join(w.path, pathWithinRepo);
		return {
			label: w.ref.split('/')[2] ?? '',
			value: matchingPath,
			hint: matchingPath,
		};
	});
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

	const selection: string | symbol = await select({
		message: '',
		options: await getOptions(worktrees),
	});

	if (isCancel(selection)) {
		cancel('Operation cancelled.');
		process.exit(1);
	}

	await execa('echo', [selection]).pipeStdout?.('/tmp/worktree-welder');
	outro(color.green('Success'));
}

function run() {
	const cli = cac('worktree-welder');

	cli
		.command('', 'Switch to another worktree')
		.option('--sort [key]', 'Sort method', {
			default: 'name',
		})
		.action(switchWorktree);

	cli.help();
	cli.parse();
}

run();
