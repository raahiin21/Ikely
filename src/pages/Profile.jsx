import { useState, useEffect } from 'react'
import { useParams, Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import {
    getUserById, getPosts, getNotes,
    isSubscribed, toggleSubscription, getSubscriberCount, deletePost
} from '../utils/storage'
import { formatDate } from '../utils/readingTime'
import PostCard from '../components/PostCard'
import './Profile.css'

export default function Profile() {
    const { id } = useParams()
    const { currentUser } = useAuth()
    const navigate = useNavigate()

    const [profileUser, setProfileUser] = useState(null)
    const [posts, setPosts] = useState([])
    const [drafts, setDrafts] = useState([])
    const [notes, setNotes] = useState([])
    const [tab, setTab] = useState('posts')
    const [subscribed, setSubscribed] = useState(false)
    const [subCount, setSubCount] = useState(0)

    const isOwner = currentUser?.id === id

    useEffect(() => {
        const user = getUserById(id)
        if (!user) return navigate('/')
        setProfileUser(user)

        const allPosts = getPosts().filter(p => p.authorId === id)
        setPosts(allPosts.filter(p => !p.isDraft))
        setDrafts(allPosts.filter(p => p.isDraft))
        setNotes(getNotes().filter(n => n.authorId === id))

        if (currentUser && currentUser.id !== id) {
            setSubscribed(isSubscribed(currentUser.id, id))
        }
        setSubCount(getSubscriberCount(id))
    }, [id, currentUser])

    if (!profileUser) return null

    function handleSubscribe() {
        if (!currentUser) return navigate('/login')
        const nowSubscribed = toggleSubscription(currentUser.id, id)
        setSubscribed(nowSubscribed)
        setSubCount(getSubscriberCount(id))
    }

    function handleDeletePost(postId) {
        if (!window.confirm('Delete this post?')) return
        deletePost(postId)
        const allPosts = getPosts().filter(p => p.authorId === id)
        setPosts(allPosts.filter(p => !p.isDraft))
        setDrafts(allPosts.filter(p => p.isDraft))
    }

    return (
        <div className="page">
            <div className="page-inner">

                {/* Profile header */}
                <div className="profile-header">
                    <div className="profile-avatar">
                        {profileUser.name.charAt(0).toUpperCase()}
                    </div>
                    <div className="profile-info">
                        <h1 className="profile-name">{profileUser.name}</h1>
                        <p className="profile-email">{profileUser.email}</p>
                        <p className="profile-stats">
                            {posts.length} {posts.length === 1 ? 'article' : 'articles'} · {subCount} {subCount === 1 ? 'subscriber' : 'subscribers'}
                        </p>
                    </div>
                    <div className="profile-actions">
                        {isOwner ? (
                            <Link to="/write" className="btn btn-accent">Write new post</Link>
                        ) : (
                            <button
                                className={`btn ${subscribed ? 'btn-outline' : 'btn-accent'}`}
                                onClick={handleSubscribe}
                            >
                                {subscribed ? 'Subscribed ✓' : 'Subscribe'}
                            </button>
                        )}
                    </div>
                </div>

                <hr className="divider" />

                {/* Tabs */}
                <div className="home-tabs">
                    <button className={`home-tab ${tab === 'posts' ? 'active' : ''}`} onClick={() => setTab('posts')}>
                        Articles ({posts.length})
                    </button>
                    <button className={`home-tab ${tab === 'notes' ? 'active' : ''}`} onClick={() => setTab('notes')}>
                        Notes ({notes.length})
                    </button>
                    {isOwner && (
                        <button className={`home-tab ${tab === 'drafts' ? 'active' : ''}`} onClick={() => setTab('drafts')}>
                            Drafts ({drafts.length})
                        </button>
                    )}
                </div>

                {/* Articles */}
                {tab === 'posts' && (
                    posts.length === 0
                        ? <div className="empty-state"><h3>No articles yet</h3></div>
                        : posts.map(post => (
                            <div key={post.id} className="profile-post-row">
                                <PostCard post={post} />
                                {isOwner && (
                                    <div className="profile-post-actions">
                                        <Link to={`/write?edit=${post.id}`} className="btn btn-outline">Edit</Link>
                                        <button className="btn btn-danger" onClick={() => handleDeletePost(post.id)}>Delete</button>
                                    </div>
                                )}
                            </div>
                        ))
                )}

                {/* Notes */}
                {tab === 'notes' && (
                    notes.length === 0
                        ? <div className="empty-state"><h3>No notes yet</h3></div>
                        : notes.map(note => (
                            <div key={note.id} className="note-card" style={{ marginBottom: '16px' }}>
                                <p className="note-content">{note.content}</p>
                                <span className="note-date">{formatDate(note.createdAt)}</span>
                            </div>
                        ))
                )}

                {/* Drafts (owner only) */}
                {tab === 'drafts' && isOwner && (
                    drafts.length === 0
                        ? <div className="empty-state"><h3>No drafts</h3></div>
                        : drafts.map(post => (
                            <div key={post.id} className="draft-row">
                                <div>
                                    <p className="draft-title">{post.title || 'Untitled draft'}</p>
                                    <p className="draft-date">{formatDate(post.createdAt)}</p>
                                </div>
                                <div className="profile-post-actions">
                                    <Link to={`/write?edit=${post.id}`} className="btn btn-outline">Continue editing</Link>
                                    <button className="btn btn-danger" onClick={() => handleDeletePost(post.id)}>Delete</button>
                                </div>
                            </div>
                        ))
                )}

            </div>
        </div>
    )
}