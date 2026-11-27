import { useEffect, useState } from 'react';
import { useSelector } from 'react-redux';
import { FiImage } from 'react-icons/fi';
import { API_URL } from '../api/client';

export default function ArchivedStoryImage({ id, cover = false }) {
  const token = useSelector((state) => state.auth.token);
  const [preview, setPreview] = useState(null);
  const [error, setError] = useState(false);

  useEffect(() => {
    if (!id) return;
    const controller = new AbortController();
    let url;
    async function load() {
      try {
        const response = await fetch(`${API_URL}/stories/archive/${id}/image`, {
          headers: { Authorization: `Bearer ${token}` }, signal: controller.signal,
        });
        if (!response.ok) throw new Error();
        const blob = await response.blob();
        if (!controller.signal.aborted) {
          url = URL.createObjectURL(blob);
          setPreview(url);
        }
      } catch {
        if (!controller.signal.aborted) setError(true);
      }
    }
    load();
    return () => { controller.abort(); if (url) URL.revokeObjectURL(url); };
  }, [id, token]);

  if (preview) return <img src={preview} alt={cover ? '' : 'Arxivdagi story'} />;
  if (cover) return <FiImage aria-hidden="true" />;
  return <p role="status">{error ? 'Story rasmini yuklab bo‘lmadi.' : 'Rasm yuklanmoqda…'}</p>;
}
