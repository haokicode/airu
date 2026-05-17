# Airu

Airu is a route-planning UI for comparing the fastest route with a healthier route based on AQI, heat, shade, and user health sensitivity.

## Local Development

```bash
npm install
npm run dev
```

The dev server runs with Webpack because the local Windows/Node 24 environment falls back to SWC WASM.

```bash
npm run type-check
npm run lint
npm run build
```

## Implemented UI Routes

- `/` - Airu landing and route preview
- `/login` - Authentication mockup
- `/profile` - Health profile setup
- `/map` - Core map workspace with route comparison and bottom sheet
- `/result/demo-route` - Route result detail
- `/alerts` - AQI alert list
- `/history` - Route history
