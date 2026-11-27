const messages = {
  400: 'Kiritilgan ma’lumotlarni tekshiring.',
  401: 'Email, foydalanuvchi nomi yoki parol xato.',
  409: 'Bu foydalanuvchi nomi yoki email band.',
  429: 'Urinishlar soni oshib ketdi. Birozdan so‘ng qayta urinib ko‘ring.',
};

export async function authRequest(operation, fields, signal) {
  let response;
  try {
    response = await fetch(`/api/auth/${operation}`, {
      signal,
      ...(operation === 'me' ? {} : {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(fields ?? {}),
      }),
    });
  } catch {
    throw new Error('Server bilan bog‘lanib bo‘lmadi.');
  }
  if (response.status === 204 || (operation === 'me' && response.status === 401)) return null;
  if (!response.ok) throw new Error(messages[response.status] || 'Serverda xatolik yuz berdi.');
  return (await response.json()).user;
}
