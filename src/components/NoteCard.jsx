import { Link } from 'react-router-dom'
import { getUserById } from '../utils/storage'
import { formatDate } from '../utils/readingTime'
import './NoteCard.css'

export default function NoteCard({ note, onLike, isLiked, onDelete, currentUserId }) {
    const author = getUserById(note.authorId)
    const isOwner = currentUserId === note.authorId

    return (
        <article className="note-card">
            <div className="note-card-header">
                <Link to={`/profile/${note.authorId}`} className="note-author">
                    <span className="author-avatar-sm">
                        {author?.name?.charAt(0).toUpperCase() || '?'}
                    </span>
                    <span className="note-author-name">{author?.name || 'Unknown'}</span>
                </Link>
                <span className="note-date">{formatDate(note.createdAt)}</span>
            </div>

            <p className="note-content">{note.content}</p>

            <div className="note-footer">
                <button
                    className={`like-btn ${isLiked ? 'liked' : ''}`}
                    onClick={() => onLike?.(note.id)}
                >
                    ♥ {note.likes || 0}
                </button>
                {isOwner && (
                    <button className="btn btn-danger" onClick={() => onDelete?.(note.id)}>
                        Delete
                    </button>
                )}
            </div>
        </article>
    )
}