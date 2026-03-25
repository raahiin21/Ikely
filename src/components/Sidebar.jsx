import { Link } from 'react-router-dom'
import { getUserById, getSubscriberCount } from '../utils/storage'
import { getReadingTime, formatDate } from '../utils/readingTime'
import './Sidebar.css'

// Top posts widget
export function TopPostsWidget({ posts }) {
    const top = [...posts]
        .sort((a, b) => (b.likes || 0) - (a.likes || 0))
        .slice(0, 5)

    if (!top.length) return null

    return (
        <div className="sidebar-widget">
            <h3 className="sidebar-widget-title">Top posts</h3>
            <div className="top-posts-list">
                {top.map((post, i) => (
                    <Link key={post.id} to={`/post/${post.id}`} className="top-post-item">
                        <span className="top-post-rank">{i + 1}</span>
                        <div className="top-post-info">
                            <p className="top-post-title">{post.title}</p>
                            <span className="top-post-meta">
                                {post.likes || 0} likes · {getReadingTime(post.content)}
                            </span>
                        </div>
                    </Link>
                ))}
            </div>
        </div>
    )
}

// Top writers widget
export function TopWritersWidget({ posts }) {
    // Count posts and likes per author
    const authorMap = {}
    posts.forEach(p => {
        if (!authorMap[p.authorId]) {
            authorMap[p.authorId] = { postCount: 0, totalLikes: 0 }
        }
        authorMap[p.authorId].postCount++
        authorMap[p.authorId].totalLikes += p.likes || 0
    })

    const authors = Object.entries(authorMap)
        .map(([id, stats]) => ({ ...stats, user: getUserById(id), id }))
        .filter(a => a.user)
        .sort((a, b) => b.totalLikes - a.totalLikes)
        .slice(0, 5)

    if (!authors.length) return null

    return (
        <div className="sidebar-widget">
            <h3 className="sidebar-widget-title">Top writers</h3>
            {authors.map((a, i) => (
                <Link key={a.id} to={`/profile/${a.id}`} className="writer-item">
                    <span className="author-avatar-sm">
                        {a.user.name.charAt(0).toUpperCase()}
                    </span>
                    <div className="writer-info">
                        <span className="writer-name">{a.user.name}</span>
                        <span className="writer-meta">
                            {a.postCount} {a.postCount === 1 ? 'post' : 'posts'} · {a.totalLikes} likes
                        </span>
                    </div>
                    {i === 0 && <span className="writer-crown">★</span>}
                </Link>
            ))}
        </div>
    )
}

// Subscribe CTA widget
export function SubscribeWidget() {
    return (
        <div className="sidebar-widget subscribe-widget">
            <h3 className="sidebar-widget-title">Stay in the loop</h3>
            <p className="subscribe-widget-text">
                Get the best posts delivered to your inbox.
            </p>
            <input
                type="email"
                placeholder="your@email.com"
                className="input"
                style={{ marginBottom: '10px', fontSize: '0.875rem' }}
            />
            <button className="btn btn-accent" style={{ width: '100%', justifyContent: 'center' }}>
                Subscribe free
            </button>
        </div>
    )
}

// Trending tags widget
export function TrendingTagsWidget({ posts, activeTag, onTagClick }) {
    const tagCount = {}
    posts.forEach(p => p.tags?.forEach(t => {
        tagCount[t] = (tagCount[t] || 0) + 1
    }))

    const tags = Object.entries(tagCount)
        .sort((a, b) => b[1] - a[1])
        .slice(0, 10)

    if (!tags.length) return null

    return (
        <div className="sidebar-widget">
            <h3 className="sidebar-widget-title">Trending topics</h3>
            <div className="trending-tags">
                {tags.map(([tag, count]) => (
                    <button
                        key={tag}
                        className={`tag ${activeTag === tag ? 'active' : ''}`}
                        onClick={() => onTagClick(tag)}
                    >
                        {tag}
                        <span className="tag-count">{count}</span>
                    </button>
                ))}
            </div>
        </div>
    )
}