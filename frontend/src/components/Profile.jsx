import { useRef, useState } from 'react';
import { maxPhotoBytes, preparePhoto } from './photos';
import ProfileStats from './ProfileStats';
import ProfileMedia from './ProfileMedia';
import StoryArchive from './StoryArchive';

export function Avatar({ url, initial }) {
  return (
    <span className="dashboard-avatar" aria-hidden="true">
      {url ? <img src={url} alt="" /> : initial}
    </span>
  );
}

export default function Profile({ user, pending, error, onLogout, onSave }) {
  const [username, setUsername] = useState(user.username);
  const [bio, setBio] = useState(user.bio ?? '');
  const [photo, setPhoto] = useState(null);
  const [reading, setReading] = useState(false);
  const [photoError, setPhotoError] = useState('');
  const [saved, setSaved] = useState(false);
  const [editing, setEditing] = useState(false);
  const photoDialog = useRef(null);
  const displayName = user.fullName || user.username;
  const photoUrl = photo || user.avatarUrl;
  const avatar = <Avatar url={photoUrl} initial={displayName[0].toUpperCase()} />;

  async function selectPhoto(event) {
    const input = event.currentTarget;
    const [file] = input.files;
    input.value = '';
    if (!file) return;
    setSaved(false);
    setPhotoError('');
    if (file.size > maxPhotoBytes) {
      setPhotoError('10 MB gacha bo‘lgan rasmni tanlang.');
      return;
    }
    setReading(true);
    try {
      setPhoto(await preparePhoto(file, { size: 256, square: true }));
    } catch {
      setPhotoError('Rasm yuklanmadi. Boshqa rasmni tanlang.');
    } finally {
      setReading(false);
    }
  }

  async function save(event) {
    event.preventDefault();
    setSaved(false);
    const fields = { username: username.trim(), bio: bio.trim() };
    if (photo) fields.avatarUrl = photo;
    if (await onSave(fields)) {
      setUsername(fields.username.toLowerCase());
      setBio(fields.bio);
      setPhoto(null);
      setSaved(true);
    }
  }

  return (
    <section id="profile" className="dashboard-profile" aria-labelledby="profile-title">
      <div className="dashboard-user">
        {photoUrl ? (
          <button type="button" className="profile-photo-button" aria-label="Profil rasmini kattalashtirish"
            onClick={() => photoDialog.current.showModal()}>
            {avatar}
          </button>
        ) : avatar}
        <div>
          <h1 id="profile-title">{displayName}</h1>
          <p>@{user.username}</p>
        </div>
      </div>
      {user.bio && <p className="profile-bio">{user.bio}</p>}
      <ProfileStats />
      <div className="profile-tools">
        <button className="btn btn-sm btn-outline" type="button" aria-expanded={editing}
          aria-controls="edit-profile" onClick={() => setEditing(!editing)}>Profilni tahrirlash</button>
        <StoryArchive />
      </div>
      {photoUrl && (
        <dialog ref={photoDialog} className="profile-photo-dialog" aria-labelledby="profile-photo-title">
          <div className="profile-photo-header">
            <h3 id="profile-photo-title">Profil rasmi</h3>
            <form method="dialog">
              <button type="submit">Yopish</button>
            </form>
          </div>
          <img src={photoUrl} alt={`${displayName} profil rasmi`} />
        </dialog>
      )}
      <form id="edit-profile" className="profile-form" hidden={!editing} onSubmit={save}>
        <label>
          Username qo‘yish
          <input name="username" value={username} required minLength={3} maxLength={30}
            pattern="[A-Za-z0-9._]{3,30}" autoComplete="username" disabled={pending}
            onChange={(event) => { setUsername(event.target.value); setSaved(false); }} />
        </label>
        <label>
          Bio
          <textarea name="bio" rows={3} maxLength={150} value={bio} disabled={pending}
            onChange={(event) => { setBio(event.target.value); setSaved(false); }} />
        </label>
        <label>
          Profil rasmi qo‘yish
          <input type="file" accept="image/*" disabled={pending || reading} onChange={selectPhoto} />
        </label>
        {photoError && <p className="error" role="alert">{photoError}</p>}
        {error && <p className="error" role="alert">{error}</p>}
        {saved && <p className="profile-status" role="status">Profil saqlandi.</p>}
        <button disabled={pending || reading}>
          {reading ? 'Rasm tayyorlanmoqda…' : 'Profilni saqlash'}
        </button>
      </form>
      {!editing && error && <p className="error" role="alert">{error}</p>}
      <button className="btn btn-sm btn-ghost md:hidden" type="button" disabled={pending || reading} onClick={onLogout}>
        Hisobdan chiqish
      </button>
      <ProfileMedia />
    </section>
  );
}
