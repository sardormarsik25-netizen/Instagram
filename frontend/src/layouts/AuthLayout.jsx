import { Outlet } from 'react-router-dom';

const slides = ['nf2956-a', 'nf2956-b', 'nf2956-c'];

const AuthLayout = () => (
  <div className="hero min-h-[100dvh] bg-base-200 text-base-content">
    <div className="hero-content w-full max-w-4xl gap-16 px-4 py-10">
      {/* Phone mockup: only on large screens */}
      <div className="hidden lg:block">
        <div className="mockup-phone border-base-content/20">
          <div className="camera" />
          <div className="display">
            <div className="artboard artboard-demo phone-1 overflow-hidden">
              <div className="carousel carousel-vertical h-full w-full">
                {slides.map((seed) => (
                  <div key={seed} className="carousel-item h-full">
                    <img src={`https://picsum.photos/seed/${seed}/320/570`} alt="" className="h-full w-full object-cover" />
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="auth-in flex w-full max-w-sm flex-col gap-3">
        <Outlet />
        <p className="pt-2 text-center text-xs text-base-content/50">nf-2956 · o'quv loyihasi</p>
      </div>
    </div>
  </div>
);

export default AuthLayout;
