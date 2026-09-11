// chat-background plugin — CLIENT half (settings UI + wallpaper CSS).
// Recreate with: cordis_define (kind: "new", idPrefix: "chbg") passing this
// body as code.client, together with host.js as code.host, then cordis_run.
return {
  apply(ctx) {
    const slots = ctx.get('slots')
    if (slots === undefined) return
    const theme = ctx.get('theme')

    const DEFAULTS = { enabled: true, image: '', fit: 'cover', pos: 'center', zoom: 100, dim: 25, surface: 60, posX: 50, posY: 50 }

    let disposeWallpaper = null
    let disposeTheme = null
    function clear() {
      if (disposeWallpaper) { disposeWallpaper(); disposeWallpaper = null }
      if (disposeTheme) { disposeTheme(); disposeTheme = null }
    }

    function applyCss(s) {
      clear()
      if (!s.enabled || s.image === '') return

      const dim = Math.max(0, Math.min(80, s.dim))
      const fit = s.fit
      const size = fit === '%' ? (s.zoom + '%') : (fit === 'strech' ? '100% 100%' : 'cover')
      const image = 'url("' + s.image.replace(/["\\]/g, '') + '")'
      const dimLayer = dim > 0 ? 'linear-gradient(rgba(0,0,0,' + (dim / 100) + '), rgba(0,0,0,' + (dim / 100) + ')), ' : ''
      const posCss = s.pos === 'custom' ? (s.posX + '% ' + s.posY + '%') : s.pos

      let css = ''
      css += 'body,html{background-image:' + dimLayer + image + ';'
      css += 'background-size:' + size + ';background-position:' + posCss + ';background-repeat:no-repeat;'
      css += 'background-attachment:fixed;background-color:#000}\n'
      css += 'div[style*="grid-template-columns"]{background-color:transparent!important}\n'

      disposeWallpaper = styles.insert(css)

      const alpha = Math.max(20, Math.min(100, s.surface))
      const tokens = {}
      tokens['--dsw-alias-bg-base'] = { light: 'transparent', dark: 'transparent' }
      if (alpha < 100) {
        const a = (alpha / 100).toFixed(3)
        const rgba = (v) => 'rgba(' + v + ',' + a + ')'
        tokens['--dsw-alias-bg-layer-1'] = { light: rgba('255,255,255'), dark: rgba('44,44,46') }
        tokens['--dsw-alias-bg-layer-2'] = { light: rgba('255,255,255'), dark: rgba('53,54,56') }
        tokens['--dsw-alias-bg-layer-3'] = { light: rgba('255,255,255'), dark: rgba('53,54,56') }
        tokens['--dsw-specific-input-major'] = { light: rgba('255,255,255'), dark: rgba('44,44,46') }
        tokens['--dsw-specific-tip'] = { light: rgba('245,246,247'), dark: rgba('53,54,56') }
        tokens['--dsw-specific-bubble'] = { light: rgba('237,243,254'), dark: rgba('44,44,46') }
        tokens['--dsw-specific-selector'] = { light: rgba('245,246,247'), dark: rgba('53,54,56') }
        tokens['--dsw-specific-sidebar-fill'] = { light: rgba('249,250,251'), dark: rgba('27,27,28') }
      }
      if (theme !== undefined) {
        try { disposeTheme = theme.overrideTokens('chat-bg', tokens) } catch (e) { /* ignore */ }
      }
    }

    const persist = (s) => { void host.call('chat-bg://save', { settings: s }).catch(function () {}) }

    ctx.effect(() => slots.inject('settings.section', () => slots.register(
      { name: 'settings.section', id: 'chat-bg', order: 5, label: () => 'Chat Background' },
      (props) => {
        const [state, setState] = React.useState(Object.assign({}, DEFAULTS))
        const [ready, setReady] = React.useState(false)

        React.useEffect(() => {
          let cancelled = false
          host.call('chat-bg://load', {}).then((res) => {
            if (cancelled) return
            const saved = res && res.settings ? res.settings : null
            const next = Object.assign({}, DEFAULTS, saved || {})
            setState(next)
            applyCss(next)
            setReady(true)
          }).catch(function () {
            if (!cancelled) { setReady(true) }
          })
          return () => { cancelled = true }
        }, [])

        const upd = (patch) => {
          const next = Object.assign({}, state, patch)
          setState(next)
          applyCss(next)
          persist(next)
        }

        const lbl = (t) => React.createElement('label', { style: lblStyle() }, t)
        const row = (a, b) => React.createElement('div', { style: rowStyle() }, a, b)
        const field = (l, control) => row(lbl(l), control)

        const toggle = React.createElement('input', { type: 'checkbox', checked: state.enabled, style: { flex: 'none' }, onChange: (e) => upd({ enabled: e.target.checked }) })
        const url = React.createElement('input', { type: 'text', placeholder: 'https://… or paste an image URL', value: state.image, style: inp(), onChange: (e) => upd({ image: e.target.value }) })
        const file = React.createElement('input', { type: 'file', accept: 'image/*', style: { flex: 1, color: 'var(--dsw-alias-label-secondary)', fontSize: 12, minWidth: 0 }, onChange: (e) => {
          const f = e.target.files && e.target.files[0]
          if (f && typeof FileReader !== 'undefined') {
            const fr = new FileReader()
            fr.onload = () => upd({ image: fr.result })
            fr.readAsDataURL(f)
          }
        } })
        const fitSel = React.createElement('select', { value: state.fit, style: selStyle(), onChange: (e) => upd({ fit: e.target.value }) },
          React.createElement('option', { value: 'cover' }, 'Cover (crop)'),
          React.createElement('option', { value: 'strech' }, 'Stretch'),
          React.createElement('option', { value: '%' }, 'Zoom %'))
        const posSel = React.createElement('select', { value: state.pos, style: selStyle(), onChange: (e) => upd({ pos: e.target.value }) },
          React.createElement('option', { value: 'center' }, 'Center'),
          React.createElement('option', { value: 'left top' }, 'Left top'),
          React.createElement('option', { value: 'left bottom' }, 'Left bottom'),
          React.createElement('option', { value: 'right top' }, 'Right top'),
          React.createElement('option', { value: 'right bottom' }, 'Right bottom'),
          React.createElement('option', { value: 'custom' }, 'Custom %'))
        const zoomWrap = state.fit === '%'
          ? field('Zoom', React.createElement('input', { type: 'range', min: 20, max: 400, value: state.zoom, style: rngStyle(), onChange: (e) => upd({ zoom: Number(e.target.value) }) }))
          : React.createElement('div', null)
        const posWrap = state.pos === 'custom'
          ? field('X / Y', React.createElement('div', { style: { flex: 1, display: 'flex', gap: 8 } },
              React.createElement('input', { type: 'range', min: 0, max: 100, value: state.posX, style: rngStyle(), onChange: (e) => upd({ posX: Number(e.target.value) }) }),
              React.createElement('input', { type: 'range', min: 0, max: 100, value: state.posY, style: rngStyle(), onChange: (e) => upd({ posY: Number(e.target.value) }) })))
          : React.createElement('div', null)

        const status = !ready ? 'loading' : (!state.enabled) ? 'disabled' : (state.image === '' ? 'no image selected' : 'applied')

        return React.createElement('div', { style: pageStyle(), onMouseDown: (e) => e.stopPropagation() },
          React.createElement('h3', { style: h3Style() }, 'Chat Background'),
          React.createElement('p', { style: pStyle() }, 'Sharp wallpaper with translucent UI (incl. sidebar). Settings auto-save.'),
          field('Enabled', toggle),
          field('Image URL', url),
          field('Local file', file),
          field('Fit', fitSel),
          field('Position', posSel),
          zoomWrap,
          posWrap,
          field('Dim (darken)', React.createElement('input', { type: 'range', min: 0, max: 80, value: state.dim, style: rngStyle(), onChange: (e) => upd({ dim: Number(e.target.value) }) })),
          field('Surface opacity %', React.createElement('input', { type: 'range', min: 20, max: 100, value: state.surface, style: rngStyle(), onChange: (e) => upd({ surface: Number(e.target.value) }) })),
          React.createElement('div', { style: { padding: '6px 8px', fontSize: 11, color: 'var(--dsw-alias-label-secondary)' } }, 'Status: ' + status))
      },
    )))

    function rowStyle() { return { display: 'flex', alignItems: 'center', gap: 10, padding: '6px 8px', marginBottom: 2 } }
    function lblStyle() { return { width: 130, fontSize: 12, color: 'var(--dsw-alias-label-secondary)', flex: 'none' } }
    function inp() { return { flex: 1, minWidth: 0, background: 'var(--dsw-alias-bg-layer-1)', color: 'var(--dsw-alias-label-primary)', border: '1px solid var(--dsw-alias-border-l2)', borderRadius: 6, padding: '4px 6px', fontSize: 12 } }
    function selStyle() { return { flex: 'none', background: 'var(--dsw-alias-bg-layer-1)', color: 'var(--dsw-alias-label-primary)', border: '1px solid var(--dsw-alias-border-l2)', borderRadius: 6, padding: '3px 4px', fontSize: 12 } }
    function rngStyle() { return { flex: 1 } }
    function h3Style() { return { margin: 0, fontSize: 16, fontWeight: 700, color: 'var(--dsw-alias-label-primary)' } }
    function pStyle() { return { margin: '6px 0', fontSize: 12, color: 'var(--dsw-alias-label-secondary)' } }
    function pageStyle() { return { padding: '12px 14px', maxWidth: 540 } }
  },
}
