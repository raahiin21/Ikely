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