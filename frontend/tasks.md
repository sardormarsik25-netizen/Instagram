# nf-2956 - Instagram clone vazifalari

Hozircha faqat **rasm**: rasmli publikatsiya va rasmli istoriya. Video (Reels) keyinroq.
Backend tayyor — siz faqat **frontend** qilasiz.

## Tayyor holat

- Login / register haqiqiy backend'ga ulangan, token Redux'da saqlanadi (sahifa yangilansa ham chiqib ketmaydi).
- Home sahifasi namuna sifatida yasalgan (`src/pages/Home.jsx`, `src/components/home/`) — dizayn uchun shunga qarang.
- Backend API ro'yxati: backend repo'dagi `README.md` (`nf-2956/intagram-clone-backend`).

## Ishga tushirish

```bash
# 1-terminal: backend
cd intagram-clone-backend
npm install
cp .env.example .env     # MONGO_URI va JWT_SECRET ni ustozdan oling
npm run dev              # http://localhost:8000

# 2-terminal: frontend
cd instagram-clone-front
npm install
npm run dev
```

## Backend'ga so'rov qanday yuboriladi

`fetch` ni o'zingiz yozmang — tayyor `api` dan foydalaning, token o'zi qo'shiladi:

```jsx
import { api, imageUrl } from '../api/client';

const data = await api.get('/posts');                    // GET
await api.post(`/posts/${id}/like`);                      // POST body'siz
await api.post(`/posts/${id}/comments`, { text });        // POST JSON

const form = new FormData();                              // rasm yuklash
form.append('image', file);
form.append('caption', caption);
await api.post('/posts', form);

<img src={imageUrl(post.image)} />                        // rasm ko'rsatish
```

Xato bo'lsa `api` `Error` tashlaydi — `try/catch` ichida `toast.error(err.message)` qiling.
Kirgan foydalanuvchi: `useSelector((state) => state.auth.user)` → `{ _id, username, email, avatar, ... }`.

## Vazifalar

| Kim | Nima | Fayllar |
| --- | --- | --- |
| Abdushukur | Post yaratish | `src/pages/Post.jsx` |
| Shohjaxon | Istoriyalar | `src/components/stories/` |
| Muhammadyusuf | Qidiruv | `src/pages/Search.jsx` |
| Abduvohobov | Profil va bildirishnomalar | `src/pages/Profile.jsx`, `src/pages/Notification.jsx` |
| O'zingiz (ustoz) | Home lentasini backend'ga ulash, like, izoh, repost | `src/pages/Home.jsx`, `src/components/home/` |

### Abdushukur — Post yaratish (`/post`)

API: `POST /posts` (FormData: `image`, `caption`).

- Rasm tanlash (`<input type="file" accept="image/*">`) va tanlangan rasmni darhol ko'rsatish (`URL.createObjectURL`).
- Izoh (caption) maydoni, 2200 belgi chegarasi va hisoblagich.
- "Joylash" tugmasi: yuklanayotganda spinner (`loading loading-spinner`), tugma bosilmaydi.
- Rasm 5 MB dan katta yoki rasm bo'lmasa — yubormasdan oldin xato ko'rsatish.
- Muvaffaqiyatli bo'lsa `toast.success` va Home'ga qaytish (`navigate('/')`).

### Shohjaxon — Istoriyalar

API: `GET /stories`, `POST /stories` (FormData: `image`), `POST /stories/:id/view`, `DELETE /stories/:id`,
`POST /stories/repost/:postId`.

Fayllar `src/components/stories/` ichida bo'ladi, Home'ga ustoz ulaydi.

- `StoriesBar.jsx` — `GET /stories` dagi guruhlar: avatar, ko'rilmagan bo'lsa rangli halqa (`allViewed`), o'zingizniki birinchi.
  Boshida "+" tugmasi — o'z istoriyangizni qo'shish.
- `AddStory.jsx` — rasm tanlash, ko'rib chiqish, `POST /stories`.
- `StoryViewer.jsx` — to'liq ekran modal: rasm, tepada progress chiziqlari, 5 soniyada keyingisiga o'tadi, chap/o'ng
  bosilsa oldingi/keyingi. Ochilganda `POST /stories/:id/view`. O'z istoriyangizda "o'chirish" tugmasi va
  `viewersCount`.
- `type === 'repost'` bo'lsa rasm ustida "@username postini ulashdi" yozuvi (`story.post.author.username`).
- `RepostButton.jsx` — `postId` qabul qiladi va `POST /stories/repost/:postId` yuboradi (post kartasiga ustoz qo'yadi).

### Muhammadyusuf — Qidiruv (`/search`)

API: `GET /user/search?q=...`, `POST /user/:id/follow`.

- Qidiruv maydoni: yozish to'xtagandan 400 ms keyin so'rov yuboriladi (debounce), bo'sh bo'lsa so'rov yo'q.
- Natija ro'yxati: avatar, username, fullName, kuzatuvchilar soni.
- "Kuzatish" / "Kuzatilmoqda" tugmasi (`isFollowing`), bosilganda darhol o'zgaradi.
- Foydalanuvchi bosilsa uning profiliga o'tish: `/profile/<username>`.
- Yuklanish (skeleton), "hech kim topilmadi" holatlari.

### Abduvohobov — Profil (`/profile` va `/profile/:username`)

API: `GET /user/:username`, `GET /user/:username/posts`, `POST /user/:id/follow`, `PATCH /user/me`
(FormData: `fullName`, `bio`, `avatar`), `GET /user/:username/followers`, `GET /user/:username/following`.

- `useParams()` dagi `username` bo'lmasa — o'z profilingiz (`state.auth.user.username`).
- Sarlavha: avatar, username, postlar / kuzatuvchilar / kuzatilayotganlar soni, fullName, bio.
- O'z profilingizda "Profilni tahrirlash" (modal: avatar, fullName, bio), boshqanikida "Kuzatish" tugmasi.
- Kuzatuvchilar soni bosilsa — ro'yxat modal'da.
- Pastda postlar gridi (3 ustun, kvadrat rasmlar), hover'da like va izoh soni.

### Abduvohobov — Bildirishnomalar (`/notifications`)

API: `GET /notifications`, `PATCH /notifications/read-all`, `PATCH /notifications/:id/read`,
`GET /notifications/unread-count`.

- Ro'yxat: yuboruvchi avatari, matn turiga qarab — `like`: "postingizni yoqtirdi", `comment`: "izoh qoldirdi: …",
  `follow`: "sizni kuzata boshladi", `repost`: "postingizni istoriyasida ulashdi". O'ngda post rasmi kichik.
- O'qilmaganlar boshqa fon bilan ajralib turadi; sahifa ochilganda `read-all`.
- Vaqt: "5 daqiqa oldin", "2 soat oldin" ko'rinishida.

## Qoidalar

- Har kishi faqat o'z fayllarida ishlaydi (jadvaldagi). Umumiy qismlar (layout, router, store, `src/api/`) o'zgarsa —
  guruh bilan kelishiladi.
- Dizayn: Tailwind + DaisyUI komponentlari (`btn`, `card`, `input`, `modal`, `avatar`, `loading`, `skeleton`).
  Ranglar theme'dan (`bg-base-100`, `text-primary`...), qo'lda hex rang yozmang — dark rejim ham ishlashi kerak.
- Telefon ekranida ham ko'rinishi kerak.
- Topshirishdan oldin: `npm run lint` va `npm run build` xatosiz o'tsin.
