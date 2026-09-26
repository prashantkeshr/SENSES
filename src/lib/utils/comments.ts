export interface Comment {
  id:        string;
  mediaId:   string;
  text:      string;
  createdAt: string;
}

const KEY = 'senses:comments';

function load(): Record<string, Comment[]> {
  try {
    const raw = localStorage.getItem(KEY);
    return raw ? JSON.parse(raw) : {};
  } catch {
    return {};
  }
}

function save(data: Record<string, Comment[]>) {
  try { localStorage.setItem(KEY, JSON.stringify(data)); } catch { /* noop */ }
}

export function getComments(mediaId: string): Comment[] {
  return load()[mediaId] ?? [];
}

export function addComment(mediaId: string, text: string): Comment {
  const comment: Comment = {
    id:        `c-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
    mediaId,
    text:      text.trim(),
    createdAt: new Date().toISOString(),
  };
  const data = load();
  data[mediaId] = [comment, ...(data[mediaId] ?? [])];
  save(data);
  return comment;
}

export function deleteComment(mediaId: string, commentId: string): void {
  const data = load();
  if (data[mediaId]) {
    data[mediaId] = data[mediaId].filter(c => c.id !== commentId);
    if (data[mediaId].length === 0) delete data[mediaId];
  }
  save(data);
}

export function getAllCommentCount(): number {
  const data = load();
  return Object.values(data).reduce((sum, arr) => sum + arr.length, 0);
}
