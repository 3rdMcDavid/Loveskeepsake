import { createWedding } from './actions'

export default function NewWeddingPage() {
  return (
    <div className="p-8 max-w-lg">
      <h1 className="text-2xl font-serif text-stone-800 mb-2">New Wedding</h1>
      <p className="text-sm text-stone-400 mb-8">
        The couple will fill in their date, venue, and attire when they log in.
      </p>

      <form action={createWedding} className="space-y-5">
        <div>
          <label className="block text-sm font-medium text-stone-700 mb-1.5">
            Couple name <span className="text-rose-500">*</span>
            <span className="ml-1.5 text-stone-400 font-normal">e.g. The McCarters</span>
          </label>
          <input
            name="couple_name"
            required
            className="w-full px-3.5 py-2.5 border border-stone-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-stone-400 focus:border-transparent"
            placeholder="The McCarters"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-stone-700 mb-1.5">
            Couple email <span className="text-rose-500">*</span>
            <span className="ml-1.5 text-stone-400 font-normal">(invite link will be sent here)</span>
          </label>
          <input
            name="couple_email"
            type="email"
            required
            className="w-full px-3.5 py-2.5 border border-stone-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-stone-400 focus:border-transparent"
            placeholder="couple@example.com"
          />
        </div>

        <div className="flex items-center gap-3 pt-2">
          <button
            type="submit"
            className="px-5 py-2.5 bg-stone-800 text-white rounded-lg text-sm font-medium hover:bg-stone-700 transition-colors"
          >
            Create &amp; Send Invite
          </button>
          <a
            href="/admin"
            className="px-5 py-2.5 text-stone-500 text-sm hover:text-stone-700 transition-colors"
          >
            Cancel
          </a>
        </div>
      </form>
    </div>
  )
}
