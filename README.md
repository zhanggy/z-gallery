# z-gallery: Responsive Image Gallery

This project is a responsive image gallery built with **React**, **TypeScript**, and **Vite**.

## Features

- Fetches a list of image URLs from a server (see `API_URL` in `src/App.tsx`).
- Displays one image at a time.
- Swipe left/right on mobile to switch images.
- Use left/right arrow keys on PC to switch images.
- Responsive design for both mobile and desktop.

## Getting Started

### Install dependencies

```bash
npm install
```

### Start the development server

```bash
npm run dev
```

Open [http://localhost:5173](http://localhost:5173) in your browser.

## API Endpoint

The app expects an endpoint `/api/images` that returns a JSON array of image URLs, e.g.:

```json
["https://example.com/image1.jpg", "https://example.com/image2.jpg"]
```

If the endpoint is unavailable, demo images from Unsplash will be shown.

## Usage

- **Mobile:** Swipe left/right to change images.
- **PC:** Use left/right arrow keys or the on-screen buttons.

---

This project was bootstrapped with Vite + React + TypeScript.
    },
  },
])
```

You can also install [eslint-plugin-react-x](https://github.com/Rel1cx/eslint-react/tree/main/packages/plugins/eslint-plugin-react-x) and [eslint-plugin-react-dom](https://github.com/Rel1cx/eslint-react/tree/main/packages/plugins/eslint-plugin-react-dom) for React-specific lint rules:

```js
// eslint.config.js
import reactX from 'eslint-plugin-react-x'
import reactDom from 'eslint-plugin-react-dom'

export default defineConfig([
  globalIgnores(['dist']),
  {
    files: ['**/*.{ts,tsx}'],
    extends: [
      // Other configs...
      // Enable lint rules for React
      reactX.configs['recommended-typescript'],
      // Enable lint rules for React DOM
      reactDom.configs.recommended,
    ],
    languageOptions: {
      parserOptions: {
        project: ['./tsconfig.node.json', './tsconfig.app.json'],
        tsconfigRootDir: import.meta.dirname,
      },
      // other options...
    },
  },
])
```
