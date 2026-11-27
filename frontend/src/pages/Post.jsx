import { useEffect, useRef, useState } from 'react';
import { useSelector } from 'react-redux';
import { Link } from 'react-router-dom';
import { FiArrowLeft, FiCheck, FiChevronDown, FiCrop, FiImage, FiMapPin, FiPlus, FiSmile, FiUpload, FiX, FiZoomIn } from 'react-icons/fi';

const button = 'btn btn-primary gap-2 rounded-xl px-6 text-sm font-semibold normal-case disabled:opacity-50';
const filters = [
  { name: 'Original', value: 'none' },
  { name: 'Clarendon', value: 'contrast(1.2) saturate(1.25)' },
  { name: 'Gingham', value: 'sepia(.2) contrast(.9)' },
  { name: 'Moon', value: 'grayscale(1)' },
  { name: 'Lark', value: 'brightness(1.1) saturate(.85)' },
  { name: 'Reyes', value: 'sepia(.35) brightness(1.1) contrast(.85)' },
  { name: 'Juno', value: 'saturate(1.5) contrast(1.1)' },
  { name: 'Aden', value: 'hue-rotate(-15deg) sepia(.2) brightness(1.15)' },
];

const Post = () => {
  const user = useSelector((state) => state.auth.user);
  const username = user?.username || user?.name || user?.email?.split('@')[0] || 'instagram_user';
  const inputRef = useRef(null);
  const imageRef = useRef(null);
  const headingRef = useRef(null);
  const [step, setStep] = useState(0);
  const [photo, setPhoto] = useState(null);
  const [dragging, setDragging] = useState(false);
  const [error, setError] = useState('');
  const [ratio, setRatio] = useState('1');
  const [zoom, setZoom] = useState(1);
  const [filter, setFilter] = useState(0);
  const [caption, setCaption] = useState('');
  const [location, setLocation] = useState('');
  const [alt, setAlt] = useState('');
  const [hideLikes, setHideLikes] = useState(false);
  const [disableComments, setDisableComments] = useState(false);
  const [emojisOpen, setEmojisOpen] = useState(false);
  const [busy, setBusy] = useState(false);

  useEffect(() => () => {
    if (photo) URL.revokeObjectURL(photo.url);
  }, [photo]);
  useEffect(() => { headingRef.current?.focus(); }, [step]);

  const reset = () => {
    setPhoto(null);
    setStep(0);
    setCaption('');
    setLocation('');
    setAlt('');
    setRatio('1');
    setZoom(1);
    setFilter(0);
    setError('');
    setHideLikes(false);
    setDisableComments(false);
    setEmojisOpen(false);
  };

  const selectPhoto = (files) => {
    setDragging(false);
    setError('');
    const file = files?.[0];
    if (!file) return;
    if (files.length > 1) return setError('Hozircha bitta rasm tanlang.');
    if (!['image/jpeg', 'image/png', 'image/webp'].includes(file.type)) {
      return setError('JPG, PNG yoki WebP formatidagi rasmni tanlang.');
    }
    if (file.size > 10 * 1024 * 1024) return setError('Rasm hajmi 10 MB dan oshmasligi kerak.');
    setPhoto({ url: URL.createObjectURL(file), name: file.name });
    setAlt('');
    setRatio('1');
    setZoom(1);
    setFilter(0);
    setStep(1);
  };

  const share = () => {
    if (!imageRef.current?.naturalWidth || busy) return;
    setBusy(true);
    setError('');
    try {
      const img = imageRef.current;
      const aspect = Number(ratio);
      const width = Math.min(img.naturalWidth, img.naturalHeight * aspect) / zoom;
      const height = width / aspect;
      const canvas = document.createElement('canvas');
      canvas.width = Math.round(Math.min(width, 1080));
      canvas.height = Math.round(canvas.width / aspect);
      const ctx = canvas.getContext('2d');
      ctx.filter = filters[filter].value;
      ctx.drawImage(img, (img.naturalWidth - width) / 2, (img.naturalHeight - height) / 2, width, height, 0, 0, canvas.width, canvas.height);
      const key = 'instagram-demo-posts';
      const saved = JSON.parse(localStorage.getItem(key) || '[]');
      if (!Array.isArray(saved)) throw new Error('Invalid saved posts');
      const post = {
        id: crypto.randomUUID(), username, image: canvas.toDataURL('image/jpeg', 0.85),
        caption: caption.trim(), location: location.trim(), alt: alt.trim(),
        hideLikes, disableComments, createdAt: new Date().toISOString(),
      };
      localStorage.setItem(key, JSON.stringify([post, ...saved]));
      setStep(3);
    } catch {
      setError('Postni saqlab bo‘lmadi. Brauzer xotirasi to‘lgan bo‘lishi mumkin. Qayta urinib ko‘ring.');
    } finally {
      setBusy(false);
    }
  };

  return (
    <section className="post-studio flex min-h-[calc(100dvh-5rem)] flex-col px-4 py-7 sm:px-8 md:min-h-screen lg:px-10 lg:py-10">
      <div className="mx-auto mb-7 w-full max-w-[900px]">
        <p className="eyebrow">SIZNING IJOD MAYDONINGIZ</p>
        <div className="mt-2 flex items-center justify-between gap-3"><h1 className="text-2xl font-semibold tracking-tight sm:text-3xl">Bir lahza. Ming taassurot<span className="text-primary">.</span></h1><span className="hidden rounded-full border border-base-300 bg-base-100 px-3 py-1.5 text-[10px] text-base-content/45 sm:inline">Yangi post</span></div>
        <p className="mt-3 text-sm leading-relaxed text-base-content/50">Sevimli rasmingizni tanlang. O‘z uslubingizni qo‘shing. Hikoyangizni ulashing.</p>
        <ol className="studio-steps mt-8 grid grid-cols-3 gap-2 sm:gap-5" aria-label="Post yaratish bosqichlari">
          {['Rasm tanlash', 'Tahrirlash', 'Ulashish'].map((label, index) => <li key={label} aria-current={step === index ? 'step' : undefined} className={`flex items-center gap-2 border-t-2 pt-3 text-[11px] sm:gap-3 sm:text-xs ${step >= index ? 'border-primary text-base-content' : 'border-base-300 text-base-content/35'}`}><span className={`grid h-6 w-6 shrink-0 place-items-center rounded-full text-[10px] ${step >= index ? 'bg-primary/10 text-primary' : 'bg-base-200'}`}>{step > index ? <FiCheck /> : `0${index + 1}`}</span>{label}</li>)}
        </ol>
      </div>
      <div className="studio-card mx-auto w-full max-w-[900px] overflow-hidden rounded-2xl border border-base-300/80 bg-base-100 shadow-[0_12px_50px_-30px_rgba(0,0,0,0.18)]" aria-busy={busy}>
        <header className="grid h-[52px] grid-cols-[80px_1fr_80px] items-center border-b border-base-300 px-3">
          <div>{step > 0 && step < 3 && <button type="button" disabled={busy} onClick={() => { setStep(step - 1); setError(''); }} aria-label="Orqaga" className="rounded-full p-2 hover:bg-base-200"><FiArrowLeft size={22} /></button>}</div>
          <h2 ref={headingRef} tabIndex={-1} className="text-center text-sm font-semibold outline-none">{['Yangi post yaratish', 'Rasmni tahrirlash', 'Yangi post yaratish', 'Post saqlandi'][step]}</h2>
          <div className="text-right">
            {step === 1 && <button type="button" onClick={() => { setStep(2); setError(''); }} className="rounded p-2 text-sm font-semibold text-[#0095f6] hover:text-[#1877f2]">Keyingi</button>}
            {step === 2 && <button type="button" disabled={busy} onClick={share} className="rounded p-2 text-sm font-semibold text-[#0095f6] hover:text-[#1877f2] disabled:opacity-40">{busy ? 'Saqlash…' : 'Ulashish'}</button>}
          </div>
        </header>
        <input ref={inputRef} type="file" accept="image/jpeg,image/png,image/webp" className="hidden" aria-label="Post uchun rasm tanlash" onChange={(event) => { selectPhoto(event.target.files); event.target.value = ''; }} />

        {step === 0 && (
          <div onDragOver={(event) => { event.preventDefault(); setDragging(true); }} onDragLeave={(event) => { if (!event.currentTarget.contains(event.relatedTarget)) setDragging(false); }} onDrop={(event) => { event.preventDefault(); selectPhoto(event.dataTransfer.files); }} className={`upload-zone relative m-4 flex min-h-[360px] flex-col items-center justify-center rounded-xl border border-dashed px-5 py-14 text-center transition-colors sm:m-6 sm:min-h-[400px] ${dragging ? 'border-primary bg-primary/10 ring-2 ring-inset ring-primary' : 'border-base-300'}`}>
            <span className="mb-8 rounded-full border border-base-300 bg-base-100 px-3 py-1 text-[9px] font-semibold uppercase tracking-[0.18em] text-base-content/40">Har bir lahza qadrli</span>
            <div aria-hidden="true" className="relative mb-8 h-24 w-28 text-primary">
              <div className="absolute left-0 top-0 -rotate-12 rounded-xl border-2 border-current bg-base-100 p-3"><FiImage size={38} strokeWidth={1.3} /></div>
              <div className="absolute bottom-0 right-0 rotate-12 rounded-xl border-2 border-current bg-base-100 p-3"><FiPlus size={30} strokeWidth={1.3} /></div>
            </div>
            <h3 className="text-xl font-semibold tracking-tight sm:text-2xl">Hikoyangiz shu yerdan boshlanadi</h3>
            <p className="mb-6 mt-2 max-w-xs text-sm leading-relaxed text-base-content/45">Rasmni shu yerga tashlang yoki qurilmangizdan sevimli lahzani tanlang</p>
            <button type="button" onClick={() => inputRef.current?.click()} className={button}><FiUpload size={16} />Rasm tanlash</button>
            <p className="mt-5 text-[11px] text-base-content/40">JPG, PNG, WebP · 10 MB gacha</p>
          </div>
        )}

        {(step === 1 || step === 2) && photo && (
          <div className={`grid ${step === 2 ? 'sm:grid-cols-[minmax(0,1fr)_280px]' : ''}`}>
            <div className="min-w-0 bg-base-200/50">
              <div className="flex min-h-[300px] items-center justify-center overflow-hidden bg-neutral/95 sm:min-h-[360px]">
                <div className="relative w-full overflow-hidden" style={{ aspectRatio: ratio }}>
                  <img ref={imageRef} src={photo.url} alt={alt || 'Tanlangan rasm'} onError={() => { reset(); setError('Rasmni ochib bo‘lmadi. Boshqa rasm tanlang.'); }} className="absolute inset-0 h-full w-full object-cover" style={{ transform: `scale(${zoom})`, filter: filters[filter].value }} />
                  {step === 1 && <div aria-hidden="true" className="pointer-events-none absolute inset-0 grid grid-cols-3 grid-rows-3 opacity-40">{Array.from({ length: 9 }, (_, i) => <div key={i} className="border border-white/30" />)}</div>}
                </div>
              </div>
              {step === 1 && (
                <div className="space-y-5 p-5">
                  <div className="flex flex-wrap items-center gap-3">
                    <FiCrop size={18} className="text-base-content/50" />
                    <label className="sr-only" htmlFor="post-ratio">Rasm nisbati</label>
                    <select id="post-ratio" value={ratio} onChange={(event) => setRatio(event.target.value)} className="rounded-lg border border-base-300 bg-base-100 p-2 text-xs"><option value="1">Kvadrat · 1:1</option><option value="0.8">Portret · 4:5</option><option value="1.7777777778">Keng · 16:9</option></select>
                    <FiZoomIn size={18} className="ml-auto text-base-content/50" />
                    <input aria-label="Rasmni kattalashtirish" type="range" min="1" max="2" step="0.01" value={zoom} onChange={(event) => setZoom(Number(event.target.value))} className="w-24 accent-[#0095f6]" />
                  </div>
                  <div className="grid grid-cols-4 gap-3" aria-label="Rasm filtrlari">{filters.map((item, index) => <button type="button" key={item.name} aria-pressed={filter === index} onClick={() => setFilter(index)} className={`rounded-lg p-1 text-xs ${filter === index ? 'font-semibold text-[#0095f6] ring-2 ring-[#0095f6]' : 'text-base-content/60 hover:bg-base-200'}`}><img src={photo.url} alt="" className="mb-2 aspect-square w-full rounded object-cover" style={{ filter: item.value }} />{item.name}</button>)}</div>
                  <button type="button" onClick={() => inputRef.current?.click()} className="flex items-center gap-2 text-xs font-semibold text-base-content/60 hover:text-[#0095f6]"><FiUpload /> Boshqa rasm tanlash</button>
                </div>
              )}
            </div>
            {step === 2 && (
              <div className="min-w-0 sm:border-l sm:border-base-300">
                <div className="flex items-center gap-3 px-4 py-5"><div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-gradient-to-tr from-[#ffcc70] via-[#e1306c] to-[#833ab4] text-sm font-semibold text-white">{username[0].toUpperCase()}</div><span className="truncate text-sm font-semibold">{username}</span></div>
                <label htmlFor="post-caption" className="sr-only">Post izohi</label>
                <textarea id="post-caption" placeholder="Izoh yozing…" maxLength={2200} value={caption} onChange={(event) => setCaption(event.target.value)} className="h-36 w-full resize-none bg-transparent px-4 text-sm leading-relaxed outline-none placeholder:text-base-content/40 focus:ring-1 focus:ring-inset focus:ring-[#0095f6]" />
                <div className="flex items-center justify-between px-4 py-3"><button type="button" aria-label="Emoji tanlash" aria-expanded={emojisOpen} onClick={() => setEmojisOpen(!emojisOpen)} className="rounded p-1 text-base-content/50 hover:text-base-content"><FiSmile size={20} /></button><span className="text-[11px] text-base-content/35">{caption.length.toLocaleString()} / 2,200</span></div>
                {emojisOpen && <div className="flex flex-wrap gap-2 border-t border-base-300 px-4 py-3">{['❤️', '✨', '🔥', '😊', '🌿', '☀️', '📸', '🙌'].map((emoji) => <button key={emoji} type="button" aria-label={`${emoji} qo‘shish`} onClick={() => setCaption((text) => (text + emoji).slice(0, 2200))} className="rounded p-1 hover:bg-base-200">{emoji}</button>)}</div>}
                <div className="flex items-center border-t border-base-300 px-4"><input aria-label="Joylashuv" placeholder="Joylashuv qo‘shish" maxLength={100} value={location} onChange={(event) => setLocation(event.target.value)} className="min-w-0 flex-1 bg-transparent py-4 text-sm outline-none focus:placeholder:text-[#0095f6]" /><FiMapPin size={18} className="text-base-content/60" /></div>
                <details className="group border-t border-base-300 px-4 py-4"><summary className="flex cursor-pointer list-none items-center justify-between text-sm">Maxsus imkoniyatlar<FiChevronDown className="transition-transform group-open:rotate-180" /></summary><label htmlFor="post-alt" className="mt-4 block text-xs leading-relaxed text-base-content/50">Rasm tavsifi ekran o‘quvchi dasturlardan foydalanadigan odamlarga yordam beradi.</label><textarea id="post-alt" maxLength={500} value={alt} onChange={(event) => setAlt(event.target.value)} placeholder="Rasmda nimalar bor?" className="mt-3 w-full resize-none rounded-lg border border-base-300 bg-transparent p-2 text-xs" /></details>
                <details className="group border-t border-base-300 px-4 py-4"><summary className="flex cursor-pointer list-none items-center justify-between text-sm">Qo‘shimcha sozlamalar<FiChevronDown className="transition-transform group-open:rotate-180" /></summary><label className="mt-4 flex cursor-pointer items-center justify-between gap-3 text-xs leading-relaxed">Layklar sonini yashirish<input type="checkbox" checked={hideLikes} onChange={(event) => setHideLikes(event.target.checked)} className="toggle toggle-sm shrink-0" /></label><label className="mt-4 flex cursor-pointer items-center justify-between gap-3 text-xs leading-relaxed">Izohlarni o‘chirish<input type="checkbox" checked={disableComments} onChange={(event) => setDisableComments(event.target.checked)} className="toggle toggle-sm shrink-0" /></label></details>
                <p className="border-t border-base-300 px-4 py-4 text-[11px] leading-relaxed text-base-content/40">Demo rejim: post faqat shu brauzerda saqlanadi.</p>
              </div>
            )}
          </div>
        )}
        {step === 3 && <div className="flex min-h-[460px] flex-col items-center justify-center px-6 py-14 text-center"><div className="mb-6 rounded-full bg-gradient-to-tr from-[#ffcc70] via-[#e1306c] to-[#833ab4] p-[3px]"><div className="rounded-full bg-base-100 p-5"><FiCheck size={48} strokeWidth={1.5} /></div></div><h3 className="text-2xl font-semibold">Lahzangiz saqlandi!</h3><p className="mt-3 max-w-xs text-sm leading-relaxed text-base-content/50">Post bosh sahifangizga qo‘shildi. U faqat shu brauzerda saqlanadi.</p><Link to="/" className={`${button} mt-7`}>Postni lentada ko‘rish</Link><button type="button" onClick={reset} className="mt-4 rounded-lg p-2 text-xs font-semibold text-base-content/50">Yana post yaratish</button></div>}
        {error && <div role="alert" className="flex items-start gap-3 border-t border-base-300 bg-error/5 px-5 py-4 text-sm text-error"><span className="flex-1">{error}</span><button type="button" onClick={() => setError('')} aria-label="Xabarni yopish" className="rounded p-1"><FiX /></button></div>}
      </div>
      <div className="mx-auto mt-6 grid w-full max-w-[900px] grid-cols-3 gap-3 text-[10px] text-base-content/45 sm:gap-6 sm:text-xs"><p className="flex items-center justify-center gap-2"><FiImage className="shrink-0 text-primary" />Yuqori sifat</p><p className="flex items-center justify-center gap-2"><FiCrop className="shrink-0 text-primary" />8 ta rang filtri</p><p className="flex items-center justify-center gap-2"><FiSmile className="shrink-0 text-primary" />Sizning uslubingiz</p></div>
    </section>
  );
};

export default Post;
