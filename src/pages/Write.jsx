import { useState, useEffect } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import {
    createPost, updatePost, getPostById
} from '../utils/storage'
import './Write.css'

export default function Write() {
    const { currentUser } = useAuth()
    const navigate = useNavigate()
    const [searchParams] = useSearchParams()
    const editId = searchParams.get('edit')

    const [title, setTitle] = useState('')
    const [content, setContent] = useState('')
    const [tagInput, setTagInput] = useState('')
    const [tags, setTags] = useState([])
    const [isDraft, setIsDraft] = useState(true)
    const [saved, setSaved] = useState(false)

    useEffect(() => {
        if (!currentUser) navigate('/login')
    }, [currentUser])

    // Load existing post if editing
    useEffect(() => {
        if (editId) {
            const post = getPostById(editId)
            if (post && post.authorId === currentUser?.id) {
                setTitle(post.title)
                setContent(post.content)
                setTags(post.tags || [])
                setIsDraft(post.isDraft)
            }
        }
    }, [editId])

    function addTag(e) {
        if (e.key === 'Enter' || e.key === ',') {
            e.preventDefault()
            const t = tagInput.trim().toLowerCase()
            if (t && !tags.includes(t) && tags.length < 5) {
                setTags(prev => [...prev, t])
            }
            setTagInput('')
        }
    }

    function removeTag(tag) {
        setTags(prev => prev.filter(t => t !== tag))
    }

    function handleSave(draft) {
        if (!title.trim()) return
        if (editId) {
            updatePost(editId, { title, content, tags, isDraft: draft })
        } else {
            createPost({ title, content, authorId: currentUser.id, tags, isDraft: draft })
        }
        setSaved(true)
        setTimeout(() => setSaved(false), 2000)
        if (!draft) navigate('/')
    }

    const wordCount = content.trim().split(/\s+/).filter(Boolean).length

    return (
        <div className="write-page">
            <div className="write-toolbar">
                <div className="write-toolbar-left">
                    <button onClick={() => navigate(-1)} className="btn btn-outline">← Back</button>
                </div>
                <div className="write-toolbar-right">
                    {saved && <span className="save-indicator">Saved ✓</span>}
                    <button className="btn btn-outline" onClick={() => handleSave(true)}>
                        Save draft
                    </button>
                    <button className="btn btn-accent" onClick={() => handleSave(false)}>
                        Publish
                    </button>
                </div>
            </div>

            <div className="write-inner">
                <input
                    className="write-title"
                    placeholder="Title"
                    value={title}
                    onChange={e => setTitle(e.target.value)}
                    maxLength={120}
                />

                <div className="write-tags-row">
                    {tags.map(tag => (
                        <span key={tag} className="tag active">
                            {tag}
                            <button className="tag-remove" onClick={() => removeTag(tag)}>×</button>
                        </span>
                    ))}
                    {tags.length < 5 && (
                        <input
                            className="tag-input"
                            placeholder="Add tag, press Enter…"
                            value={tagInput}
                            onChange={e => setTagInput(e.target.value)}
                            onKeyDown={addTag}
                        />
                    )}
                </div>

                <textarea
                    className="write-body"
                    placeholder="Tell your story…"
                    value={content}
                    onChange={e => setContent(e.target.value)}
                />

                <div className="write-footer">
                    <span className="word-count">{wordCount} words</span>
                </div>
            </div>
        </div>
    )
}