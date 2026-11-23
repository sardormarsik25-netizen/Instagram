import React, { useEffect, useRef, useState } from 'react';
import { Avatar } from './Profile';
import { maxPhotoBytes, preparePhoto } from './photos';
import { updateReaction } from './social';

const storiesUrl = '/api/auth/stories';

export default function Stories({ user }) {
  const [stories, setStories] = useState([]);
  const [selected, setSelected] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState('');
  const [loadFailed, setLoadFailed] = useState(false);
  const [retry, setRetry] = useState(0);
  const [imageFailed, setImageFailed] = useState(false);
  const [liking, setLiking] = useState(false);
  const [reactionError, setReactionError] = useState('');
  const dialog = useRef(null);

  useEffect(() => {
    const controller = new AbortController();
    async function load() {
      try {
        const response = await fetch(storiesUrl, { signal: controller.signal });
        if (!response.ok) throw new Error();
        const data = await response.json();
        setStories((current) => {
          const byId = new Map(current.map((story) => [story.id, story]));
          for (const story of data.stories) byId.set(story.id, story);
          return [...byId.values()];
        });
      } catch {
        if (!controller.signal.aborted) setLoadFailed(true);
      }
    }
    load();
    return () => controller.abort();
  }, [retry]);

  const groups = new Map([[user.id, { id: user.id, username: user.username, stories: [] }]]);
  for (const story of stories) {
    if (Date.parse(story.expiresAt) <= Date.now()) continue;
    if (!groups.has(story.authorId)) {
      groups.set(story.authorId, { id: story.authorId, username: story.username, stories: [] });
    }
    groups.get(story.authorId).stories.push(story);
  }

  async function upload(event) {
    const input = event.currentTarget;
    const [file] = input.files;
    input.value = '';
    if (!file) return;
    if (file.size > maxPhotoBytes) {
      setError('10 MB gacha bo‘lgan rasmni tanlang.');
      return;
    }
    setError('');
    setUploading(true);
    try {
      const image = await preparePhoto(file, { size: 720 });
      const response = await fetch(storiesUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ image }),
      });
      if (!response.ok) throw new Error();
      const { story } = await response.json();
      setStories((current) => [story, ...current]);
    } catch {
      setError('Story qo‘yilmadi. Rasmni tekshirib, qayta urinib ko‘ring.');
    } finally {
      setUploading(false);
    }
  }

  function open(group) {
    setImageFailed(false);
    setReactionError('');
    setSelected({ group, index: 0 });
    dialog.current.showModal();
  }

  function move(step) {
    setImageFailed(false);
    setReactionError('');
    setSelected((current) => ({ ...current, index: current.index + step }));
  }

  const activeId = selected?.group.stories[selected.index]?.id;
  const activeStory = stories.find(({ id }) => id === activeId);

  async function toggleLike() {
    const liked = !activeStory.liked;
    setLiking(true);
    setReactionError('');
    try {
      await updateReaction('story', activeStory.id, liked);
      setStories((current) => current.map((story) => story.id === activeStory.id
        ? { ...story, liked } : story));
    } catch {
      setReactionError('Layk saqlanmadi. Qayta urinib ko‘ring.');
    } finally {
      setLiking(false);
    }
  }

  return (
    <section className="stories" aria-labelledby="stories-title">
      <h2 id="stories-title">Stories</h2>
      <ul className="stories-list">
        {[...groups.values()].map((group) => {
          const own = group.id === user.id;
          const hasStory = group.stories.length > 0;
          const avatar = <Avatar url={own ? user.avatarUrl : undefined} initial={group.username[0].toUpperCase()} />;
          return (
            <li key={group.id} className="story-account">
              {hasStory ? (
                <button type="button" className="story-avatar story-active"
                  aria-label={own ? 'Storyimni ko‘rish' : `${group.username} storysini ko‘rish`}
                  onClick={() => open(group)}>{avatar}</button>
              ) : <div className="story-avatar">{avatar}</div>}
              {own && (
                <label className="story-add">
                  <span aria-hidden="true">+</span>
                  <input type="file" accept="image/*" aria-label="Story qo‘yish" disabled={uploading} onChange={upload} />
                </label>
              )}
              <span className="story-name">{own ? 'Sizning storyingiz' : group.username}</span>
              {own && <span className="story-username">@{user.username}</span>}
            </li>
          );
        })}
      </ul>
      {uploading && <p role="status">Story yuklanmoqda…</p>}
      {error && <p className="error" role="alert">{error}</p>}
      {loadFailed && (
        <p className="story-load-error">
          Stories yuklanmadi. <button type="button" onClick={() => { setLoadFailed(false); setRetry(retry + 1); }}>Qayta urinish</button>
        </p>
      )}
      <dialog ref={dialog} className="profile-photo-dialog story-dialog" aria-labelledby="story-dialog-title"
        onClose={() => setSelected(null)}>
        <div className="profile-photo-header">
          <h3 id="story-dialog-title">{selected?.group.username}</h3>
          <form method="dialog"><button type="submit">Yopish</button></form>
        </div>
        {activeStory && (imageFailed ? <p role="status">Bu storyni ochib bo‘lmadi.</p> : (
          <img src={`${storiesUrl}/${activeStory.id}/image`} alt={`${activeStory.username} story rasmi`}
            onError={() => setImageFailed(true)} />
        ))}
        {activeStory && activeStory.authorId !== user.id && !imageFailed && (
          <button className="activity-like" type="button" aria-label="Storyga layk"
            aria-pressed={Boolean(activeStory.liked)} disabled={liking} onClick={toggleLike}>
            <span aria-hidden="true">{activeStory.liked ? '♥' : '♡'}</span>
          </button>
        )}
        {reactionError && <p className="error" role="alert">{reactionError}</p>}
        {selected?.group.stories.length > 1 && (
          <div className="story-view-controls">
            <button type="button" disabled={selected.index === 0} onClick={() => move(-1)}>Oldingi</button>
            <span>{selected.index + 1} / {selected.group.stories.length}</span>
            <button type="button" disabled={selected.index === selected.group.stories.length - 1}
              onClick={() => move(1)}>Keyingi</button>
          </div>
        )}
      </dialog>
    </section>
  );
}
