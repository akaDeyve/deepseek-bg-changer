// chat-background plugin — HOST half (persistence via RPC).
// Recreate with: cordis_define (kind: "new", idPrefix: "chbg") passing this
// body as code.host, then cordis_run the returned packageId.
return {
  apply(ctx) {
    const fs = ctx.get('fs')
    ctx.effect(() => harness.handle('chat-bg://load', async () => {
      if (fs === undefined) return { settings: null }
      try {
        const target = await fs.resolve('chat-bg.json')
        const text = await fs.readText(target)
        const data = JSON.parse(text)
        if (data && typeof data === 'object') return { settings: data }
        return { settings: null }
      } catch (e) { return { settings: null } }
    }), 'chat-bg: load')
    ctx.effect(() => harness.handle('chat-bg://save', async (args) => {
      if (fs === undefined) return { ok: false }
      try {
        const settings = args && args.settings ? args.settings : null
        if (settings === null) return { ok: false }
        const target = await fs.resolve('chat-bg.json')
        await fs.writeText(target, JSON.stringify(settings))
        return { ok: true }
      } catch (e) { return { ok: false } }
    }), 'chat-bg: save')
  },
}
