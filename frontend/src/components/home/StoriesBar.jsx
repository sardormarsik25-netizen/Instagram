const StoriesBar = ({ stories }) => (
  <div className="flex gap-4 overflow-x-auto px-4 py-4 [scrollbar-width:none]">
    {stories.map((story) => (
      <button key={story.id} type="button" className="flex w-16 shrink-0 flex-col items-center gap-1">
        <span
          className={`rounded-full p-[2px] ${
            story.seen ? 'bg-base-300' : 'bg-gradient-to-tr from-amber-400 via-secondary to-purple-600'
          }`}
        >
          <img
            src={story.avatar}
            alt={story.username}
            className="h-14 w-14 rounded-full border-2 border-base-100 object-cover"
          />
        </span>
        <span className="w-full truncate text-center text-xs">{story.username}</span>
      </button>
    ))}
  </div>
);

export default StoriesBar;
