import { useState } from 'react';
import { FaBookmark, FaHeart } from 'react-icons/fa';
import { FiBookmark, FiHeart, FiMessageCircle, FiMoreHorizontal, FiSend } from 'react-icons/fi';
import { MdVerified } from 'react-icons/md';

const PostCard = ({ post }) => {
  const [liked, setLiked] = useState(false);
  const [saved, setSaved] = useState(false);
  const [comments, setComments] = useState(post.comments);
  const [text, setText] = useState('');

  const likes = post.likes + (liked ? 1 : 0);

  const handleComment = (event) => {
    event.preventDefault();
    if (!text.trim()) return;
    setComments([...comments, { id: Date.now(), username: 'siz', text: text.trim() }]);
    setText('');
  };

  return (
    <article className="border-b border-base-300 pb-4">
      <header className="flex items-center gap-3 px-4 py-3">
        <img src={post.user.avatar} alt={post.user.username} className="h-8 w-8 rounded-full object-cover" />
        <div className="min-w-0 flex-1 text-sm">
          <p className="flex items-center gap-1 font-semibold">
            {post.user.username}
            {post.user.verified && <MdVerified className="text-info" />}
            <span className="font-normal text-base-content/50">• {post.createdAt}</span>
          </p>
          {post.location && <p className="text-xs text-base-content/60">{post.location}</p>}
        </div>
        <button type="button" className="btn btn-ghost btn-circle btn-sm" aria-label="Ko'proq">
          <FiMoreHorizontal size={18} />
        </button>
      </header>

      {/* Double click on the image likes the post, like in Instagram */}
      <img
        src={post.image}
        alt={post.caption}
        className="aspect-square w-full select-none bg-base-200 object-cover sm:rounded-md"
        onDoubleClick={() => setLiked(true)}
      />

      <div className="flex items-center gap-4 px-4 pt-3">
        <button type="button" aria-label="Like" onClick={() => setLiked(!liked)}>
          {liked ? <FaHeart size={24} className="text-error" /> : <FiHeart size={24} />}
        </button>
        <FiMessageCircle size={24} />
        <FiSend size={22} />
        <button type="button" aria-label="Saqlash" className="ml-auto" onClick={() => setSaved(!saved)}>
          {saved ? <FaBookmark size={22} /> : <FiBookmark size={22} />}
        </button>
      </div>

      <div className="space-y-1 px-4 pt-2 text-sm">
        <p className="font-semibold">{likes.toLocaleString('en-US')} ta like</p>
        <p>
          <span className="mr-1 font-semibold">{post.user.username}</span>
          {post.caption}
        </p>
        {comments.map((comment) => (
          <p key={comment.id}>
            <span className="mr-1 font-semibold">{comment.username}</span>
            {comment.text}
          </p>
        ))}
      </div>

      <form onSubmit={handleComment} className="flex items-center gap-2 px-4 pt-2">
        <input
          value={text}
          onChange={(event) => setText(event.target.value)}
          placeholder="Izoh qoldiring..."
          className="flex-1 bg-transparent text-sm outline-none"
        />
        {text.trim() && (
          <button type="submit" className="text-sm font-semibold text-info">
            Joylash
          </button>
        )}
      </form>
    </article>
  );
};

export default PostCard;
