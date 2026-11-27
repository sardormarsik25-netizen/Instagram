import { useEffect, useRef, useState } from 'react';
import { api } from '../api/client';

export default function ProfileNote({ note, onSaved }) {
  const dialog = useRef(null);
  const [draft, setDraft] = useState('');
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [expiredAt, setExpiredAt] = useState(null);
  const expiry = note?.expiresAt;
  const visible = note?.text && expiry !== expiredAt && Date.parse(expiry) > Date.now();

  useEffect(() => {
    const remaining = Date.parse(expiry) - Date.now();
    if (!(remaining > 0)) return;
    const timeout = setTimeout(() => setExpiredAt(expiry), remaining);
    return () => clearTimeout(timeout);
  }, [expiry]);

  function open() {
    setDraft(visible ? note.text : '');
    setError('');
    dialog.current.showModal();
  }

  async function save(text) {
    setSaving(true);
    setError('');
    try {
      const { user } = await api.patch('/user/me/note', { text });
      onSaved(user);
      dialog.current.close();
    } catch (error) {
      setError(error.message);
    } finally {
      setSaving(false);
    }
  }

  return (
    <>
      <button type="button" className="profile-note-bubble"
        aria-label={visible ? `Zametkani tahrirlash: ${note.text}` : 'Zametka qo‘shish'} onClick={open}>
        {visible ? <span>{note.text}</span> : <span lang="ru">заметка...</span>}
      </button>
      <dialog ref={dialog} aria-labelledby="profile-note-title"
        onCancel={(event) => { if (saving) event.preventDefault(); }}>
        <div className="profile-photo-header">
          <h2 id="profile-note-title">{visible ? 'Zametkani tahrirlash' : 'Zametka qo‘shish'}</h2>
          <form method="dialog"><button type="submit" disabled={saving}>Yopish</button></form>
        </div>
        <form className="profile-form" onSubmit={(event) => { event.preventDefault(); save(draft.trim()); }}>
          <label htmlFor="profile-note-text">Zametka yozing</label>
          <textarea id="profile-note-text" rows={2} maxLength={60} value={draft} required
            autoFocus disabled={saving} aria-describedby="profile-note-limit"
            onChange={(event) => setDraft(event.target.value)} />
          <p id="profile-note-limit" className="text-xs text-base-content/65">{draft.length}/60 · 24 soat ko‘rinadi</p>
          {error && <p className="error" role="alert">{error}</p>}
          <button type="submit" disabled={saving || !draft.trim()}>{saving ? 'Saqlanmoqda…' : 'Joylash'}</button>
          {visible && <button type="button" disabled={saving} onClick={() => save('')}>Zametkani olib tashlash</button>}
        </form>
      </dialog>
    </>
  );
}
