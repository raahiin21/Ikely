import { useState, useEffect } from 'react'
import { useParams, useNavigate, Link } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import {
    getPostById, deletePost,
    getCommentsByPostId, createComment, deleteComment,
    toggleLikePost, getUserById,
    isSubscribed, toggleSubscription, getSubscriberCount
} from '../utils/storage'
import { getReadingTime, formatDate } from '../utils/readingTime'
import './PostDetail.css'

export default function PostDetail() {
    const { id } = useParams()
    const { currentUser } = useAuth()
    const navigate = useNavigate()

    const [post, setPost] = useState(null)
    const [comments, setComments] = useState([])
    const [commentText, setCommentText] = useState('')
    const [subscribed, setSubscribed] = useState(false)
    const [subCount, setSubCount] = useState(0)

    useEffect(() => {
        const p = getPostById(id)
        if (!p) return navigate('/')
        setPost(p)
        setComments(getCommentsByPostId(id))
        if (currentUser) {
            setSubscribed(isSubscribed(currentUser.id, p.authorId))
        }
        setSubCount(getSubscriberCount(p.authorId))
    }, [id])

    if (!post) return null

    const author = getUserById(post.authorId)
    const isOwner = currentUser?.id === post.authorId
    const isLiked = post.likedBy?.includes(currentUser?.id)

    function handleLike() {
        if (!currentUser) return navigate('/login')
        const updated = toggleLikePost(post.id, currentUser.id)
        setPost(prev => ({ ...prev, ...updated }))
    }

    function handleDelete() {
        if (!window.confirm('Delete this post?')) return
        deletePost(post.id)
        navigate('/')
    }

    function handleComment(e) {
        e.preventDefault()
        if (!currentUser) return navigate('/login')
        if (!commentText.trim()) return
        createComment({ postId: post.id, userId: currentUser.id, text: commentText.trim() })
        setComments(getCommentsByPostId(post.id))
        setCommentText('')
    }

    function handleDeleteComment(commentId) {
        deleteComment(commentId)
        setComments(getCommentsByPostId(post.id))
    }

    function handleSubscribe() {
        if (!currentUser) return navigate('/login')
        const nowSubscribed = toggleSubscription(currentUser.id, post.authorId)
        setSubscribed(nowSubscribed)
        setSubCount(getSubscriberCount(post.authorId))
    }

    return (
        <div className="page">
            <article className="post-detail">

                {/* Tags */}
                {post.tags?.length > 0 && (
                    <div className="detail-tags">
                        {post.tags.map(tag => <span key={tag} className="tag">{tag}</span>)}
                    </div>
                )}

                {/* Title */}
                <h1 className="detail-title">{post.title}</h1>

                {/* Author row */}
                <div className="detail-author-row">
                    <Link to={`/profile/${post.authorId}`} className="detail-author">
                        <span className="author-avatar-lg">
                            {author?.name?.charAt(0).toUpperCase() || '?'}
                        </span>
                        <div>
                            <div className="detail-author-name">{author?.name}</div>
                            <div className="detail-author-meta">
                                {formatDate(post.createdAt)} · {getReadingTime(post.content)}
                            </div>
                        </div>
                    </Link>
                    <div className="detail-author-actions">
                        {!isOwner && (
                            <button
                                className={`btn ${subscribed ? 'btn-outline' : 'btn-accent'}`}
                                onClick={handleSubscribe}
                            >
                                {subscribed ? 'Subscribed' : 'Subscribe'}
                            </button>
                        )}
                        {isOwner && (
                            <>
                                <Link to={`/write?edit=${post.id}`} className="btn btn-outline">Edit</Link>
                                <button className="btn btn-danger" onClick={handleDelete}>Delete</button>
                            </>
                        )}
                    </div>
                </div>

                <hr className="divider" />

                {/* Body */}
                <div className="detail-body">
                    {post.content.split('\n').map((para, i) => (
                        para.trim() ? <p key={i}>{para}</p> : <br key={i} />
                    ))}
                </div>

                {/* Like row */}
                <div className="detail-like-row">
                    <button
                        className={`like-btn-lg ${isLiked ? 'liked' : ''}`}
                        onClick={handleLike}
                    >
                        ♥ {post.likes || 0} {post.likes === 1 ? 'like' : 'likes'}
                    </button>
                    <span className="sub-count">{subCount} {subCount === 1 ? 'subscriber' : 'subscribers'}</span>
                </div>

                <hr className="divider" />

                {/* Subscribe CTA */}
                {!isOwner && (
                    <div className="subscribe-cta">
                        <h3>Enjoy this post?</h3>
                        <p>Subscribe to {author?.name} for more.</p>
                        <div className="subscribe-row">
                            <input type="email" placeholder="your@email.com" className="subscribe-input" />
                            <button className="btn btn-accent" onClick={handleSubscribe}>
                                {subscribed ? '✓ Subscribed' : 'Subscribe'}
                            </button>
                        </div>
                    </div>
                )}

                {/* Comments */}
                <div className="comments-section">
                    <h3 className="comments-heading">{comments.length} {comments.length === 1 ? 'comment' : 'comments'}</h3>

                    {currentUser ? (
                        <form className="comment-form" onSubmit={handleComment}>
                            <textarea
                                value={commentText}
                                onChange={e => setCommentText(e.target.value)}
                                placeholder="Add a comment…"
                                rows={3}
                                className="note-textarea"
                                style={{ border: '1px solid var(--color-border)', borderRadius: '8px', padding: '12px' }}
                            />
                            <button type="submit" className="btn btn-accent" disabled={!commentText.trim()}>
                                Post comment
                            </button>
                        </form>
                    ) : (
                        <p className="comments-login">
                            <Link to="/login" className="accent-link">Sign in</Link> to leave a comment.
                        </p>
                    )}

                    <div className="comments-list">
                        {comments.map(comment => {
                            const commenter = getUserById(comment.userId)
                            const isCommentOwner = currentUser?.id === comment.userId
                            return (
                                <div key={comment.id} className="comment">
                                    <div className="comment-header">
                                        <Link to={`/profile/${comment.userId}`} className="comment-author">
                                            <span className="author-avatar-sm">
                                                {commenter?.name?.charAt(0).toUpperCase() || '?'}
                                            </span>
                                            <span>{commenter?.name}</span>
                                        </Link>
                                        <span className="post-card-date">{formatDate(comment.createdAt)}</span>
                                    </div>
                                    <p className="comment-text">{comment.text}</p>
                                    {isCommentOwner && (
                                        <button
                                            className="btn btn-danger"
                                            style={{ fontSize: '0.78rem', padding: '3px 10px' }}
                                            onClick={() => handleDeleteComment(comment.id)}
                                        >
                                            Delete
                                        </button>
                                    )}
                                </div>
                            )
                        })}
                    </div>
                </div>

            </article>
        </div>
    )
}