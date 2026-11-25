import { FiInstagram } from 'react-icons/fi';
import { Outlet } from 'react-router-dom';

const AuthLayout = () => (
  <div className="grid min-h-[100dvh] bg-base-100 text-base-content lg:grid-cols-[1.05fr_0.95fr]">
    <section className="relative hidden overflow-hidden bg-neutral text-neutral-content lg:block">
      <div className="absolute -left-24 -top-32 h-96 w-96 rounded-full bg-rose-500/20 blur-3xl" />
      <div className="absolute -bottom-40 -right-24 h-[28rem] w-[28rem] rounded-full bg-orange-400/10 blur-3xl" />

      <div className="relative flex h-full flex-col p-10 xl:p-14">
        <div className="flex items-center gap-3 text-xl font-semibold tracking-tight">
          <span className="grid h-10 w-10 place-items-center rounded-2xl bg-white/10 ring-1 ring-white/15">
            <FiInstagram size={21} />
          </span>
          Instagram
        </div>

        <div className="my-auto max-w-lg py-10">
          <h2 className="text-4xl font-semibold leading-[1.1] tracking-tight xl:text-5xl">
            Har bir lahzani baham ko'ring.
          </h2>
          <p className="mt-4 max-w-sm text-[15px] leading-relaxed text-neutral-content/65">
            Surat va videolaringizni yuklang, do'stlaringiz bilan ulashing va yangiliklardan xabardor bo'ling.
          </p>
          <div className="relative mt-8 h-52 overflow-hidden rounded-3xl bg-white/5 ring-1 ring-white/10 xl:h-64">
            <img
              className="h-full w-full object-cover"
              src="https://picsum.photos/seed/nf2956-moments/900/600"
              alt=""
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent" />
          </div>
        </div>

        <p className="text-xs text-neutral-content/45">nf-2956 · o'quv loyihasi</p>
      </div>
    </section>

    <section className="flex items-center justify-center px-5 py-10 sm:px-10">
      <div className="w-full max-w-[400px] auth-in">
        <div className="mb-6 flex items-center justify-center gap-2 text-xl font-semibold tracking-tight lg:hidden">
          <span className="grid h-9 w-9 place-items-center rounded-xl bg-primary text-primary-content">
            <FiInstagram size={20} />
          </span>
          Instagram
        </div>

        <div className="card border border-base-300 bg-base-100 shadow-xl">
          <div className="card-body p-7 sm:p-8">
            <Outlet />
          </div>
        </div>
      </div>
    </section>
  </div>
);

export default AuthLayout;
