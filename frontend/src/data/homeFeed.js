// Mock data for the Home feed. Will be replaced by backend responses later.
const avatar = (id) => `https://i.pravatar.cc/150?img=${id}`;
const photo = (seed) => `https://picsum.photos/seed/${seed}/600/600`;

export const stories = [
  { id: 1, username: 'shohjaxon', avatar: avatar(12), seen: false },
  { id: 2, username: 'm.yusuf', avatar: avatar(13), seen: false },
  { id: 3, username: 'abduvohobov', avatar: avatar(14), seen: false },
  { id: 4, username: 'abdushukur', avatar: avatar(15), seen: true },
  { id: 5, username: 'mars.it', avatar: avatar(33), seen: false },
  { id: 6, username: 'tashkent', avatar: avatar(52), seen: true },
  { id: 7, username: 'code.daily', avatar: avatar(60), seen: true },
  { id: 8, username: 'design.uz', avatar: avatar(47), seen: true },
];

export const posts = [
  {
    id: 1,
    user: { username: 'mars.it', avatar: avatar(33), verified: true },
    location: 'Toshkent',
    image: photo('mars-class'),
    likes: 1284,
    caption: "Bugungi darsda React Router va Redux bilan ishladik. Keyingi dars — backend'ga ulanish.",
    comments: [
      { id: 1, username: 'shohjaxon', text: 'Zo\'r dars bo\'ldi' },
      { id: 2, username: 'm.yusuf', text: 'Redux endi tushunarli' },
    ],
    createdAt: '2 soat oldin',
  },
  {
    id: 2,
    user: { username: 'abduvohobov', avatar: avatar(14), verified: false },
    location: 'Chorvoq',
    image: photo('mountains'),
    likes: 342,
    caption: "Dam olish kuni tog'larda",
    comments: [{ id: 1, username: 'abdushukur', text: 'Qachon yana boramiz?' }],
    createdAt: '5 soat oldin',
  },
  {
    id: 3,
    user: { username: 'code.daily', avatar: avatar(60), verified: true },
    location: '',
    image: photo('laptop-code'),
    likes: 5021,
    caption: 'useState vs useReducer — qaysi birini qachon ishlatish kerak? Izohlarda yozing.',
    comments: [],
    createdAt: '1 kun oldin',
  },
];

export const suggestions = [
  { id: 1, username: 'design.uz', avatar: avatar(47), reason: 'Siz uchun tavsiya' },
  { id: 2, username: 'tashkent', avatar: avatar(52), reason: 'mars.it kuzatadi' },
  { id: 3, username: 'react.uz', avatar: avatar(8), reason: 'Yangi Instagram\'da' },
];
