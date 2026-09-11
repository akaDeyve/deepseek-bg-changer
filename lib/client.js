window.__ModuleLoader__.load({
	id: "dsh-chat-background",
	factory: (require) => {
		var module = { exports: {} };
		var exports = module.exports;
		Object.defineProperty(exports, Symbol.toStringTag, { value: "Module" });
		let React = require("react");

		//#region dsh-chat-background client half
		/**
		 * Chat background wallpaper with translucent UI surfaces.
		 *
		 * - Applies immediately at plugin load (enabled by default; a built-in
		 *   gradient follows the active color scheme until an image is chosen).
		 * - Registers a "Chat Background" section in the settings area.
		 * - Persists settings in browser localStorage, so they survive DSH
		 *   restarts without any host-side storage.
		 * - Optional extras: accent color (brand/button/link token overrides),
		 *   fade-to-bottom dim mode, and opt-in backdrop blur on the sidebar
		 *   and the composer card (narrow targets only).
		 */
		const STORE_KEY = "dsh.chat-background.settings";
		const DEFAULTS = {
			enabled: true, image: "", fit: "cover", pos: "center", zoom: 100,
			dim: 25, surface: 60, posX: 50, posY: 50,
			accent: "", fade: false,
			extendSidebar: false, sidebarBlur: 8,
			extendMsgBar: false, msgBarBlur: 8
		};

		const ACCENT_PRESETS = ["#4f7cff", "#3b82f6", "#2563eb", "#0ea5e9", "#22d3ee", "#8b5cf6", "#ef4444", "#22c55e"];

		const inject = ["slots", "theme"];

		function apply(ctx) {
			const theme = ctx.theme;

			let styleEl = null;
			let extraTags = [];
			let disposeTokens = null;
			let current = Object.assign({}, DEFAULTS, readSaved());

			ctx.effect(() => () => {
				if (disposeTokens) { disposeTokens(); disposeTokens = null; }
				removeExtraTags();
				if (styleEl && styleEl.parentNode) styleEl.parentNode.removeChild(styleEl);
				styleEl = null;
			}, "chat-background: wallpaper cleanup");

			// Re-pick the built-in gradient when the color scheme changes.
			ctx.on("theme/change", () => { applyAll(current); });

			function readSaved() {
				try {
					const raw = localStorage.getItem(STORE_KEY);
					if (!raw) return null;
					const data = JSON.parse(raw);
					return data && typeof data === "object" ? data : null;
				} catch (e) { return null; }
			}

			//#region color helpers (adapted from EsshUwU/dsh-theme, MIT)
			function clamp(n, min, max) { return Math.min(Math.max(n, min), max); }
			function numOr(v, fb, min, max) {
				const n = typeof v === "number" ? v : parseFloat(v);
				if (isNaN(n)) return fb;
				return min !== undefined ? clamp(n, min, max) : n;
			}
			function hexToRgb(hex) {
				let h = String(hex || "").replace("#", "").trim();
				if (h.length === 3) h = h[0] + h[0] + h[1] + h[1] + h[2] + h[2];
				const n = parseInt(h, 16);
				if (isNaN(n) || h.length !== 6) return null;
				return { r: (n >> 16) & 255, g: (n >> 8) & 255, b: n & 255 };
			}
			function rgbToHex(r, g, b) {
				const to = (x) => clamp(Math.round(x), 0, 255).toString(16).padStart(2, "0");
				return "#" + to(r) + to(g) + to(b);
			}
			function shade(hex, pct) {
				const c = hexToRgb(hex);
				if (!c) return hex;
				const f = 1 + pct / 100;
				return rgbToHex(c.r * f, c.g * f, c.b * f);
			}
			function rgbaHex(hex, a) {
				const c = hexToRgb(hex);
				if (!c) return hex;
				return "rgba(" + c.r + "," + c.g + "," + c.b + "," + a + ")";
			}
			//#endregion

			function builtinWallpaper() {
				let scheme = "dark";
				try {
					const snap = theme.getTheme();
					if (snap && snap.active && snap.active.colorScheme) scheme = snap.active.colorScheme;
				} catch (e) { /* keep the dark default */ }
				return scheme === "light"
					? "linear-gradient(135deg, #dfe5ee 0%, #c9d4e4 48%, #b7c8dc 100%)"
					: "linear-gradient(135deg, #171b26 0%, #26203a 48%, #10202e 100%)";
			}

			function ensureStyleEl() {
				if (!styleEl) {
					styleEl = document.createElement("style");
					styleEl.id = "dsh-chat-background-wallpaper";
					document.head.appendChild(styleEl);
				}
				return styleEl;
			}

			function removeExtraTags() {
				for (const t of extraTags) { try { t.remove(); } catch (e) { /* already gone */ } }
				extraTags = [];
			}

			function addExtraTag(css) {
				const t = document.createElement("style");
				t.textContent = css;
				document.head.appendChild(t);
				extraTags.push(t);
			}

			function applyAll(s) {
				const el = ensureStyleEl();
				removeExtraTags();
				if (!s.enabled) {
					el.textContent = "";
					if (disposeTokens) { disposeTokens(); disposeTokens = null; }
					return;
				}
				const dim = Math.max(0, Math.min(80, Number(s.dim) || 0));
				const surface = Math.max(20, Math.min(100, Number(s.surface) || 60));
				const hasImage = typeof s.image === "string" && s.image !== "";
				const image = hasImage ? 'url("' + s.image.replace(/["\\]/g, "") + '")' : builtinWallpaper();
				const size = s.fit === "%" ? (s.zoom + "%") : (s.fit === "strech" ? "100% 100%" : "cover");
				const posCss = s.pos === "custom" ? (s.posX + "% " + s.posY + "%") : s.pos;

				let dimLayer = "";
				if (s.fade && hasImage) {
					// Fade-to-bottom: light dim at the top, fully dark at the bottom.
					dimLayer = "linear-gradient(to bottom, rgba(0,0,0," + (dim / 100).toFixed(3) + ") 0%, rgba(0,0,0,0.45) 45%, rgba(0,0,0,1) 100%), ";
				} else if (dim > 0) {
					dimLayer = "linear-gradient(rgba(0,0,0," + (dim / 100) + "), rgba(0,0,0," + (dim / 100) + ")), ";
				}

				let css = "";
				css += "body,html{background-image:" + dimLayer + image + ";";
				css += "background-size:" + size + ";background-position:" + posCss + ";background-repeat:no-repeat;";
				css += "background-attachment:fixed;background-color:#101218}\n";
				css += 'div[style*="grid-template-columns"]{background-color:transparent!important}\n';
				el.textContent = css;

				// Theme-token overrides: surface translucency (ours) + accent
				// color and extension tints (adopted from dsh-theme's approach).
				const tokens = {};
				if (surface < 100) {
					const a = (surface / 100).toFixed(3);
					const rgba = (v) => "rgba(" + v + "," + a + ")";
					tokens["--dsw-alias-bg-base"] = { light: "transparent", dark: "transparent" };
					tokens["--dsw-alias-bg-layer-1"] = { light: rgba("255,255,255"), dark: rgba("44,44,46") };
					tokens["--dsw-alias-bg-layer-2"] = { light: rgba("255,255,255"), dark: rgba("53,54,56") };
					tokens["--dsw-alias-bg-layer-3"] = { light: rgba("255,255,255"), dark: rgba("53,54,56") };
					tokens["--dsw-specific-input-major"] = { light: rgba("255,255,255"), dark: rgba("44,44,46") };
					tokens["--dsw-specific-tip"] = { light: rgba("245,246,247"), dark: rgba("53,54,56") };
					tokens["--dsw-specific-bubble"] = { light: rgba("237,243,254"), dark: rgba("44,44,46") };
					tokens["--dsw-specific-selector"] = { light: rgba("245,246,247"), dark: rgba("53,54,56") };
					tokens["--dsw-specific-sidebar-fill"] = { light: rgba("249,250,251"), dark: rgba("27,27,28") };
				}
				const accent = typeof s.accent === "string" && s.accent !== "" && hexToRgb(s.accent) ? s.accent : "";
				if (accent) {
					const aDark = shade(accent, -22), aHover = shade(accent, 10), aDarkHover = shade(aDark, 10);
					tokens["--dsw-alias-button-primary-fill"] = { light: accent, dark: aDark };
					tokens["--dsw-alias-button-primary-hover"] = { light: aHover, dark: aDarkHover };
					tokens["--dsw-alias-button-info-fill"] = { light: accent, dark: aDark };
					tokens["--dsw-alias-button-info-hover"] = { light: aHover, dark: aDarkHover };
					tokens["--dsw-alias-brand-primary"] = { light: accent, dark: aDark };
					tokens["--dsw-alias-state-business-primary"] = { light: rgbaHex(accent, 1), dark: rgbaHex(aDark, 1) };
					tokens["--dsw-alias-link"] = { light: accent, dark: aDark };
				}
				if (hasImage && s.extendSidebar) {
					tokens["--dsw-alias-button-elevated-fill"] = { light: "rgba(255,255,255,0.16)", dark: "rgba(255,255,255,0.16)" };
					tokens["--dsw-alias-button-elevated-hover"] = { light: "rgba(255,255,255,0.26)", dark: "rgba(255,255,255,0.26)" };
				}
				if (disposeTokens) { try { disposeTokens(); } catch (e) { /* no-op */ } disposeTokens = null; }
				if (Object.keys(tokens).length) {
					try {
						disposeTokens = theme.overrideTokens("chat-background", tokens);
					} catch (e) { /* token overrides are cosmetic; never break the page */ }
				}

				// Opt-in backdrop blur on narrow targets only (sidebar column and
				// composer card) — scoped blur proved stable where blanket blur
				// destabilized the fixed-position settings modal.
				if (hasImage && s.extendSidebar) {
					const blur = clamp(numOr(s.sidebarBlur, 8, 0, 30), 0, 30);
					addExtraTag('[class*="sidebarCol"]{backdrop-filter:blur(' + blur + 'px)!important;-webkit-backdrop-filter:blur(' + blur + 'px)!important}');
				}
				if (hasImage && s.extendMsgBar) {
					const blur = clamp(numOr(s.msgBarBlur, 8, 0, 30), 0, 30);
					addExtraTag('[data-composer-card]{backdrop-filter:blur(' + blur + 'px)!important;-webkit-backdrop-filter:blur(' + blur + 'px)!important}');
				}
			}

			// The wallpaper applies as soon as the plugin loads — no settings visit needed.
			applyAll(current);

			ctx.slots.inject("settings.section", () => ctx.slots.register(
				{ name: "settings.section", id: "chat-bg", order: 5, label: () => "Chat Background" },
				(props) => {
					const [state, setState] = React.useState(() => Object.assign({}, DEFAULTS, readSaved()));
					const [saveNote, setSaveNote] = React.useState("");

					const persist = (s) => {
						try {
							localStorage.setItem(STORE_KEY, JSON.stringify(s));
							setSaveNote("");
						} catch (e) {
							setSaveNote("Auto-save failed (browser storage full?) — changes stay active until the next page load.");
						}
					};

					const upd = (patch) => {
						const next = Object.assign({}, state, patch);
						current = next;
						setState(next);
						applyAll(next);
						persist(next);
					};

					const lbl = (t) => React.createElement("label", { style: lblStyle() }, t);
					const row = (a, b) => React.createElement("div", { style: rowStyle() }, a, b);
					const field = (l, control) => row(lbl(l), control);

					const toggle = React.createElement("input", { type: "checkbox", checked: state.enabled, style: { flex: "none" }, onChange: (e) => upd({ enabled: e.target.checked }) });
					const url = React.createElement("input", { type: "text", placeholder: "https://… or paste an image URL", value: state.image, style: inp(), onChange: (e) => upd({ image: e.target.value }) });
					const file = React.createElement("input", { type: "file", accept: "image/*", style: { flex: 1, color: "var(--dsw-alias-label-secondary)", fontSize: 12, minWidth: 0 }, onChange: (e) => {
						const f = e.target.files && e.target.files[0];
						if (f && typeof FileReader !== "undefined") {
							const fr = new FileReader();
							fr.onload = () => upd({ image: fr.result });
							fr.readAsDataURL(f);
						}
					} });
					const fitSel = React.createElement("select", { value: state.fit, style: selStyle(), onChange: (e) => upd({ fit: e.target.value }) },
						React.createElement("option", { value: "cover" }, "Cover (crop)"),
						React.createElement("option", { value: "strech" }, "Stretch"),
						React.createElement("option", { value: "%" }, "Zoom %"));
					const posSel = React.createElement("select", { value: state.pos, style: selStyle(), onChange: (e) => upd({ pos: e.target.value }) },
						React.createElement("option", { value: "center" }, "Center"),
						React.createElement("option", { value: "left top" }, "Left top"),
						React.createElement("option", { value: "left bottom" }, "Left bottom"),
						React.createElement("option", { value: "right top" }, "Right top"),
						React.createElement("option", { value: "right bottom" }, "Right bottom"),
						React.createElement("option", { value: "custom" }, "Custom %"));
					const zoomWrap = state.fit === "%"
						? field("Zoom", React.createElement("input", { type: "range", min: 20, max: 400, value: state.zoom, style: rngStyle(), onChange: (e) => upd({ zoom: Number(e.target.value) }) }))
						: React.createElement("div", null);
					const posWrap = state.pos === "custom"
						? field("X / Y", React.createElement("div", { style: { flex: 1, display: "flex", gap: 8 } },
							React.createElement("input", { type: "range", min: 0, max: 100, value: state.posX, style: rngStyle(), onChange: (e) => upd({ posX: Number(e.target.value) }) }),
							React.createElement("input", { type: "range", min: 0, max: 100, value: state.posY, style: rngStyle(), onChange: (e) => upd({ posY: Number(e.target.value) }) })))
						: React.createElement("div", null);

					// Accent swatch row: presets + custom picker + a clear swatch.
					const accentRow = React.createElement("div", { style: rowStyle() },
						lbl("Accent"),
						React.createElement("div", { style: { flex: 1, display: "flex", flexWrap: "wrap", gap: 6, alignItems: "center" } },
							ACCENT_PRESETS.map((c) => React.createElement("button", {
								key: c, type: "button", title: c,
								style: { width: 20, height: 20, borderRadius: "50%", border: "1px solid rgba(255,255,255,.2)", cursor: "pointer", padding: 0, background: c, outline: state.accent === c ? "2px solid var(--dsw-alias-brand-primary,#4f7cff)" : "none", outlineOffset: 1 },
								onClick: () => upd({ accent: c })
							})),
							React.createElement("label", { title: "Pick a custom accent color", style: { position: "relative", width: 22, height: 22, borderRadius: "50%", border: "1px dashed var(--dsw-alias-label-secondary)", cursor: "pointer", display: "inline-flex", alignItems: "center", justifyContent: "center", overflow: "hidden", flex: "none" } },
								React.createElement("span", { style: { fontSize: 13, fontWeight: 700, lineHeight: 1, pointerEvents: "none", color: "var(--dsw-alias-label-primary)" } }, "+"),
								React.createElement("input", { type: "color", style: { position: "absolute", inset: 0, width: "100%", height: "100%", opacity: 0, cursor: "pointer" }, value: state.accent || "#4f7cff", onChange: (e) => upd({ accent: e.target.value }) })),
							React.createElement("button", { type: "button", title: "Default accent", style: { width: 20, height: 20, borderRadius: "50%", border: "1px solid var(--dsw-alias-border-l2)", cursor: "pointer", padding: 0, background: "transparent", color: "var(--dsw-alias-label-secondary)", fontSize: 11, lineHeight: 1 }, onClick: () => upd({ accent: "" }) }, "\u00d7")));

					const fadeToggle = React.createElement("input", { type: "checkbox", checked: !!state.fade, style: { flex: "none" }, onChange: (e) => upd({ fade: e.target.checked }) });
					const extSidebar = React.createElement("input", { type: "checkbox", checked: !!state.extendSidebar, style: { flex: "none" }, onChange: (e) => upd({ extendSidebar: e.target.checked }) });
					const extMsgBar = React.createElement("input", { type: "checkbox", checked: !!state.extendMsgBar, style: { flex: "none" }, onChange: (e) => upd({ extendMsgBar: e.target.checked }) });
					const hasImage = typeof state.image === "string" && state.image !== "";
					const sidebarBlurRow = state.extendSidebar
						? field("Sidebar blur", React.createElement("input", { type: "range", min: 0, max: 30, value: state.sidebarBlur, style: rngStyle(), onChange: (e) => upd({ sidebarBlur: Number(e.target.value) }) }))
						: React.createElement("div", null);
					const msgBarBlurRow = state.extendMsgBar
						? field("Msg box blur", React.createElement("input", { type: "range", min: 0, max: 30, value: state.msgBarBlur, style: rngStyle(), onChange: (e) => upd({ msgBarBlur: Number(e.target.value) }) }))
						: React.createElement("div", null);

					const status = !state.enabled ? "disabled" : (hasImage ? "applied" : "built-in gradient");

					return React.createElement("div", { style: pageStyle(), onMouseDown: (e) => e.stopPropagation() },
						React.createElement("h3", { style: h3Style() }, "Chat Background"),
						React.createElement("p", { style: pStyle() }, "Sharp wallpaper with translucent UI (incl. sidebar). Enabled by default; settings persist in this browser."),
						field("Enabled", toggle),
						field("Image URL", url),
						field("Local file", file),
						field("Fit", fitSel),
						field("Position", posSel),
						zoomWrap,
						posWrap,
						field("Dim (darken)", React.createElement("input", { type: "range", min: 0, max: 80, value: state.dim, style: rngStyle(), onChange: (e) => upd({ dim: Number(e.target.value) }) })),
						field("Fade to bottom", fadeToggle),
						field("Surface opacity %", React.createElement("input", { type: "range", min: 20, max: 100, value: state.surface, style: rngStyle(), onChange: (e) => upd({ surface: Number(e.target.value) }) })),
						accentRow,
						field("Extend to sidebar", extSidebar),
						sidebarBlurRow,
						field("Blur message box", extMsgBar),
						msgBarBlurRow,
						React.createElement("div", { style: { padding: "6px 8px", fontSize: 11, color: "var(--dsw-alias-label-secondary)" } },
							"Status: " + status + (hasImage ? "" : "") + (state.extendSidebar || state.extendMsgBar ? " \u00b7 blur applies to the background image" : "")),
						saveNote === "" ? null : React.createElement("div", { style: { padding: "2px 8px", fontSize: 11, color: "#e0685c" } }, saveNote));
				},
			));

			function rowStyle() { return { display: "flex", alignItems: "center", gap: 10, padding: "6px 8px", marginBottom: 2 }; }
			function lblStyle() { return { width: 130, fontSize: 12, color: "var(--dsw-alias-label-secondary)", flex: "none" }; }
			function inp() { return { flex: 1, minWidth: 0, background: "var(--dsw-alias-bg-layer-1)", color: "var(--dsw-alias-label-primary)", border: "1px solid var(--dsw-alias-border-l2)", borderRadius: 6, padding: "4px 6px", fontSize: 12 }; }
			function selStyle() { return { flex: "none", background: "var(--dsw-alias-bg-layer-1)", color: "var(--dsw-alias-label-primary)", border: "1px solid var(--dsw-alias-border-l2)", borderRadius: 6, padding: "3px 4px", fontSize: 12 }; }
			function rngStyle() { return { flex: 1 }; }
			function h3Style() { return { margin: 0, fontSize: 16, fontWeight: 700, color: "var(--dsw-alias-label-primary)" }; }
			function pStyle() { return { margin: "6px 0", fontSize: 12, color: "var(--dsw-alias-label-secondary)" }; }
			function pageStyle() { return { padding: "12px 14px", maxWidth: 540 }; }
		}
		//#endregion

		exports.apply = apply;
		exports.inject = inject;
		return module.exports;
	}
});