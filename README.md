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
docker run --rm -p 8888:80 frontend-dae
```

The app will be available at `http://localhost:8080`.
