# nf-2956 - Instagram clone vazifalari

Texnologiya: React + Vite, Tailwind + DaisyUI, react-router-dom 6.3, react-icons, react-toastify, Redux Toolkit + persist.

Tayyor holat: barcha sahifalar router'ga ulangan, login/register va auth guard ishlaydi. Sahifa ichlari hozircha bo'sh.

## Sahifalar bo'yicha vazifalar

| Sahifa | Mas'ul | Qisqa vazifa |
| --- | --- | --- |
| Home | O'zingiz | Storylar va postlar lentasini yasash (keyin qilinadi) |
| Reels | Shohjaxon | Reels ro'yxati: video kartalari, vertikal scroll |
| Chat | O'zingiz | Chatlar ro'yxati va xabar oynasi (keyin qilinadi) |
| Search | Muhammadyusuf | Qidiruv maydoni, foydalanuvchilar gridi |
| Notification | Abduvohobov | Bildirishnomalar ro'yxati, o'qilgan holati |
| Post | Abdushukur | Post yaratish formasi, rasm tanlash |
| Profile | Abduvohobov | Profil sarlavhasi, postlar gridi |

## Qoidalar

- Har kishi faqat o'z sahifasi fayliga ish qiladi: `src/pages/<Sahifa>.jsx`.
- Umumiy qismlar (layout, router, store) o'zgartirilsa, guruh bilan kelishib olinadi.
- O'zgartirishdan keyin `npm run build` bilan tekshirish.
