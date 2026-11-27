# Instagram

Instagram uslubidagi o‘quv loyihasi. Frontend React, Redux Toolkit va Redux Persist bilan, backend Express va MongoDB bilan ishlaydi.

## Lokal ishga tushirish

MongoDB’ni ishga tushiring va `backend/.env.example` asosida `backend/.env` yarating. `MONGODB_URI` ni bazangizga moslang. Backend qayta ishga tushganda sessiyalar saqlanishi uchun `SESSION_SECRET` ga kamida 32 belgili tasodifiy qiymat qo‘ying.

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
