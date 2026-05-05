'use client'

import { useRef, useState, useTransition } from 'react'
import { addNote, deleteNote, updateNote } from '@/app/admin/notebook/actions'

const PRESET_TAGS = ['venue', 'vendor', 'task', 'general']

const TAG_COLORS: Record<string, string> = {
  venue:   'bg-sky-100 text-sky-700',
  vendor:  'bg-violet-100 text-violet-700',
  task:    'bg-amber-100 text-amber-700',
  general: 'bg-stone-100 text-stone-600',
}

function tagColor(tag: string) {
  return TAG_COLORS[tag] ?? 'bg-rose-100 text-rose-700'
}

export type AdminNote = {
  id: string
  title: string | null
  content: string
  tags: string[]
  created_at: string
  updated_at: string
}

function formatDate(iso: string) {
  return new Date(iso).toLocaleString('en-US', {
    month: 'short', day: 'numeric', year: 'numeric',
    hour: 'numeric', minute: '2-digit',
  })
}

function TagPicker({ selected, onChange }: { selected: string[]; onChange: (t: string[]) => void }) {
  function toggle(tag: string) {
    onChange(selected.includes(tag) ? selected.filter(t => t !== tag) : [...selected, tag])
  }
  return (
    <div className="flex flex-wrap gap-2">
      {PRESET_TAGS.map(tag => (
        <button
          key={tag}
          type="button"
          onClick={() => toggle(tag)}
          className={`px-2.5 py-1 rounded-full text-xs font-medium transition-all border ${
            selected.includes(tag)
              ? `${tagColor(tag)} border-transparent`
              : 'bg-white text-stone-400 border-stone-200 hover:border-stone-300'
          }`}
        >
          {tag}
        </button>
      ))}
    </div>
  )
}

