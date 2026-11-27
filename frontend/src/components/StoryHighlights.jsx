import { useEffect, useRef, useState } from 'react';
import { FiPlus } from 'react-icons/fi';
import { api } from '../api/client';
import ArchivedStoryImage from './ArchivedStoryImage';

const endpoint = '/stories/highlights';
const formatDate = new Intl.DateTimeFormat('uz-UZ', { dateStyle: 'medium', timeStyle: 'short' });

export default function StoryHighlights() {
  const dialog = useRef(null);
  const [highlights, setHighlights] = useState([]);
  const [loadError, setLoadError] = useState('');
  const [mode, setMode] = useState('add');
  const [name, setName] = useState('');
  const [archive, setArchive] = useState(null);
  const [selected, setSelected] = useState([]);
  const [view, setView] = useState(null);
  const [index, setIndex] = useState(0);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    let ignore = false;
    api.get(endpoint).then(({ highlights }) => {
      if (!ignore) setHighlights((current) => [...current, ...highlights.filter(
        (item) => !current.some((saved) => saved._id === item._id),
      )]);
    }).catch((error) => { if (!ignore) setLoadError(error.message); });
    return () => { ignore = true; };
  }, []);

  async function add() {
    setMode('add');
    setName('');
    setSelected([]);
    setArchive(null);
    setError('');
    dialog.current.showModal();
    try {
      setArchive((await api.get('/stories/archive')).stories);
    } catch (error) {
      setError(error.message);
    }
  }

  function toggle(id) {
    setSelected((current) => current.includes(id) ? current.filter((item) => item !== id) : [...current, id]);
  }

  async function save(event) {
    event.preventDefault();
    setSaving(true);
    setError('');
    try {
      const { highlight } = await api.post(endpoint, { name: name.trim(), storyIds: selected });
      setHighlights((current) => [...current, highlight]);
      dialog.current.close();
    } catch (error) {
      setError(error.message);
    } finally {
      setSaving(false);
    }
  }

  function viewHighlight(highlight) {
    setMode('view');
    setError('');
    setIndex(0);
    setView(highlight);
    dialog.current.showModal();
  }

  const active = view?.storyIds[index];

  return (
    <section className="profile-highlights" aria-labelledby="highlights-title">
      <h2 id="highlights-title" lang="ru">Актуальное</h2>
      <ul className="highlight-list">
        {highlights.map((highlight) => (
          <li key={highlight._id}>
            <button className="highlight-button" type="button" onClick={() => viewHighlight(highlight)}>
              <span className="highlight-circle">
                <ArchivedStoryImage id={highlight.storyIds[0]} key={highlight.storyIds[0] ?? 'empty'} cover />
              </span>
              <span className="highlight-label">{highlight.name}</span>
            </button>
          </li>
        ))}
        <li>
          <button type="button" className="highlight-button" onClick={add} lang="ru">
            <span className="highlight-circle"><FiPlus aria-hidden="true" /></span>
            <span className="highlight-label">Добавить</span>
          </button>
        </li>
      </ul>
      {loadError && <p className="error" role="alert">{loadError}</p>}
      <dialog ref={dialog} aria-labelledby="highlight-dialog-title"
        onCancel={(event) => { if (saving) event.preventDefault(); }}>
        <div className="profile-photo-header">
          <h2 id="highlight-dialog-title">{mode === 'add' ? 'Yangi Highlight' : view?.name}</h2>
          <form method="dialog"><button type="submit" disabled={saving}>Yopish</button></form>
        </div>
        {error && <p className="error" role="alert">{error}</p>}
        {mode === 'add' ? (
          <form className="profile-form" onSubmit={save}>
            <label>Highlight nomi
              <input value={name} maxLength={24} required disabled={saving} onChange={(event) => setName(event.target.value)} />
            </label>
            {!archive && !error && <p role="status">Arxiv yuklanmoqda…</p>}
            {archive?.length === 0 && <p>Arxivda hali story yo‘q.</p>}
            {archive?.length > 0 && (
              <fieldset className="highlight-picker">
                <legend>Arxivdan story tanlang</legend>
                {archive.map((story) => (
                  <label key={story._id}>
                    <input type="checkbox" checked={selected.includes(story._id)}
                      disabled={saving || (selected.length >= 20 && !selected.includes(story._id))}
                      onChange={() => toggle(story._id)} />
                    <time dateTime={story.createdAt}>{formatDate.format(new Date(story.createdAt))}</time>
                  </label>
                ))}
              </fieldset>
            )}
            <button type="submit" disabled={saving || !name.trim() || selected.length === 0}>
              {saving ? 'Saqlanmoqda…' : 'Saqlash'}
            </button>
          </form>
        ) : active ? (
          <div className="archive-preview">
            <ArchivedStoryImage key={active} id={active} />
            {view.storyIds.length > 1 && (
              <div className="highlight-controls">
                <button type="button" disabled={index === 0} onClick={() => setIndex(index - 1)}>Oldingi</button>
                <span>{index + 1}/{view.storyIds.length}</span>
                <button type="button" disabled={index === view.storyIds.length - 1} onClick={() => setIndex(index + 1)}>Keyingi</button>
              </div>
            )}
          </div>
        ) : <p>Bu Highlightdagi storylar mavjud emas.</p>}
      </dialog>
    </section>
  );
}
