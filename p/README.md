# Next.js dengan Three.js Project

Proyek Next.js dengan dukungan JSX dan Three.js untuk visualisasi 3D.

## Fitur

- ✅ Next.js 14 dengan App Router
- ✅ JSX support
- ✅ Three.js integration dengan React Three Fiber
- ✅ React Three Drei untuk komponen tambahan

## Instalasi

1. Install dependencies:
```bash
npm install
```

2. Jalankan development server:
```bash
npm run dev
```

3. Buka browser di [http://localhost:3000](http://localhost:3000)

## Struktur Folder

```
.
├── app/
│   ├── layout.jsx      # Root layout
│   ├── page.jsx        # Home page
│   └── globals.css     # Global styles
├── components/
│   └── TreeScene.jsx   # Three.js scene component
├── public/             # Static files
├── next.config.js      # Next.js configuration
├── jsconfig.json       # JSX/JS configuration
└── package.json        # Dependencies
```

## Teknologi

- **Next.js**: React framework
- **Three.js**: 3D graphics library
- **React Three Fiber**: React renderer for Three.js
- **React Three Drei**: Helper components untuk Three.js

## Scripts

- `npm run dev` - Development server
- `npm run build` - Build untuk production
- `npm run start` - Start production server
- `npm run lint` - Run ESLint

