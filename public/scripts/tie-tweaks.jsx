/* ============================================================
   Tie Laços — painel de Tweaks (fonte dos títulos + cantos)
   ============================================================ */
const TIE_TWEAK_DEFAULTS = /*EDITMODE-BEGIN*/{
  "headingFont": "Playfair Display",
  "radius": 20
}/*EDITMODE-END*/;

const TIE_FONTS = {
  "Playfair Display": "'Playfair Display', Georgia, serif",
  "Cormorant Garamond": "'Cormorant Garamond', Georgia, serif",
  "DM Serif Display": "'DM Serif Display', Georgia, serif",
  "Quicksand": "'Quicksand', system-ui, sans-serif",
};

function tieApplyTweaks(t) {
  const root = document.documentElement.style;
  root.setProperty('--font-head', TIE_FONTS[t.headingFont] || TIE_FONTS['Playfair Display']);
  root.setProperty('--radius', t.radius + 'px');
}

// Aplica imediatamente o que estiver salvo (sincroniza entre páginas)
(function () {
  let saved = {};
  try { saved = JSON.parse(localStorage.getItem('tie_tweaks')) || {}; } catch (e) {}
  tieApplyTweaks({ ...TIE_TWEAK_DEFAULTS, ...saved });
})();

function TieTweaks() {
  const [t, setTweak] = useTweaks(TIE_TWEAK_DEFAULTS);
  React.useEffect(() => {
    tieApplyTweaks(t);
    try { localStorage.setItem('tie_tweaks', JSON.stringify(t)); } catch (e) {}
  }, [t]);

  return (
    <TweaksPanel title="Tweaks · Tie Laços">
      <TweakSection label="Tipografia" />
      <TweakSelect
        label="Fonte dos títulos"
        value={t.headingFont}
        options={Object.keys(TIE_FONTS)}
        onChange={(v) => setTweak('headingFont', v)}
      />
      <TweakSection label="Forma" />
      <TweakSlider
        label="Cantos arredondados"
        value={t.radius}
        min={4} max={32} step={1} unit="px"
        onChange={(v) => setTweak('radius', v)}
      />
    </TweaksPanel>
  );
}

(function mountTie() {
  const mount = document.getElementById('tie-tweaks-root');
  if (!mount || !window.React || !window.ReactDOM) return;
  ReactDOM.createRoot(mount).render(<TieTweaks />);
})();
