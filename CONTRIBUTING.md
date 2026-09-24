# Contributing to Voxora

Thank you for improving Voxora. Keep changes focused, reviewable, tenant-safe, and covered by the relevant quality gates.

## Development workflow

1. Create a focused branch from the current default branch.
2. Install dependencies with `npm install`.
3. Add or update tests with the implementation.
4. Run `npm run check` and `npm run test:e2e`.
5. Open a pull request using the repository template.

## Architecture rules

- Keep domain rules independent of frameworks, persistence clients, queues, and provider SDKs.
- Validate every external boundary with runtime schemas.
- Resolve tenant identity at the boundary and pass `workspaceId` explicitly.
- Enforce authorization server-side; hidden controls are not authorization.
- Keep API keys and credentials server-only.
- Normalize external-provider errors before returning them to clients.
- Never log raw phrase text, speech text, credentials, or generated audio.

## Commit and pull-request standards

- Use a concise conventional subject such as `feat:`, `fix:`, `docs:`, `test:`, or `chore:`.
- Keep one logical change per commit where practical.
- Explain user impact, architecture impact, testing, security considerations, and known limitations.
- Include screenshots for visible UI changes.
- Do not merge while required checks are failing or pending.

## Required checks

```bash
npm run check
npm run test:e2e
npm audit --omit=dev
```

If local browser installation is unavailable, document the limitation and require the GitHub Actions browser job to pass before merge.

## Security reports

Do not open public issues for suspected vulnerabilities. Follow the private reporting guidance in [docs/SECURITY.md](docs/SECURITY.md).
