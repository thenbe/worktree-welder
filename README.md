# Worktree Welder

Quick switch between [worktrees](https://git-scm.com/docs/git-worktree) of a git repository.

### Usage

1. Install

```bash
pnpm add worktree-welder -g
```

2. Add alias to `.bashrc` or `.zshrc`

```bash
alias ww='worktree-welder && cd $(cat /tmp/worktree-welder)'
```

3. Use

```bash
cd my-project
ww
```
