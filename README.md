# Frontend DAE

Vue 3 + TypeScript + Vite frontend.

## Run locally

```bash
npm install
npm run dev
```

## Docker

Build the image:

```bash
docker build -t frontend-dae --build-arg VITE_API_BASE_URL=http://localhost:8000 .
```

Run the container:

```bash
docker run --rm -p 8080:80 frontend-dae
```

The app will be available at `http://localhost:8080`.

## Versioning and changelog automation

This project uses Semantic Versioning and automates releases on `main` with Release Please.

- The release workflow opens/updates a release PR based on Conventional Commits.
- When the release PR is merged, it updates `CHANGELOG.md`, bumps `package.json`, and creates a git tag/release.

Use conventional commit messages:

```text
feat: add API schema preview
fix: handle missing access token
feat!: remove deprecated endpoint
```
