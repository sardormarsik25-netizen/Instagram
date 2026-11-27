import { useEffect, useRef, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import AccountAvatar from '../components/AccountAvatar';
import FollowLists from '../components/FollowLists';
import ProfileMedia from '../components/ProfileMedia';
import ProfileNote from '../components/ProfileNote';
import StoryArchive from '../components/StoryArchive';
import StoryHighlights from '../components/StoryHighlights';
import { api, imageUrl } from '../api/client';
import { logout, updateUser } from '../store/authSlice';
import './account.css';

export default function Profile() {
  const user = useSelector((state) => state.auth.user);
  const dispatch = useDispatch();
  const photo = useRef(null);
  const [data, setData] = useState(null);
  const [loadError, setLoadError] = useState('');
  const [reload, setReload] = useState(0);
  const [editing, setEditing] = useState(false);
  const [saving, setSaving] = useState(false);
  const [feedback, setFeedback] = useState(null);
  const profile = { ...data?.profile, ...user };
  const displayName = user.fullName || user.username;

  useEffect(() => {
    let ignore = false;
    const path = `/user/${encodeURIComponent(user.username)}`;
    Promise.all([api.get(path), api.get(`${path}/posts`)]).then(([header, feed]) => {
      if (!ignore) {
        setData({ profile: header.user, posts: feed.posts });
        setLoadError('');
      }
    }).catch((error) => { if (!ignore) setLoadError(error.message); });
    return () => { ignore = true; };
  }, [user.username, reload]);

  async function save(event) {
    event.preventDefault();
    const fields = new FormData(event.currentTarget);
    if (!fields.get('avatar')?.size) fields.delete('avatar');
    setSaving(true);
    setFeedback(null);
    try {
      const { user } = await api.patch('/user/me', fields);
      dispatch(updateUser(user));
      setFeedback({ text: 'Profil saqlandi.' });
    } catch (error) {
      setFeedback({ text: error.message, failed: true });
    } finally {
      setSaving(false);
    }
  }

  function saveNote(updatedUser) {
    dispatch(updateUser(updatedUser));
    setData((current) => current && {
      ...current,
      profile: { ...current.profile, note: updatedUser.note },
    });
  }

  return (
    <section className="account-page dashboard-profile" aria-labelledby="profile-title">
      <div className="dashboard-user">
        <div className="profile-avatar-area">
          <ProfileNote note={data ? data.profile.note : user.note} onSaved={saveNote} />
          {user.avatar ? (
            <button type="button" className="profile-photo-button" aria-label="Profil rasmini kattalashtirish"
              onClick={() => photo.current.showModal()}><AccountAvatar user={user} /></button>
          ) : <AccountAvatar user={user} />}
        </div>
        <div>
          <h1 id="profile-title">{displayName}</h1>
          <p>@{user.username}</p>
        </div>
      </div>
      {user.bio && <p className="profile-bio">{user.bio}</p>}
      <FollowLists profile={profile} />
      {loadError && <p className="error" role="alert">{loadError}{' '}
        <button type="button" className="btn btn-xs" onClick={() => setReload((value) => value + 1)}>Qayta urinish</button>
      </p>}
      <div className="profile-tools">
        <button type="button" className="btn btn-sm btn-outline" aria-expanded={editing} aria-controls="edit-profile"
          onClick={() => { setFeedback(null); setEditing(!editing); }}>Profilni tahrirlash</button>
        <StoryArchive />
      </div>
      {user.avatar && (
        <dialog ref={photo} aria-labelledby="profile-photo-title">
          <div className="profile-photo-header">
            <h2 id="profile-photo-title">Profil rasmi</h2>
            <form method="dialog"><button type="submit">Yopish</button></form>
          </div>
          <img src={imageUrl(user.avatar)} alt={`${displayName} profil rasmi`} />
        </dialog>
      )}
      {editing && (
        <form id="edit-profile" className="profile-form" onSubmit={save}>
          <label>Username<input name="username" defaultValue={user.username} required minLength={3} maxLength={30}
            pattern="[A-Za-z0-9._]{3,30}" disabled={saving} /></label>
          <label htmlFor="profile-bio-input">Bio</label>
          <textarea id="profile-bio-input" name="bio" rows={3} maxLength={150} defaultValue={user.bio} disabled={saving} />
          <label>Profil rasmi qo‘yish<input type="file" name="avatar" accept="image/*" disabled={saving} /></label>
          <button disabled={saving}>{saving ? 'Saqlanmoqda…' : 'Profilni saqlash'}</button>
        </form>
      )}
      {feedback && <p className={feedback.failed ? 'error' : 'profile-status'} role={feedback.failed ? 'alert' : 'status'}>
        {feedback.text}
      </p>}
      <button className="btn btn-sm btn-ghost md:hidden" type="button" disabled={saving}
        onClick={() => dispatch(logout())}>Hisobdan chiqish</button>
      {!data && !loadError && <p role="status" className="mt-5">Postlar yuklanmoqda…</p>}
      <StoryHighlights />
      {data && <ProfileMedia posts={data.posts} />}
    </section>
  );
}
