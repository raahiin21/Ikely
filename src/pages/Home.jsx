import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import {
    getPosts, getNotes,
    createNote, deleteNote,
    toggleLikePost, toggleLikeNote
} from '../utils/storage'
import PostCard from '../components/PostCard'
import NoteCard from '../components/NoteCard'
import './Home.css'

const ALL_TAGS = 'All'

export default function Home() {
    const { currentUser } = useAuth()
    const [posts, setPosts] = useState([])
    const [notes, setNotes] = useState([])
    const [tab, setTab] = useState('posts')
    const [search, setSearch] = useState('')
    const [activeTag, setActiveTag] = useState(ALL_TAGS)
    const [noteText, setNoteText] = useState('')

    useEffect(() => { refresh() }, [])

    function refresh() {
        setPosts(getPosts().filter(p => !p.isDraft))
        setNotes(getNotes())
    }

    // Collect all unique tags from published posts
    const allTags = [ALL_TAGS, ...new Set(posts.flatMap(p => p.tags || []))]

    const filteredPosts = posts
        .filter(p => {
            const q = search.toLowerCase()
            return p.title.toLowerCase().includes(q) || p.content.toLowerCase().includes(q)
        })
        .filter(p => activeTag === ALL_TAGS || p.tags?.includes(activeTag))

    const filteredNotes = notes.filter(n =>
        n.content.toLowerCase().includes(search.toLowerCase())
    )

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

    return (
        <div className="page">
            <div className="page-inner">

                {/* Search */}
                <div className="home-search">
                    <input
                        type="text"
                        placeholder="Search posts and notes…"
                        value={search}
                        onChange={e => setSearch(e.target.value)}
                        className="search-input"
                    />
                </div>

                {/* Tabs */}
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

                {/* Posts tab */}
                {tab === 'posts' && (
                    <>
                        {allTags.length > 1 && (
                            <div className="tag-filter">
                                {allTags.map(tag => (
                                    <button
                                        key={tag}
                                        className={`tag ${activeTag === tag ? 'active' : ''}`}
                                        onClick={() => setActiveTag(tag)}
                                    >
                                        {tag}
                                    </button>
                                ))}
                            </div>
                        )}

                        {filteredPosts.length === 0 ? (
                            <div className="empty-state">
                                <h3>No articles yet</h3>
                                <p>
                                    {currentUser
                                        ? <Link to="/write" className="accent-link">Write your first article →</Link>
                                        : 'Sign up to start publishing.'}
                                </p>
                            </div>
                        ) : (
                            filteredPosts.map(post => (
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

                {/* Notes tab */}
                {tab === 'notes' && (
                    <>
                        {currentUser && (
                            <form className="note-compose" onSubmit={handlePostNote}>
                                <textarea
                                    value={noteText}
                                    onChange={e => setNoteText(e.target.value)}
                                    placeholder="Share a quick thought…"
                                    rows={3}
                                    className="note-textarea"
                                />
                                <div className="note-compose-footer">
                                    <span className="char-count">{noteText.length} / 500</span>
                                    <button
                                        type="submit"
                                        className="btn btn-accent"
                                        disabled={!noteText.trim() || noteText.length > 500}
                                    >
                                        Post note
                                    </button>
                                </div>
                            </form>
                        )}

                        {filteredNotes.length === 0 ? (
                            <div className="empty-state">
                                <h3>No notes yet</h3>
                                <p>Notes are short thoughts — post one above.</p>
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
            </div>
        </div>
    )
}