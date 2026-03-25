import { Link } from 'react-router-dom'
import { getUserById } from '../utils/storage'
import { getReadingTime, formatDate } from '../utils/readingTime'
import './HeroPost.css'

export default function HeroPost({ post, onLike, isLiked }) {
    if (!post) return null
    const author = getUserById(post.authorId)

    return (
        <div className="hero-post">
            <div className="hero-post-inner">
                <div className="hero-meta">
                    <Link to={`/profile/${post.authorId}`} className="hero-author">
                        <span className="author-avatar-md">
                            {author?.name?.charAt(0).toUpperCase() || '?'}
                        </span>
                        <div>
                            <span className="hero-author-name">{author?.name}</span>
                            <span className="hero-author-sub">
                                {formatDate(post.createdAt)} · {getReadingTime(post.content)}
                            </span>
                        </div>
                    </Link>
                    <span className="hero-badge">Featured</span>
                </div>

                <Link to={`/post/${post.id}`} className="hero-link">
                    <h1 className="hero-title">{post.title}</h1>
                    <p className="hero-excerpt">
                        {post.content.replace(/<[^>]+>/g, '').slice(0, 220)}
                        {post.content.length > 220 ? '…' : ''}
                    </p>
                </Link>

                <div className="hero-footer">
                    <div className="hero-tags">
                        {post.tags?.slice(0, 3).map(tag => (
                            <span key={tag} className="tag">{tag}</span>
                        ))}
                    </div>
                    <div className="hero-actions">
                        <button
                            className={`like-btn ${isLiked ? 'liked' : ''}`}
                            onClick={() => onLike?.(post.id)}
                        >
                            ♥ {post.likes || 0}
                        </button>
                        <Link to={`/post/${post.id}`} className="btn btn-accent btn-sm">
                            Read →
                        </Link>
                    </div>
                </div>
            </div>
        </div>
    )
}