/** Local recovery copies. Exported files are the durable study records. */
export class SessionStore {
  constructor(storage = localStorage) { this.storage = storage; }

  save(session) {
    // Throw on storage failure so a session cannot continue without its recovery copy.
    this.storage.setItem(`mouse-srt:${session.id}`, JSON.stringify(session));
  }

  list() {
    return Object.keys(this.storage).filter(key => key.startsWith('mouse-srt:'))
      .map(key => {
        try { return JSON.parse(this.storage.getItem(key)); } catch { return null; }
      }).filter(Boolean).sort((a, b) => b.startedAt.localeCompare(a.startedAt));
  }
}
