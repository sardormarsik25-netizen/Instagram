# Instagram clone — backend (nf-2956)

Express 5 + MongoDB (mongoose). Rasmlar MongoDB ichida saqlanadi (`images` kolleksiyasi), shuning uchun deploy'dan keyin ham yo'qolmaydi.

## Ishga tushirish

```bash
npm install
cp .env.example .env   # MONGO_URI va JWT_SECRET ni to'ldiring (ustozdan so'rang)
npm run dev            # http://localhost:8000
```

`.env` git'ga tushmaydi — unga parol yoziladi, hech kimga ko'rsatmang.

## Umumiy qoidalar

- **Token.** `register` va `login` javobida `token` keladi. Boshqa hamma so'rovga sarlavha qo'shiladi:
  `Authorization: Bearer <token>`. Token 7 kun yaroqli. Tokensiz so'rov → `401`.
- **Rasm yuklash** — `multipart/form-data` (`FormData`), JSON emas. Fayl maydoni nomi: post va istoriyada `image`,
  profilda `avatar`. Faqat rasm, 5 MB gacha.
- **Rasm manzili** javobda `"/images/<id>"` ko'rinishida keladi. Ko'rsatish uchun oldiga backend manzilini qo'shing:
  `<img src={"http://localhost:8000" + post.image} />`. Bu yo'l tokensiz ishlaydi.
- **Xato** bo'lsa javob har doim `{ "message": "..." }` — shu matnni foydalanuvchiga ko'rsating.

## Auth va user — `/user`

| Metod | Yo'l | Body | Javob |
|---|---|---|---|
| POST | `/user/register` | `{ username, email, password }` | `{ user, token }` |
| POST | `/user/login` | `{ email, password }` | `{ user, token }` |
| GET | `/user/me` | — | `{ user }` |
| PATCH | `/user/me` | FormData: `fullName`, `bio`, `avatar` (fayl) — hammasi ixtiyoriy | `{ user }` |
| GET | `/user/search?q=ali` | — | `{ users: [{ _id, username, fullName, avatar, followersCount, isFollowing }] }` |
| GET | `/user/:username` | — | `{ user: { _id, username, fullName, bio, avatar, postsCount, followersCount, followingCount, isFollowing, isMe } }` |
| GET | `/user/:username/posts` | — | `{ posts: [Post] }` |
| GET | `/user/:username/followers` | — | `{ users: [{ _id, username, fullName, avatar }] }` |
| GET | `/user/:username/following` | — | `{ users: [...] }` |
| POST | `/user/:id/follow` | — | `{ isFollowing, followersCount }` (bosilsa kuzatadi, yana bosilsa bekor qiladi) |
| GET | `/user/users` | — | `{ users }` (hamma userlar, tokensiz) |

## Publikatsiya — `/posts`

**Post** ko'rinishi:

```json
{
  "_id": "...",
  "image": "/images/...",
  "caption": "Salom",
  "author": { "_id": "...", "username": "ali", "fullName": "", "avatar": "" },
  "likesCount": 3,
  "isLiked": true,
  "commentsCount": 2,
  "createdAt": "2026-11-25T12:00:00.000Z"
}
```

| Metod | Yo'l | Body | Javob |
|---|---|---|---|
| POST | `/posts` | FormData: `image` (fayl, majburiy), `caption` | `{ post }` |
| GET | `/posts?page=1&limit=10` | — | `{ posts: [Post], page, hasMore }` (lenta, yangisi birinchi) |
| GET | `/posts/:id` | — | `{ post }` |
| DELETE | `/posts/:id` | — | faqat muallif |
| POST | `/posts/:id/like` | — | `{ isLiked, likesCount }` (like / unlike) |
| GET | `/posts/:id/comments` | — | `{ comments: [{ _id, text, author, createdAt }] }` |
| POST | `/posts/:id/comments` | `{ text }` | `{ comment }` |
| DELETE | `/posts/:id/comments/:commentId` | — | izoh yoki post muallifi |

## Istoriya — `/stories`

Istoriya 24 soatdan keyin o'zi o'chadi. Ikki turi bor: `image` (o'z rasmi) va `repost` (boshqaning postini
istoriyada reklama qilish — `post.author` o'sha post egasi).

**Story** ko'rinishi: `{ _id, type, image, post: { _id, author } | null, viewed, viewersCount, createdAt, expiresAt }`
(`viewersCount` faqat o'z istoriyangizda keladi).

| Metod | Yo'l | Body | Javob |
|---|---|---|---|
| GET | `/stories` | — | `{ groups: [{ user, stories: [Story], allViewed }] }` — story bar uchun, o'zingizniki birinchi |
| POST | `/stories` | FormData: `image` (fayl) | `{ story }` |
| POST | `/stories/repost/:postId` | — | `{ story }` |
| GET | `/stories/user/:userId` | — | `{ stories: [Story] }` |
| POST | `/stories/:id/view` | — | `{ viewed: true }` — istoriya ochilganda chaqiring |
| GET | `/stories/:id/viewers` | — | `{ viewers: [user] }` — faqat egasi |
| DELETE | `/stories/:id` | — | faqat egasi |

## Bildirishnoma — `/notifications`

Like, izoh, follow va repost bo'lganda avtomatik yaratiladi (o'zingizning harakatingizga yaratilmaydi).

| Metod | Yo'l | Javob |
|---|---|---|
| GET | `/notifications` | `{ notifications: [{ _id, type, sender, post: { _id, image } \| null, text, read, createdAt }] }` |
| GET | `/notifications/unread-count` | `{ count }` — qizil belgi uchun |
| PATCH | `/notifications/read-all` | hammasini o'qilgan qilish |
| PATCH | `/notifications/:id/read` | bittasini o'qilgan qilish |

`type`: `like` | `comment` (`text` — izoh matni) | `follow` | `repost`.

## Rasm — `/images`

| Metod | Yo'l | Javob |
|---|---|---|
| GET | `/images/:id` | rasm fayli (tokensiz) |
