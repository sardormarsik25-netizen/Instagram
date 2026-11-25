import { useState } from 'react';
import { FiBookmark, FiGrid, FiRepeat, FiUsers, FiVideo } from 'react-icons/fi';

const sections = [
  { name: 'Postlar', empty: 'Hozircha postlar yo‘q.', Icon: FiGrid },
  { name: 'Videolar', empty: 'Hozircha videolar yo‘q.', Icon: FiVideo },
  { name: 'Saqlanganlar', empty: 'Hozircha saqlangan videolar yo‘q.', Icon: FiBookmark },
  { name: 'Repostlar', empty: 'Hozircha repost qilingan videolar yo‘q.', Icon: FiRepeat },
  { name: 'Hamkorlik', empty: 'Hozircha hamkorlikdagi postlar yo‘q.', Icon: FiUsers },
];

export default function ProfileMedia() {
  const [selected, setSelected] = useState(0);
  const { name, empty, Icon } = sections[selected];

  return (
    <section className="profile-posts" aria-label="Profil kontenti">
      <div className="profile-media-nav" role="group" aria-label="Kontent bo‘limlari">
        {sections.map(({ name, Icon }, index) => (
          <button type="button" key={name} title={name} aria-label={name}
            aria-pressed={selected === index} onClick={() => setSelected(index)}>
            <Icon aria-hidden="true" />
          </button>
        ))}
      </div>
      <div className="profile-media-empty" aria-live="polite">
        <Icon aria-hidden="true" />
        <h2>{name}</h2>
        <p>{empty}</p>
      </div>
    </section>
  );
}
