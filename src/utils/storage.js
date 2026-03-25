const KEYS = {
    USERS: 'sl_users',
    POSTS: 'sl_posts',
    NOTES: 'sl_notes',
    COMMENTS: 'sl_comments',
    SESSION: 'sl_session',
    SUBSCRIPTIONS: 'sl_subscriptions',
}

function get(key) {
    try {
        const val = localStorage.getItem(key)
        return val ? JSON.parse(val) : null
    } catch {
        return null
    }
}

function set(key, value) {
    localStorage.setItem(key, JSON.stringify(value))
}

// Users
export function getUsers() { return get(KEYS.USERS) || [] }
export function saveUsers(users) { set(KEYS.USERS, users) }
export function getUserById(id) { return getUsers().find(u => u.id === id) || null }

// Session
export function getSession() { return get(KEYS.SESSION) }
export function saveSession(user) { set(KEYS.SESSION, user) }
export function clearSession() { localStorage.removeItem(KEYS.SESSION) }

// Posts
export function getPosts() { return get(KEYS.POSTS) || [] }
export function savePosts(posts) { set(KEYS.POSTS, posts) }
export function getPostById(id) { return getPosts().find(p => p.id === id) || null }

// Notes
export function getNotes() { return get(KEYS.NOTES) || [] }
export function saveNotes(notes) { set(KEYS.NOTES, notes) }

// Comments
export function getComments() { return get(KEYS.COMMENTS) || [] }
export function saveComments(comments) { set(KEYS.COMMENTS, comments) }
export function getCommentsByPostId(postId) {
    return getComments().filter(c => c.postId === postId)
}

// Subscriptions
export function getSubscriptions() { return get(KEYS.SUBSCRIPTIONS) || [] }
export function saveSubscriptions(subs) { set(KEYS.SUBSCRIPTIONS, subs) }

// ─── Post operations ──────────────────────────────────────────────

export function generateId() {
    return Date.now().toString(36) + Math.random().toString(36).slice(2)
}

export function createPost({ title, content, authorId, tags = [], isDraft = false }) {
    const posts = getPosts()
    const newPost = {
        id: generateId(),
        title,
        content,
        authorId,
        tags,
        isDraft,
        likes: 0,
        likedBy: [],
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
    }
    savePosts([newPost, ...posts])
    return newPost
}

export function updatePost(id, changes) {
    const posts = getPosts()
    const updated = posts.map(p =>
        p.id === id ? { ...p, ...changes, updatedAt: new Date().toISOString() } : p
    )
    savePosts(updated)
    return updated.find(p => p.id === id)
}

export function deletePost(id) {
    savePosts(getPosts().filter(p => p.id !== id))
    // Also remove associated comments
    saveComments(getComments().filter(c => c.postId !== id))
}

export function toggleLikePost(postId, userId) {
    const posts = getPosts()
    const post = posts.find(p => p.id === postId)
    if (!post) return
    const alreadyLiked = post.likedBy.includes(userId)
    const updatedPost = {
        ...post,
        likes: alreadyLiked ? post.likes - 1 : post.likes + 1,
        likedBy: alreadyLiked
            ? post.likedBy.filter(id => id !== userId)
            : [...post.likedBy, userId],
    }
    savePosts(posts.map(p => p.id === postId ? updatedPost : p))
    return updatedPost
}

// ─── Note operations ──────────────────────────────────────────────

export function createNote({ content, authorId }) {
    const notes = getNotes()
    const newNote = {
        id: generateId(),
        content,
        authorId,
        likes: 0,
        likedBy: [],
        createdAt: new Date().toISOString(),
    }
    saveNotes([newNote, ...notes])
    return newNote
}

export function deleteNote(id) {
    saveNotes(getNotes().filter(n => n.id !== id))
}

export function toggleLikeNote(noteId, userId) {
    const notes = getNotes()
    const note = notes.find(n => n.id === noteId)
    if (!note) return
    const alreadyLiked = note.likedBy.includes(userId)
    const updatedNote = {
        ...note,
        likes: alreadyLiked ? note.likes - 1 : note.likes + 1,
        likedBy: alreadyLiked
            ? note.likedBy.filter(id => id !== userId)
            : [...note.likedBy, userId],
    }
    saveNotes(notes.map(n => n.id === noteId ? updatedNote : n))
    return updatedNote
}

export function createComment({ postId, userId, text }) {
    const comments = getComments()
    const newComment = {
        id: generateId(),
        postId,
        userId,
        text,
        createdAt: new Date().toISOString(),
    }
    saveComments([...comments, newComment])
    return newComment
}

export function deleteComment(id) {
    saveComments(getComments().filter(c => c.id !== id))
}

// ─── Subscription operations ──────────────────────────────────────

export function isSubscribed(subscriberId, authorId) {
    return getSubscriptions().some(
        s => s.subscriberId === subscriberId && s.authorId === authorId
    )
}

export function toggleSubscription(subscriberId, authorId) {
    const subs = getSubscriptions()
    const exists = subs.some(s => s.subscriberId === subscriberId && s.authorId === authorId)
    if (exists) {
        saveSubscriptions(subs.filter(
            s => !(s.subscriberId === subscriberId && s.authorId === authorId)
        ))
        return false
    } else {
        saveSubscriptions([...subs, { subscriberId, authorId }])
        return true
    }
}

export function getSubscriberCount(authorId) {
    return getSubscriptions().filter(s => s.authorId === authorId).length
}