function NoteCard({ note, onUpdated }: { note: AdminNote; onUpdated?: () => void }) {
  const [editing, setEditing] = useState(false)
  const [title, setTitle] = useState(note.title ?? '')
  const [content, setContent] = useState(note.content)
  const [tags, setTags] = useState(note.tags)
  const [pending, startTransition] = useTransition()
  const [confirmDelete, setConfirmDelete] = useState(false)

  function handleSave() {
    startTransition(async () => {
      await updateNote(note.id, title.trim() || null, content, tags)
      setEditing(false)
    })
  }

  function handleDelete() {
    startTransition(async () => {
      await deleteNote(note.id)
    })
  }

  function handleCancel() {
    setTitle(note.title ?? '')
    setContent(note.content)
    setTags(note.tags)
    setEditing(false)
    setConfirmDelete(false)
  }

  if (editing) {
    return (
      <div className="bg-white border border-stone-200 rounded-xl p-5 space-y-3">
        <input
          className="w-full text-sm font-medium text-stone-800 border-b border-stone-100 pb-1 focus:outline-none focus:border-stone-300"
          placeholder="Title (optional)"
          value={title}
          onChange={e => setTitle(e.target.value)}
        />
        <textarea
          className="w-full text-sm text-stone-700 resize-none focus:outline-none min-h-[80px]"
          value={content}
          onChange={e => setContent(e.target.value)}
        />
        <TagPicker selected={tags} onChange={setTags} />
        <div className="flex gap-2 pt-1">
          <button
            onClick={handleSave}
            disabled={pending || !content.trim()}
            className="px-3 py-1.5 bg-stone-800 text-white text-xs rounded-lg disabled:opacity-40"
          >
            Save
          </button>
          <button onClick={handleCancel} className="px-3 py-1.5 text-stone-400 text-xs hover:text-stone-600">
            Cancel
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="bg-white border border-stone-200 rounded-xl p-5 group">
      <div className="flex items-start justify-between gap-4">
        <div className="flex-1 min-w-0">
          {note.title && (
            <p className="text-sm font-medium text-stone-800 mb-1">{note.title}</p>
          )}
          <p className="text-sm text-stone-600 whitespace-pre-wrap leading-relaxed">{note.content}</p>
          {note.tags.length > 0 && (
            <div className="flex flex-wrap gap-1.5 mt-3">
              {note.tags.map(tag => (
                <span key={tag} className={`px-2 py-0.5 rounded-full text-xs font-medium ${tagColor(tag)}`}>
                  {tag}
                </span>
              ))}
            </div>
          )}
          <p className="text-xs text-stone-300 mt-3">{formatDate(note.created_at)}</p>
        </div>
        <div className="flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity shrink-0">
          <button
            onClick={() => setEditing(true)}
            className="text-xs text-stone-400 hover:text-stone-700"
          >
            Edit
          </button>
          {confirmDelete ? (
            <span className="flex items-center gap-1">
              <button onClick={handleDelete} disabled={pending} className="text-xs text-rose-500 hover:text-rose-700">
                Confirm
              </button>
              <button onClick={() => setConfirmDelete(false)} className="text-xs text-stone-400 hover:text-stone-600">
                Cancel
              </button>
            </span>
          ) : (
            <button onClick={() => setConfirmDelete(true)} className="text-xs text-stone-400 hover:text-rose-500">
              Delete
            </button>
          )}
        </div>
      </div>
    </div>
  )
}

function NewNoteForm() {
  const formRef = useRef<HTMLFormElement>(null)
  const [tags, setTags] = useState<string[]>([])
  const [pending, startTransition] = useTransition()
  const [open, setOpen] = useState(false)

  function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    const fd = new FormData(e.currentTarget)
    fd.set('tags', tags.join(','))
    startTransition(async () => {
      await addNote(fd)
      formRef.current?.reset()
      setTags([])
      setOpen(false)
    })
  }

  if (!open) {
    return (
      <button
        onClick={() => setOpen(true)}
        className="w-full border-2 border-dashed border-stone-200 rounded-xl py-4 text-sm text-stone-400 hover:border-stone-300 hover:text-stone-600 transition-colors"
      >
        + New entry
      </button>
    )
  }

  return (
    <form ref={formRef} onSubmit={handleSubmit} className="bg-white border border-stone-200 rounded-xl p-5 space-y-3">
      <input
        name="title"
        className="w-full text-sm font-medium text-stone-800 border-b border-stone-100 pb-1 focus:outline-none focus:border-stone-300 placeholder:text-stone-300"
        placeholder="Title (optional)"
      />
      <textarea
        name="content"
        required
        rows={4}
        className="w-full text-sm text-stone-700 resize-none focus:outline-none placeholder:text-stone-300"
        placeholder="What's on your mind? A venue you visited, a vendor contact, something to remember…"
      />
      <TagPicker selected={tags} onChange={setTags} />
      <div className="flex gap-2 pt-1">
        <button
          type="submit"
          disabled={pending}
          className="px-3 py-1.5 bg-stone-800 text-white text-xs rounded-lg disabled:opacity-40"
        >
          {pending ? 'Saving…' : 'Add entry'}
        </button>
        <button
          type="button"
          onClick={() => { setOpen(false); setTags([]) }}
          className="px-3 py-1.5 text-stone-400 text-xs hover:text-stone-600"
        >
          Cancel
        </button>
      </div>
    </form>
  )
}

export default function NotebookClient({ notes }: { notes: AdminNote[] }) {
  const [activeTag, setActiveTag] = useState<string | null>(null)

  const filtered = activeTag
    ? notes.filter(n => n.tags.includes(activeTag))
    : notes

  const allTags = Array.from(new Set(notes.flatMap(n => n.tags))).sort()

  return (
    <div className="space-y-6">
      <NewNoteForm />

      {allTags.length > 0 && (
        <div className="flex flex-wrap gap-2">
          <button
            onClick={() => setActiveTag(null)}
            className={`px-2.5 py-1 rounded-full text-xs font-medium border transition-all ${
              activeTag === null
                ? 'bg-stone-800 text-white border-transparent'
                : 'bg-white text-stone-400 border-stone-200 hover:border-stone-300'
            }`}
          >
            All
          </button>
          {allTags.map(tag => (
            <button
              key={tag}
              onClick={() => setActiveTag(activeTag === tag ? null : tag)}
              className={`px-2.5 py-1 rounded-full text-xs font-medium border transition-all ${
                activeTag === tag
                  ? `${tagColor(tag)} border-transparent`
                  : 'bg-white text-stone-400 border-stone-200 hover:border-stone-300'
              }`}
            >
              {tag}
            </button>
          ))}
        </div>
      )}

      {filtered.length === 0 ? (
        <div className="text-center py-16 text-stone-300">
          <p className="text-sm">{activeTag ? `No entries tagged "${activeTag}"` : 'No entries yet.'}</p>
        </div>
      ) : (
        <div className="space-y-3">
          {filtered.map(note => (
            <NoteCard key={note.id} note={note} />
          ))}
        </div>
      )}
    </div>
  )
}
