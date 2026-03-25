import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import {
    getPosts, getNotes,
    createNote, deleteNote,
    toggleLikePost, toggleLikeNote
} from '../utils/storage'
import PostCard from '../components/PostCard'
import PostGrid from '../components/PostGrid'
import NoteCard from '../components/NoteCard'
import HeroPost from '../components/HeroPost'
import {
    TopPostsWidget,
    TopWritersWidget,
    SubscribeWidget,
    TrendingTagsWidget
} from '../components/Sidebar'
import './Home.css'

const ALL = 'All'

export default function Home() {
    const { currentUser } = useAuth()
    const [posts, setPosts] = useState([])
    const [notes, setNotes] = useState([])
    const [tab, setTab] = useState('posts')
    const [viewMode, setViewMode] = useState('list') // 'list' | 'grid'
    const [search, setSearch] = useState('')
    const [activeTag, setActiveTag] = useState(ALL)
    const [noteText, setNoteText] = useState('')
    const [sortBy, setSortBy] = useState('latest') // 'latest' | 'top'

    useEffect(() => { refresh() }, [])

    function refresh() {
        setPosts(getPosts().filter(p => !p.isDraft))
        setNotes(getNotes())
    }

    const heroPost = posts[0] || null

    const filtered = posts
        .filter(p => {
            const q = search.toLowerCase()
            return p.title.toLowerCase().includes(q) || p.content.toLowerCase().includes(q)
        })
        .filter(p => activeTag === ALL || p.tags?.includes(activeTag))
        .sort((a, b) =>
            sortBy === 'top'
                ? (b.likes || 0) - (a.likes || 0)
                : new Date(b.createdAt) - new Date(a.createdAt)
        )

    // For list view, skip the hero post (already shown above)
    const listPosts = search || activeTag !== ALL ? filtered : filtered.slice(1)

    const filteredNotes = notes
        .filter(n => n.content.toLowerCase().includes(search.toLowerCase()))
        .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))

    function handleLikePost(postId) {
        if (!currentUser) return
        toggleLikePost(postId, currentUser.id)
        refresh()
    }

    function handleLikeNote(noteId) {
        if (!currentUser) return
        toggleLikeNote(noteId, currentUser.id)
        refresh()
    }

    function handleDeleteNote(noteId) {
        deleteNote(noteId)
        refresh()
    }

    function handlePostNote(e) {
        e.preventDefault()
        if (!noteText.trim()) return
        createNote({ content: noteText.trim(), authorId: currentUser.id })
        setNoteText('')
        refresh()
    }

    function handleTagClick(tag) {
        setActiveTag(prev => prev === tag ? ALL : tag)
        setTab('posts')
    }

    return (
        <div className="home-page">
            <div className="home-layout">

                {/* ── Main column ── */}
                <main className="home-main">

                    {/* Search bar */}
                    <div className="home-search">
                        <span className="search-icon">⌕</span>
                        <input
                            type="text"
                            placeholder="Search articles, notes, topics…"
                            value={search}
                            onChange={e => setSearch(e.target.value)}
                            className="search-input"
                        />
                        {search && (
                            <button className="search-clear" onClick={() => setSearch('')}>×</button>
                        )}
                    </div>

                    {/* Tabs + controls */}
                    <div className="home-controls">
                        <div className="home-tabs">
                            <button
                                className={`home-tab ${tab === 'posts' ? 'active' : ''}`}
                                onClick={() => setTab('posts')}
                            >
                                Articles
                            </button>
                            <button
                                className={`home-tab ${tab === 'notes' ? 'active' : ''}`}
                                onClick={() => setTab('notes')}
                            >
                                Notes
                            </button>
                        </div>

                        {tab === 'posts' && (
                            <div className="home-controls-right">
                                <select
                                    className="sort-select"
                                    value={sortBy}
                                    onChange={e => setSortBy(e.target.value)}
                                >
                                    <option value="latest">Latest</option>
                                    <option value="top">Top</option>
                                </select>
                                <div className="view-toggle">
                                    <button
                                        className={`view-btn ${viewMode === 'list' ? 'active' : ''}`}
                                        onClick={() => setViewMode('list')}
                                        title="List view"
                                    >☰</button>
                                    <button
                                        className={`view-btn ${viewMode === 'grid' ? 'active' : ''}`}
                                        onClick={() => setViewMode('grid')}
                                        title="Grid view"
                                    >⊞</button>
                                </div>
                            </div>
                        )}
                    </div>

                    {/* Active tag pill */}
                    {activeTag !== ALL && (
                        <div className="active-tag-bar">
                            <span>Filtered by:</span>
                            <span className="tag active">{activeTag}</span>
                            <button className="btn btn-ghost btn-sm" onClick={() => setActiveTag(ALL)}>
                                Clear ×
                            </button>
                        </div>
                    )}

                    {/* POSTS TAB */}
                    {tab === 'posts' && (
                        <>
                            {/* Hero post — only show when no filter active */}
                            {!search && activeTag === ALL && heroPost && viewMode === 'list' && (
                                <HeroPost
                                    post={heroPost}
                                    onLike={handleLikePost}
                                    isLiked={heroPost.likedBy?.includes(currentUser?.id)}
                                />
                            )}

                            {filtered.length === 0 ? (
                                <div className="empty-state">
                                    <h3>{search ? 'No results found' : 'No articles yet'}</h3>
                                    <p>
                                        {currentUser
                                            ? <Link to="/write" className="accent-link">Write your first article →</Link>
                                            : <Link to="/signup" className="accent-link">Sign up to start publishing →</Link>}
                                    </p>
                                </div>
                            ) : viewMode === 'grid' ? (
                                <PostGrid
                                    posts={filtered}
                                    onLike={handleLikePost}
                                    currentUserId={currentUser?.id}
                                />
                            ) : (
                                listPosts.map(post => (
                                    <PostCard
                                        key={post.id}
                                        post={post}
                                        onLike={handleLikePost}
                                        isLiked={post.likedBy?.includes(currentUser?.id)}
                                    />
                                ))
                            )}
                        </>
                    )}

                    {/* NOTES TAB */}
                    {tab === 'notes' && (
                        <>
                            {currentUser && (
                                <form className="note-compose" onSubmit={handlePostNote}>
                                    <div className="note-compose-header">
                                        <span className="author-avatar-sm">
                                            {currentUser.name.charAt(0).toUpperCase()}
                                        </span>
                                        <span className="note-compose-label">What's on your mind?</span>
                                    </div>
                                    <textarea
                                        value={noteText}
                                        onChange={e => setNoteText(e.target.value)}
                                        placeholder="Share a quick thought, quote, or idea…"
                                        rows={3}
                                        className="note-textarea"
                                        maxLength={500}
                                    />
                                    <div className="note-compose-footer">
                                        <span className={`char-count ${noteText.length > 450 ? 'warn' : ''}`}>
                                            {noteText.length}/500
                                        </span>
                                        <button
                                            type="submit"
                                            className="btn btn-accent btn-sm"
                                            disabled={!noteText.trim()}
                                        >
                                            Post note
                                        </button>
                                    </div>
                                </form>
                            )}

                            {filteredNotes.length === 0 ? (
                                <div className="empty-state">
                                    <h3>No notes yet</h3>
                                    <p>Notes are short thoughts — quick, casual, unfiltered.</p>
                                </div>
                            ) : (
                                filteredNotes.map(note => (
                                    <NoteCard
                                        key={note.id}
                                        note={note}
                                        onLike={handleLikeNote}
                                        isLiked={note.likedBy?.includes(currentUser?.id)}
                                        onDelete={handleDeleteNote}
                                        currentUserId={currentUser?.id}
                                    />
                                ))
                            )}
                        </>
                    )}
                </main>

                {/* ── Sidebar ── */}
                <aside className="home-sidebar">
                    <SubscribeWidget />
                    <TrendingTagsWidget
                        posts={posts}
                        activeTag={activeTag}
                        onTagClick={handleTagClick}
                    />
                    <TopPostsWidget posts={posts} />
                    <TopWritersWidget posts={posts} />
                </aside>

            </div>
        </div>
    )
}