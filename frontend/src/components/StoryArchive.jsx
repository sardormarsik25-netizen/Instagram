import { useEffect, useRef, useState } from 'react';
import { FiArchive, FiArrowLeft } from 'react-icons/fi';

const archiveUrl = '/api/auth/stories/archive';
const dateFormat = new Intl.DateTimeFormat('uz-UZ', { dateStyle: 'medium' });
const storyImageUrl = (id) => `/api/auth/stories/${id}/image?archive=1`;

export default function StoryArchive() {
  const dialog = useRef(null);
  const [open, setOpen] = useState(false);
  const [stories, setStories] = useState(null);
  const [selected, setSelected] = useState(null);
  const [error, setError] = useState(false);
  const [retry, setRetry] = useState(0);

  useEffect(() => {
    if (!open) return;
    const controller = new AbortController();
    async function load() {
      try {
        const response = await fetch(archiveUrl, { signal: controller.signal });
        if (!response.ok) throw new Error();
        const data = await response.json();
        if (!controller.signal.aborted) setStories(data.stories);
      } catch {
        if (!controller.signal.aborted) setError(true);
      }
    }
    load();
    return () => controller.abort();
  }, [open, retry]);

  function openArchive() {
    setStories(null);
    setSelected(null);
    setError(false);
    setOpen(true);
    dialog.current.showModal();
  }

  return (
    <>
      <button className="btn btn-sm btn-outline" type="button" onClick={openArchive}>
        <FiArchive className="shrink-0" aria-hidden="true" /> Arxivni ko‘rish
      </button>
      <dialog ref={dialog} className="story-archive" aria-labelledby="archive-title" onClose={() => setOpen(false)}>
        <div className="profile-photo-header">
          <h2 id="archive-title">Storylar arxivi</h2>
          <form method="dialog"><button type="submit">Yopish</button></form>
        </div>
        {error && <p className="error" role="alert">Arxiv yuklanmadi.{' '}
          <button type="button" onClick={() => { setError(false); setRetry(retry + 1); }}>Qayta urinish</button>
        </p>}
        {!stories && !error && <p role="status">Yuklanmoqda…</p>}
        {stories?.length === 0 && <p>Hozircha arxivda story yo‘q.</p>}
        {selected ? (
          <figure className="archive-preview">
            <button type="button" onClick={() => setSelected(null)}><FiArrowLeft aria-hidden="true" /> Arxivga qaytish</button>
            <img src={storyImageUrl(selected.id)} alt="Arxivdagi story" />
            <figcaption>{dateFormat.format(new Date(selected.createdAt))}</figcaption>
          </figure>
        ) : (
          <ul className="archive-grid">
            {(stories ?? []).map((story) => {
              const date = dateFormat.format(new Date(story.createdAt));
              return (
                <li key={story.id}>
                  <button type="button" aria-label={`Storyni ko‘rish, ${date}`} onClick={() => setSelected(story)}>
                    <img src={storyImageUrl(story.id)} alt="" loading="lazy" />
                    <time dateTime={story.createdAt}>{date}</time>
                  </button>
                </li>
              );
            })}
          </ul>
        )}
      </dialog>
    </>
  );
}
