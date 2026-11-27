import { useSelector } from 'react-redux';
import PostCard from '../components/home/PostCard';
import StoriesBar from '../components/home/StoriesBar';
import { posts, stories, suggestions } from '../data/homeFeed';

const Home = () => {
  const user = useSelector((state) => state.auth.user);
  const username = user?.username || user?.email?.split('@')[0] || 'siz';

  return (
    <div data-page="home" className="flex justify-center gap-8 lg:py-6">
      <section className="w-full max-w-[470px]">
        <StoriesBar stories={stories} />
        <div className="flex flex-col gap-4">
          {posts.map((post) => (
            <PostCard key={post.id} post={post} />
          ))}
        </div>
      </section>

      {/* Right column: only on large screens */}
      <aside className="hidden w-64 shrink-0 pt-6 lg:block">
        <div className="mb-6 flex items-center gap-3">
          <div className="flex h-11 w-11 items-center justify-center rounded-full bg-base-300 font-semibold uppercase">
            {username[0]}
          </div>
          <p className="text-sm font-semibold">{username}</p>
        </div>

        <p className="mb-3 text-sm font-semibold text-base-content/60">Siz uchun tavsiyalar</p>
        <ul className="flex flex-col gap-3">
          {suggestions.map((item) => (
            <li key={item.id} className="flex items-center gap-3">
              <img src={item.avatar} alt={item.username} className="h-8 w-8 rounded-full object-cover" />
              <div className="min-w-0 flex-1 text-sm">
                <p className="font-semibold">{item.username}</p>
                <p className="truncate text-xs text-base-content/60">{item.reason}</p>
              </div>
              <button type="button" className="text-xs font-semibold text-info">
                Kuzatish
              </button>
            </li>
          ))}
        </ul>
      </aside>
    </div>
  );
};

export default Home;
