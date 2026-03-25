import { Link } from 'react-router-dom'
import { getUserById } from '../utils/storage'
import { getReadingTime, formatDate } from '../utils/readingTime'
import './PostGrid.css'

export default function PostGrid({ posts, onLike, currentUserId }) {
    if (!posts.length) return null

    return (
        <div className="post-grid">
            {posts.map(post => {
                const author = getUserById(post.authorId)
                const isLiked = post.likedBy?.includes(currentUserId)
                const excerpt = post.content.replace(/<[^>]+>/g, '').slice(0, 110)

                return (
                    <article key={post.id} className="grid-card">
                        <div className="grid-card-color-bar" />
                        <div className="grid-card-body">
                            <div className="grid-card-meta">
                                <Link to={`/profile/${post.authorId}`} className="grid-author">
                                    <span className="author-avatar-sm">
                                        {author?.name?.charAt(0).toUpperCase() || '?'}
                                    </span>
                                    <span>{author?.name}</span>
                                </Link>
                                <span className="grid-reading-time">{getReadingTime(post.content)}</span>
                            </div>

                            <Link to={`/post/${post.id}`} className="grid-card-link">
                                <h3 className="grid-card-title">{post.title}</h3>
                                <p className="grid-card-excerpt">{excerpt}{post.content.length > 110 ? '…' : ''}</p>
                            </Link>

                            <div className="grid-card-footer">
                                <div className="grid-tags">
                                    {post.tags?.slice(0, 2).map(tag => (
                                        <span key={tag} className="tag" style={{ fontSize: '0.72rem', padding: '2px 8px' }}>{tag}</span>
                                    ))}
                                </div>
                                <button
                                    className={`like-btn ${isLiked ? 'liked' : ''}`}
                                    onClick={() => onLike?.(post.id)}
                                >
                                    ♥ {post.likes || 0}
                                </button>
                            </div>
                        </div>
                    </article>
                )
            })}
        </div>
    )
}