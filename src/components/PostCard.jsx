import { Link } from 'react-router-dom'
import { getUserById } from '../utils/storage'
import { getReadingTime, formatDate } from '../utils/readingTime'
import './PostCard.css'

export default function PostCard({ post, onLike, isLiked }) {
    const author = getUserById(post.authorId)

    return (
        <article className="post-card">
            <div className="post-card-meta">
                <Link to={`/profile/${post.authorId}`} className="post-card-author">
                    <span className="author-avatar-sm">
                        {author?.name?.charAt(0).toUpperCase() || '?'}
                    </span>
                    <span>{author?.name || 'Unknown'}</span>
                </Link>
                <span className="post-card-dot">·</span>
                <span className="post-card-date">{formatDate(post.createdAt)}</span>
                <span className="post-card-dot">·</span>
                <span className="post-card-date">{getReadingTime(post.content)}</span>
            </div>

            <Link to={`/post/${post.id}`} className="post-card-link">
                <h2 className="post-card-title">{post.title}</h2>
                <p className="post-card-excerpt">
                    {post.content.replace(/<[^>]+>/g, '').slice(0, 160)}
                    {post.content.length > 160 ? '…' : ''}
                </p>
            </Link>

            <div className="post-card-footer">
                <div className="post-card-tags">
                    {post.tags?.map(tag => (
                        <span key={tag} className="tag">{tag}</span>
                    ))}
                </div>
                <button
                    className={`like-btn ${isLiked ? 'liked' : ''}`}
                    onClick={() => onLike?.(post.id)}
                >
                    ♥ {post.likes || 0}
                </button>
            </div>
        </article>
    )
}