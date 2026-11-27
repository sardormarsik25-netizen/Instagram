# Instagram clone (nf-2956)

React + Vite asosidagi o'quv loyihasi.

## Ishga tushirish

```bash
npm install
npm run dev
```

## Tekshiruv

```bash
npm run lint
npm run build
```

## Texnologiyalar

- React 18, Vite 6
- Tailwind CSS 3, DaisyUI 4 (`instagram` va `instagram-dark` theme'lari)
- react-router-dom 6.3
- Redux Toolkit + redux-persist
- react-icons, react-toastify

## Sahifalar

Home, Reels, Chat, Search, Notifications, Post, Profile. Login/Register va route guard mavjud.
Login/register backend'ga ulangan (`nf-2956/intagram-clone-backend`, `http://localhost:8000`). Boshqa manzil uchun `.env` da `VITE_API_URL`.
API chaqiruvlari: `src/api/client.js`.

Vazifalar: `tasks.md`.
