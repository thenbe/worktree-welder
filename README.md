# Worktree Welder

Quick switch between [worktrees](https://git-scm.com/docs/git-worktree) of a git repository.

It preserves the path relative to the root of your repo. In other words, it's the fastest way to go from `worktree1/src/types` to `worktree2/src/types`.

### Demo

https://github.com/thenbe/worktree-welder/assets/33713262/99515c17-832e-4682-913e-6d85169147df

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

### Why?

https://github.com/ajeetdsouza/zoxide/issues/528
