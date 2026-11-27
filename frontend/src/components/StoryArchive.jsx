import { useRef, useState } from 'react';
import { FiArchive, FiArrowLeft, FiImage } from 'react-icons/fi';
import { api } from '../api/client';
import ArchivedStoryImage from './ArchivedStoryImage';

const dateFormat = new Intl.DateTimeFormat('uz-UZ', { dateStyle: 'medium' });

export default function StoryArchive() {
  const dialog = useRef(null);
  const [stories, setStories] = useState(null);
  const [selected, setSelected] = useState(null);
  const [error, setError] = useState('');

  async function open() {
    setStories(null);
    setError('');
    dialog.current.showModal();
    try {
      setStories((await api.get('/stories/archive')).stories);
    } catch (error) {
      setError(error.message);
    }
  }

  function select(id) {
    setSelected(id);
    setError('');
  }

  return (
    <>
      <button type="button" className="btn btn-sm btn-outline" onClick={open}>
        <FiArchive aria-hidden="true" /> Arxivni ko‘rish
      </button>
      <dialog ref={dialog} className="story-archive" aria-labelledby="archive-title" onClose={() => select(null)}>
        <div className="profile-photo-header">
          <h2 id="archive-title">Storylar arxivi</h2>
          <form method="dialog"><button type="submit">Yopish</button></form>
        </div>
        {error && <p className="error" role="alert">{error}</p>}
        {!stories && !error && <p role="status">Yuklanmoqda…</p>}
        {stories?.length === 0 && <p>Hozircha arxivda story yo‘q.</p>}
        {selected ? (
          <figure className="archive-preview">
            <button type="button" onClick={() => select(null)}><FiArrowLeft aria-hidden="true" /> Arxivga qaytish</button>
            <ArchivedStoryImage key={selected} id={selected} />
          </figure>
        ) : (
          <ul className="archive-grid">
            {stories?.map((story) => (
              <li key={story._id}>
                <button type="button" onClick={() => select(story._id)}>
                  <FiImage className="mx-auto my-2 text-xl" aria-hidden="true" />
                  <time dateTime={story.createdAt}>{dateFormat.format(new Date(story.createdAt))}</time>
                </button>
              </li>
            ))}
          </ul>
        )}
      </dialog>
    </>
  );
}
