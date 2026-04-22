import { createWedding } from './actions'

export default function NewWeddingPage() {
  return (
    <div className="p-8 max-w-2xl">
      <h1 className="text-2xl font-serif text-stone-800 mb-8">New Wedding</h1>

      <form action={createWedding} className="space-y-6">
        {/* Couple */}
        <fieldset className="space-y-4">
          <legend className="text-sm font-medium text-stone-500 uppercase tracking-wide">Couple</legend>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-stone-700 mb-1.5">
                Partner 1 name <span className="text-rose-500">*</span>
              </label>
              <input
                name="partner1_name"
                required
                className="w-full px-3.5 py-2.5 border border-stone-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-rose-500 focus:border-transparent"
                placeholder="Alex"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-stone-700 mb-1.5">
                Partner 2 name <span className="text-rose-500">*</span>
              </label>
              <input
                name="partner2_name"
                required
                className="w-full px-3.5 py-2.5 border border-stone-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-rose-500 focus:border-transparent"
                placeholder="Jordan"
              />
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-stone-700 mb-1.5">
              Couple email
              <span className="ml-1 text-stone-400 font-normal">(magic-link invite will be sent)</span>
            </label>
            <input
              name="couple_email"
              type="email"
              className="w-full px-3.5 py-2.5 border border-stone-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-rose-500 focus:border-transparent"
              placeholder="couple@example.com"
            />
          </div>
        </fieldset>

        {/* Event */}
        <fieldset className="space-y-4">
          <legend className="text-sm font-medium text-stone-500 uppercase tracking-wide">Event</legend>
          <div>
            <label className="block text-sm font-medium text-stone-700 mb-1.5">
              Wedding date <span className="text-rose-500">*</span>
            </label>
            <input
              name="wedding_date"
              type="date"
              required
              className="w-full px-3.5 py-2.5 border border-stone-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-rose-500 focus:border-transparent"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-stone-700 mb-1.5">Venue name</label>
            <input
              name="venue_name"
              className="w-full px-3.5 py-2.5 border border-stone-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-rose-500 focus:border-transparent"
              placeholder="The Grand Ballroom"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-stone-700 mb-1.5">Venue address</label>
            <input
              name="venue_address"
              className="w-full px-3.5 py-2.5 border border-stone-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-rose-500 focus:border-transparent"
              placeholder="123 Main St, City, State"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-stone-700 mb-1.5">Dress code</label>
            <input
              name="dress_code"
              className="w-full px-3.5 py-2.5 border border-stone-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-rose-500 focus:border-transparent"
              placeholder="Black tie, Cocktail attire…"
            />
          </div>
        </fieldset>

        <div className="flex items-center gap-3 pt-2">
          <button
            type="submit"
            className="px-5 py-2.5 bg-rose-600 text-white rounded-lg text-sm font-medium hover:bg-rose-700 transition-colors"
          >
            Create wedding
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
