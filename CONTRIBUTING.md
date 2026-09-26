# Contributing

Thanks for considering contributing to mattpocock-native.

## How to contribute

- **Report issues** — open an issue with a clear description, reproduction steps, and expected vs actual behavior.
- **Suggest changes** — describe the problem and your proposed change; discuss before opening a PR.
- **Submit code** — fork, make your change, and open a pull request. Keep changes scoped to one concern.

## Development

- Source lives in `lib/` and `tools/`; style is ES5 (var/function, no const/let/arrow/template literals).
- Skill content comes from the official Matt Pocock skills 1.2.3; only `skills/engineering/ask-matt/SKILL.md` and `skills/_trigger/SKILL.md` are plugin-specific rewrites.
- Run tests before opening a PR: `node tests/test-gates.js` and `node tests/test-docs.js`.
- This plugin enforces a flow state machine (see `AGENTS.md`); changes that weaken the three gates will not be accepted.

## License

By contributing, you agree that your contributions are licensed under the MIT License.
