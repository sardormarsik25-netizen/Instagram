# Instagram

Instagram uslubidagi o‘quv loyihasi. Frontend React, Redux Toolkit va Redux Persist bilan, backend Express va MongoDB bilan ishlaydi.

## Lokal ishga tushirish

MongoDB’ni ishga tushiring va `backend/.env.example` asosida `backend/.env` yarating. Lokal baza uchun `MONGO_URI=mongodb://127.0.0.1:27017/instagram` ishlatishingiz mumkin. `JWT_SECRET` ga uzun, tasodifiy qiymat qo‘ying. Frontend sukut bo‘yicha backendga `http://localhost:8000` orqali ulanadi.

Backend uchun:

```powershell
cd backend
npm.cmd ci
npm.cmd start
```

Frontendni boshqa terminalda ishga tushiring:

```powershell
cd frontend
npm.cmd ci
npm.cmd run dev
```

Kirish sahifasi [localhost:5173/login](http://localhost:5173/login) manzilida ochiladi.
