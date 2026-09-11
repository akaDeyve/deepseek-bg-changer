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
		 */
		const STORE_KEY = "dsh.chat-background.settings";
		const DEFAULTS = { enabled: true, image: "", fit: "cover", pos: "center", zoom: 100, dim: 25, surface: 60, posX: 50, posY: 50 };

		const inject = ["slots", "theme"];

		function apply(ctx) {
			const theme = ctx.theme;

			let styleEl = null;
			let disposeTokens = null;
			let current = Object.assign({}, DEFAULTS, readSaved());

			ctx.effect(() => () => {
				if (disposeTokens) { disposeTokens(); disposeTokens = null; }
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

			function applyAll(s) {
				const el = ensureStyleEl();
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
				const dimLayer = dim > 0 ? "linear-gradient(rgba(0,0,0," + (dim / 100) + "), rgba(0,0,0," + (dim / 100) + ")), " : "";

				let css = "";
				css += "body,html{background-image:" + dimLayer + image + ";";
				css += "background-size:" + size + ";background-position:" + posCss + ";background-repeat:no-repeat;";
				css += "background-attachment:fixed;background-color:#101218}\n";
				css += 'div[style*="grid-template-columns"]{background-color:transparent!important}\n';
				el.textContent = css;

				if (surface < 100) {
					const a = (surface / 100).toFixed(3);
					const rgba = (v) => "rgba(" + v + "," + a + ")";
					try {
						disposeTokens = theme.overrideTokens("chat-background", {
							"--dsw-alias-bg-base": { light: "transparent", dark: "transparent" },
							"--dsw-alias-bg-layer-1": { light: rgba("255,255,255"), dark: rgba("44,44,46") },
							"--dsw-alias-bg-layer-2": { light: rgba("255,255,255"), dark: rgba("53,54,56") },
							"--dsw-alias-bg-layer-3": { light: rgba("255,255,255"), dark: rgba("53,54,56") },
							"--dsw-specific-input-major": { light: rgba("255,255,255"), dark: rgba("44,44,46") },
							"--dsw-specific-tip": { light: rgba("245,246,247"), dark: rgba("53,54,56") },
							"--dsw-specific-bubble": { light: rgba("237,243,254"), dark: rgba("44,44,46") },
							"--dsw-specific-selector": { light: rgba("245,246,247"), dark: rgba("53,54,56") },
							"--dsw-specific-sidebar-fill": { light: rgba("249,250,251"), dark: rgba("27,27,28") }
						});
					} catch (e) { /* token overrides are cosmetic; never break the page */ }
				} else if (disposeTokens) {
					disposeTokens();
					disposeTokens = null;
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

					const status = !state.enabled ? "disabled" : (state.image === "" ? "built-in gradient" : "applied");

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
						field("Surface opacity %", React.createElement("input", { type: "range", min: 20, max: 100, value: state.surface, style: rngStyle(), onChange: (e) => upd({ surface: Number(e.target.value) }) })),
						React.createElement("div", { style: { padding: "6px 8px", fontSize: 11, color: "var(--dsw-alias-label-secondary)" } }, "Status: " + status),
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
