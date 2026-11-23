import React, { useEffect, useState } from 'react';
import { Avatar } from './Profile';
import { updateReaction } from './social';

const notesUrl = '/api/auth/notes';

export default function ChatNotes({ user }) {
  const [notes, setNotes] = useState([]);
  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState('');
  const [saving, setSaving] = useState(false);
  const [status, setStatus] = useState('');
  const [error, setError] = useState('');
  const [reactionError, setReactionError] = useState('');
  const [liking, setLiking] = useState(false);
  const [loadError, setLoadError] = useState(false);
  const [reload, setReload] = useState(0);
  const activeNotes = notes.filter((note) => Date.parse(note.expiresAt) > Date.now());
  const own = activeNotes.find((note) => note.authorId === user.id);

  useEffect(() => {
    const controller = new AbortController();
    async function load() {
      try {
        const response = await fetch(notesUrl, { signal: controller.signal });
        if (!response.ok) throw new Error();
        const { notes } = await response.json();
        setNotes((current) => {
          const latest = new Map(notes.map((note) => [note.authorId, note]));
          for (const note of current) {
            if (!latest.has(note.authorId) || latest.get(note.authorId).expiresAt < note.expiresAt) {
              latest.set(note.authorId, note);
            }
          }
          return [...latest.values()];
        });
      } catch {
        if (!controller.signal.aborted) setLoadError(true);
      }
    }
    load();
    return () => controller.abort();
  }, [reload]);

  async function publish(event) {
    event.preventDefault();
    setSaving(true);
    setError('');
    try {
      const response = await fetch(notesUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text: draft.trim() }),
      });
      if (!response.ok) throw new Error();
      const { note } = await response.json();
      setNotes((current) => [note, ...current.filter((item) => item.authorId !== user.id)]);
      setEditing(false);
      setStatus('Zametka joylandi.');
    } catch {
      setError('Zametka joylanmadi. Qayta urinib ko‘ring.');
    } finally {
      setSaving(false);
    }
  }

  async function toggleLike(note) {
    const liked = !note.liked;
    setLiking(true);
    setReactionError('');
    try {
      await updateReaction('note', note.authorId, liked, note.expiresAt);
      setNotes((current) => current.map((item) => item.authorId === note.authorId
        ? { ...item, liked } : item));
    } catch {
      setReactionError('Layk saqlanmadi. Qayta urinib ko‘ring.');
    } finally {
      setLiking(false);
    }
  }

  return (
    <section className="chat-notes" aria-labelledby="notes-title">
      <div className="chat-notes-header">
        <h3 id="notes-title">Zametkalar</h3>
        {!editing && <button className="note-button" type="button" onClick={() => {
          setDraft(own?.text ?? '');
          setError('');
          setStatus('');
          setEditing(true);
        }}>{own ? 'Zametkani tahrirlash' : '+ Zametka qo‘shish'}</button>}
      </div>
      {editing && (
        <form className="profile-form note-form" onSubmit={publish}>
          <label htmlFor="chat-note">Zametka yozing</label>
          <textarea id="chat-note" maxLength={60} rows={2} value={draft} required disabled={saving}
            onChange={(event) => setDraft(event.target.value)} aria-describedby="note-limit" />
          <small id="note-limit">{draft.length}/60 · 24 soat ko‘rinadi</small>
          {error && <p className="error" role="alert">{error}</p>}
          <div className="note-controls">
            <button type="button" className="note-button" disabled={saving} onClick={() => setEditing(false)}>Bekor qilish</button>
            <button type="submit" className="note-button" disabled={saving || !draft.trim()}>
              {saving ? 'Joylanmoqda…' : 'Joylash'}
            </button>
          </div>
        </form>
      )}
      {status && <p className="profile-status" role="status">{status}</p>}
      {reactionError && <p className="error" role="alert">{reactionError}</p>}
      {loadError && <p className="story-load-error">Zametkalar yuklanmadi. <button className="note-button" type="button"
        onClick={() => { setLoadError(false); setReload(reload + 1); }}>Qayta urinish</button></p>}
      {activeNotes.length > 0 && (
        <ul className="notes-list">
          {[own, ...activeNotes.filter((note) => note.authorId !== user.id)].filter(Boolean).map((note) => (
            <li key={note.authorId}>
              <p>{note.text}</p>
              <Avatar url={note.authorId === user.id ? user.avatarUrl : undefined} initial={note.username[0].toUpperCase()} />
              <span>@{note.username}</span>
              {note.authorId !== user.id && (
                <button className="activity-like" type="button" aria-label={`${note.username} zametkasiga layk`}
                  aria-pressed={Boolean(note.liked)} disabled={liking} onClick={() => toggleLike(note)}>
                  <span aria-hidden="true">{note.liked ? '♥' : '♡'}</span>
                </button>
              )}
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}
