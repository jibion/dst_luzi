// Results screen — 2-tab bottom nav: Tarea · Estudiar
// All analysis data comes from props (real Gemini response).

const TABS = [
  { id: 'tarea',    label: 'Tarea',    icon: IcoSparkles, short: 'Tarea'    },
  { id: 'estudiar', label: 'Estudiar', icon: IcoVocab,    short: 'Estudiar' },
];

// ── Platform detection ────────────────────────────────────────────────
const _isIOS     = /iPhone|iPad|iPod/.test(navigator.userAgent) ||
                   (navigator.platform === 'MacIntel' && navigator.maxTouchPoints > 1);
const _isAndroid = /Android/.test(navigator.userAgent);

// ── Web Speech API — explicit German voice selection ──────────────────
let _deVoice = null;
let _deVoiceQuality = 'none'; // 'none' | 'basic' | 'enhanced'

function _pickDeVoice() {
  const voices = (window.speechSynthesis?.getVoices() || []).filter(v => v.lang.startsWith('de'));
  if (!voices.length) return;
  // iOS:     prefer "Anna (Enhanced)" / "Premium" over compact "Anna"
  // Android: Google TTS voices ("Google Deutsch") are good quality — treat as enhanced
  // Fallback: first available German voice
  const enhanced = voices.find(v => /enhanced|premium/i.test(v.name));
  const google   = voices.find(v => /google/i.test(v.name));
  _deVoice = enhanced || google || voices[0];
  _deVoiceQuality = (enhanced || google) ? 'enhanced' : 'basic';
}
if (window.speechSynthesis) {
  _pickDeVoice();
  window.speechSynthesis.addEventListener('voiceschanged', _pickDeVoice);
}

function makeUtterance(text) {
  const u = new SpeechSynthesisUtterance(text);
  u.lang = 'de-DE';
  if (_deVoice) u.voice = _deVoice;
  return u;
}

function useDeVoiceQuality() {
  const [quality, setQuality] = React.useState(() => _deVoiceQuality);
  React.useEffect(() => {
    if (quality === 'enhanced') return;
    const check = () => {
      _pickDeVoice();
      if (_deVoiceQuality !== quality) setQuality(_deVoiceQuality);
    };
    window.speechSynthesis?.addEventListener('voiceschanged', check);
    return () => window.speechSynthesis?.removeEventListener('voiceschanged', check);
  }, [quality]);
  return quality; // 'none' | 'basic' | 'enhanced'
}

// Keep legacy alias so callers using useHasDeVoice still work
function useHasDeVoice() { return useDeVoiceQuality() !== 'none'; }

// ── Tab bars ─────────────────────────────────────────────────────────
function TabBarBottom({ active, setActive }) {
  return (
    <div style={{
      display: 'flex',
      borderTop: '1.5px solid var(--border)',
      boxShadow: '0 -4px 16px rgba(0,0,0,0.07)',
      background: 'var(--surface)',
      padding: '10px 16px calc(8px + var(--safe-bottom))',
      gap: 8,
      flexShrink: 0,
    }}>
      {TABS.map(t => {
        const isActive = active === t.id;
        const Icon = t.icon;
        return (
          <button key={t.id} className="tap" onClick={() => setActive(t.id)} style={{
            flex: 1, cursor: 'pointer', fontFamily: 'inherit',
            background: isActive ? 'var(--accent-soft)' : 'var(--surface-2)',
            border: `1.5px solid ${isActive ? 'var(--accent-line)' : 'var(--border)'}`,
            borderRadius: 'var(--r-md)',
            padding: '10px 0 8px',
            color: isActive ? 'var(--accent)' : 'var(--text-dim)',
            display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 5,
            fontSize: 12, fontWeight: isActive ? 700 : 500,
            transition: 'background .15s ease, border-color .15s ease, color .15s ease',
          }}>
            <Icon size={24} />
            {t.short}
          </button>
        );
      })}
    </div>
  );
}

// ── Source image modal ───────────────────────────────────────────────
function SourceModal({ previewUrl, onClose }) {
  return (
    <div className="sheet-overlay" onClick={onClose} style={{
      position: 'absolute', inset: 0, background: 'rgba(0,0,0,0.65)',
      display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 15, padding: 18,
    }}>
      <div className="sheet-panel" onClick={e => e.stopPropagation()} style={{
        width: '100%', maxHeight: '90%', overflow: 'auto', borderRadius: 'var(--r-lg)',
      }} className="phone-scroll">
        {previewUrl ? (
          <img src={previewUrl} alt="Tarea original" style={{ width: '100%', borderRadius: 'var(--r-lg)', display: 'block' }} />
        ) : (
          <div style={{ padding: 40, textAlign: 'center', color: 'var(--text-dim)' }}>Imagen no disponible</div>
        )}
        <button className="btn btn-soft" onClick={onClose} style={{ width: '100%', marginTop: 12 }}>
          <IcoClose size={16} /> Cerrar
        </button>
      </div>
    </div>
  );
}

// ── Tarea tab (main analysis view) ──────────────────────────────────
function TabTarea({ analysis, child, previewUrl }) {
  const [showSource, setShowSource] = React.useState(false);
  const steps = analysis.suggested_steps || [];
  const chips = [];
  if (analysis.exercise_type) chips.push({ icon: IcoText, label: analysis.exercise_type });
  if (analysis.vocabulary?.length) chips.push({ icon: IcoVocab, label: `${analysis.vocabulary.length} palabras` });

  return (
    <div style={{ padding: '4px 18px 18px', animation: 'fadeUp .25s ease both' }}>
      {/* Source preview card */}
      <button className="tap" onClick={() => setShowSource(true)} style={{
        width: '100%', cursor: 'pointer', fontFamily: 'inherit',
        background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 'var(--r-md)',
        padding: '10px', display: 'flex', alignItems: 'center', gap: 12, textAlign: 'left',
      }}>
        <div style={{
          width: 56, height: 64, borderRadius: 'var(--r-xs)', flexShrink: 0,
          overflow: 'hidden', background: 'var(--surface-2)',
          border: '1px solid rgba(0,0,0,0.08)',
        }}>
          {previewUrl
            ? <img src={previewUrl} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }} />
            : <div style={{ width: '100%', height: '100%', background: 'var(--surface-3)' }} />
          }
        </div>
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ fontFamily: 'var(--font-mono)', fontSize: 10, color: 'var(--text-faint)', letterSpacing: 1.2, textTransform: 'uppercase' }}>FUENTE · IMAGEN ORIGINAL</div>
          <div style={{ fontSize: 13.5, fontWeight: 500, color: 'var(--text)', marginTop: 2, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
            {analysis.title || 'Tarea analizada'}
          </div>
          <div style={{ fontSize: 11.5, color: 'var(--text-dim)', marginTop: 2 }}>Toca para ver la imagen original</div>
        </div>
        <IcoArrowRight size={16} color="var(--text-dim)" />
      </button>

      {/* What the task asks */}
      <div style={{ display: 'flex', alignItems: 'flex-start', gap: 10, marginTop: 18 }}>
        <div style={{ width: 38, height: 38, borderRadius: 'var(--r-sm)', background: 'var(--accent-soft)', color: 'var(--accent)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
          <IcoText size={18} />
        </div>
        <div>
          <div style={{ fontFamily: 'var(--font-mono)', fontSize: 10, color: 'var(--text-faint)', letterSpacing: 1.5, textTransform: 'uppercase' }}>Qué pide la tarea</div>
          <div style={{ fontFamily: 'var(--font-display)', fontWeight: 'var(--display-weight)', fontSize: 19, lineHeight: 1.2, letterSpacing: 'var(--display-tracking)', marginTop: 2 }}>
            {analysis.exercise_type || 'Ejercicio'}
          </div>
        </div>
      </div>

      <div className="card" style={{ marginTop: 14, padding: 16 }}>
        <p style={{ margin: 0, fontSize: 14, lineHeight: 1.6, color: 'var(--text)' }}>
          {analysis.description}
        </p>
        {chips.length > 0 && (
          <div style={{ marginTop: 12, display: 'flex', gap: 8, flexWrap: 'wrap' }}>
            {chips.map((c, i) => (
              <span key={i} className="chip"><c.icon size={11} /> {c.label}</span>
            ))}
          </div>
        )}
      </div>

      {/* How to help */}
      <div style={{ display: 'flex', alignItems: 'flex-start', gap: 10, marginTop: 18 }}>
        <div style={{ width: 38, height: 38, borderRadius: 'var(--r-sm)', background: 'var(--accent-soft)', color: 'var(--accent)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
          <IcoLightbulb size={18} />
        </div>
        <div>
          <div style={{ fontFamily: 'var(--font-mono)', fontSize: 10, color: 'var(--text-faint)', letterSpacing: 1.5, textTransform: 'uppercase' }}>Cómo acompañar</div>
          <div style={{ fontFamily: 'var(--font-display)', fontWeight: 'var(--display-weight)', fontSize: 19, lineHeight: 1.2, letterSpacing: 'var(--display-tracking)', marginTop: 2 }}>
            Sin hacer la tarea por {child.name || 'tu hijo'}
          </div>
        </div>
      </div>

      <div className="card" style={{ marginTop: 14, padding: 16, borderColor: 'var(--accent-line)', background: 'var(--accent-soft)' }}>
        <p style={{ margin: 0, fontSize: 14, lineHeight: 1.6, color: 'var(--text)' }}>
          {analysis.help_suggestion}
        </p>
      </div>

      {steps.length > 0 && (
        <>
          <div style={{ marginTop: 18, fontFamily: 'var(--font-mono)', fontSize: 10, color: 'var(--text-faint)', letterSpacing: 1.5, textTransform: 'uppercase', marginBottom: 8 }}>
            Pasos sugeridos
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            {steps.map((text, n) => <Step key={n} n={n + 1} text={text} />)}
          </div>
        </>
      )}

      {showSource && <SourceModal previewUrl={previewUrl} onClose={() => setShowSource(false)} />}
    </div>
  );
}

function Step({ n, text }) {
  return (
    <div className="card" style={{ padding: '12px 14px', display: 'flex', gap: 12, alignItems: 'center' }}>
      <div style={{
        width: 26, height: 26, borderRadius: '50%', background: 'var(--surface-2)',
        border: '1px solid var(--border)', color: 'var(--text-dim)',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        fontFamily: 'var(--font-mono)', fontSize: 12, fontWeight: 500, flexShrink: 0,
      }}>{n}</div>
      <div style={{ fontSize: 13.5, color: 'var(--text)', lineHeight: 1.5 }}>{text}</div>
    </div>
  );
}

// ── Estudiar tab — adapts to exercise type ───────────────────────────
function TabEstudiar({ analysis }) {
  const isLectura   = analysis.exercise_type === 'Lectura';
  const hasSentences = (analysis.sentences?.length > 0) || !!analysis.full_text;
  const hasVocab     = analysis.vocabulary?.length > 0;
  const showToggle   = hasSentences && hasVocab;
  const firstTab     = hasSentences ? 'sentences' : 'palabras';
  const sentenceLabel = isLectura ? 'Texto' : 'Ejercicio';
  const [mode, setMode] = React.useState(firstTab);
  const voiceQuality = useDeVoiceQuality();

  const voiceBanner = voiceQuality === 'none'
    ? { text: _isIOS
        ? 'Sin voz alemana. Ajustes → Accesibilidad → Contenido hablado → Voces → Alemán → descargar.'
        : _isAndroid
          ? 'Sin voz alemana. Ajustes → Gestión general → Texto a voz → Google TTS → Alemán → descargar.'
          : 'Sin voz alemana instalada en el sistema.' }
    : voiceQuality === 'basic'
    ? { text: _isIOS
        ? 'Voz básica (suena robótica). Descarga la voz mejorada: Ajustes → Accesibilidad → Contenido hablado → Voces → Alemán → Anna (Mejorada).'
        : _isAndroid
          ? 'Voz básica detectada. Actualiza Google TTS en Play Store y asegúrate de tener el alemán descargado.'
          : 'Voz básica detectada. Instala una voz alemana de mayor calidad en los ajustes del sistema.' }
    : null;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
      <div style={{ padding: '4px 18px 12px', flexShrink: 0 }}>
        {voiceBanner && (
          <div style={{ display: 'flex', alignItems: 'flex-start', gap: 8, padding: '8px 12px', marginBottom: 10, borderRadius: 'var(--r-sm)', background: 'rgba(255,160,0,0.1)', border: '1px solid rgba(255,160,0,0.3)' }}>
            <span style={{ fontSize: 14, flexShrink: 0 }}>⚠️</span>
            <span style={{ fontSize: 12, color: 'var(--text-dim)', lineHeight: 1.4 }}>
              {voiceBanner.text}
            </span>
          </div>
        )}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 10 }}>
          <div>
            <div style={{ fontFamily: 'var(--font-mono)', fontSize: 10, color: 'var(--text-faint)', letterSpacing: 1.5, textTransform: 'uppercase' }}>
              Material adaptado · {analysis.exercise_type || 'Ejercicio'}
            </div>
            <div style={{ fontFamily: 'var(--font-display)', fontWeight: 'var(--display-weight)', fontSize: 22, letterSpacing: 'var(--display-tracking)', marginTop: 2 }}>
              Estudiar juntos
            </div>
          </div>
          <span className="chip" style={{ background: 'var(--accent-soft)', color: 'var(--accent)', borderColor: 'var(--accent-line)' }}>
            <IcoSparkles size={11} /> IA
          </span>
        </div>

        {showToggle && (
          <div style={{ display: 'flex', background: 'var(--surface-2)', borderRadius: 999, padding: 3, border: '1px solid var(--border)' }}>
            {[{ id: 'sentences', label: sentenceLabel }, { id: 'palabras', label: 'Palabras' }].map(o => {
              const active = mode === o.id;
              return (
                <button key={o.id} className="tap" onClick={() => setMode(o.id)} style={{
                  flex: 1, cursor: 'pointer', fontFamily: 'inherit',
                  background: active ? 'var(--accent)' : 'transparent',
                  color: active ? 'var(--accent-on)' : 'var(--text-dim)',
                  border: 0, borderRadius: 999, padding: '8px 0', fontSize: 13, fontWeight: 600,
                }}>{o.label}</button>
              );
            })}
          </div>
        )}
      </div>

      <div style={{ flex: 1, overflow: 'auto' }} className="phone-scroll" key={mode}>
        {mode === 'sentences'
          ? <LyricsReader sentences={analysis.sentences || []} fullText={analysis.full_text || ''} />
          : <WordDeck vocabulary={analysis.vocabulary || []} />
        }
      </div>
    </div>
  );
}

// iOS-Music-lyrics-style sentence reader with TTS controls
function LyricsReader({ sentences, fullText }) {
  const [focus, setFocus] = React.useState(0);
  const [textOpen, setTextOpen] = React.useState(!!fullText);
  const [playing, setPlaying] = React.useState(null); // index | 'all' | null
  const timerRef = React.useRef(null);
  const abortRef = React.useRef(false);

  const stopAll = React.useCallback(() => {
    abortRef.current = true;
    if (timerRef.current) { clearTimeout(timerRef.current); timerRef.current = null; }
    window.speechSynthesis?.cancel();
    setPlaying(null);
  }, []);

  React.useEffect(() => () => stopAll(), [stopAll]);

  const playLine = (i, e) => {
    e.stopPropagation();
    if (playing === 'all') stopAll();
    window.speechSynthesis?.cancel();
    setFocus(i);
    setPlaying(i);
    const u = makeUtterance(sentences[i].de);
    u.onend = () => setPlaying(null);
    u.onerror = () => setPlaying(null);
    window.speechSynthesis?.speak(u);
  };

  const playAll = () => {
    if (playing === 'all') { stopAll(); return; }
    abortRef.current = false;
    window.speechSynthesis?.cancel();
    setPlaying('all');
    const speakNext = (i) => {
      if (abortRef.current || i >= sentences.length) { if (!abortRef.current) setPlaying(null); return; }
      setFocus(i);
      const u = makeUtterance(sentences[i].de);
      u.onend = () => speakNext(i + 1);
      u.onerror = () => { if (!abortRef.current) setPlaying(null); };
      window.speechSynthesis.speak(u);
    };
    speakNext(0);
  };

  if (sentences.length === 0) {
    return (
      <div style={{ padding: '24px 18px', textAlign: 'center', color: 'var(--text-dim)', fontSize: 14 }}>
        No hay texto disponible para este ejercicio.
      </div>
    );
  }

  return (
    <div style={{ padding: '4px 18px 24px', animation: 'fadeUp .25s ease both' }}>

      {/* Full text panel */}
      {fullText && (
        <div style={{ marginBottom: 16, borderRadius: 'var(--r-md)', border: '1px solid var(--border)', overflow: 'hidden' }}>
          <button className="tap" onClick={() => setTextOpen(o => !o)} style={{
            width: '100%', cursor: 'pointer', fontFamily: 'inherit', textAlign: 'left',
            background: 'var(--surface-2)', border: 0, padding: '10px 14px',
            display: 'flex', alignItems: 'center', justifyContent: 'space-between',
            color: 'var(--text-dim)', fontSize: 12, fontWeight: 600, letterSpacing: 0.5,
          }}>
            <span>TEXTO ORIGINAL</span>
            <span style={{ fontSize: 16, transform: textOpen ? 'rotate(180deg)' : 'none', transition: 'transform .2s' }}>›</span>
          </button>
          {textOpen && (
            <div style={{
              padding: '12px 14px 16px', background: 'var(--surface)',
              fontFamily: 'var(--font-serif)', fontSize: 15, lineHeight: 1.7,
              color: 'var(--text)', whiteSpace: 'pre-wrap',
            }}>
              {fullText}
            </div>
          )}
        </div>
      )}

      {/* Play-all bar */}
      <button className="tap" onClick={playAll} style={{
        width: '100%', cursor: 'pointer', fontFamily: 'inherit', textAlign: 'left',
        background: playing === 'all' ? 'var(--accent)' : 'var(--accent-soft)',
        color: playing === 'all' ? 'var(--accent-on)' : 'var(--text)',
        border: `1px solid ${playing === 'all' ? 'var(--accent)' : 'var(--accent-line)'}`,
        borderRadius: 'var(--r-md)', padding: '12px 14px',
        display: 'flex', alignItems: 'center', gap: 12, marginBottom: 16,
        transition: 'background .2s ease, color .2s ease',
      }}>
        <div style={{
          width: 40, height: 40, borderRadius: '50%', flexShrink: 0,
          background: playing === 'all' ? 'rgba(255,255,255,0.18)' : 'var(--accent)',
          color: 'var(--accent-on)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
        }}>
          {playing === 'all'
            ? <div style={{ width: 12, height: 12, background: 'currentColor', borderRadius: 2 }} />
            : <PlayTriangle />}
        </div>
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ fontSize: 14, fontWeight: 600 }}>
            {playing === 'all' ? 'Reproduciendo…' : 'Escuchar el texto'}
          </div>
          <div style={{ fontSize: 12, opacity: 0.8, marginTop: 1 }}>
            Voz alemana nativa · {sentences.length} oración{sentences.length !== 1 ? 'es' : ''}
          </div>
        </div>
        {playing === 'all' && <WavesPlaying />}
      </button>

      <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
        {sentences.map((line, i) => {
          const active = focus === i;
          const dim = focus != null && !active;
          const isLinePlaying = playing === i || (playing === 'all' && focus === i);
          return (
            <div key={i} style={{ display: 'flex', alignItems: 'flex-start', gap: 4 }}>
              <button className="tap" onClick={() => setFocus(active ? null : i)} style={{
                flex: 1, cursor: 'pointer', fontFamily: 'inherit', textAlign: 'left',
                background: 'transparent', border: 0, padding: '8px 4px',
                borderRadius: 'var(--r-sm)', transition: 'all .25s ease', minWidth: 0,
              }}>
                <div style={{
                  fontFamily: 'var(--font-serif)',
                  fontSize: active ? 22 : 18,
                  lineHeight: 1.3,
                  fontWeight: active ? 600 : 500,
                  color: active ? 'var(--text)' : (dim ? 'var(--text-faint)' : 'var(--text-dim)'),
                  letterSpacing: active ? '-0.005em' : 0,
                  transition: 'all .25s ease',
                  opacity: dim ? 0.55 : 1,
                  filter: dim ? 'blur(0.3px)' : 'none',
                }}>{line.de}</div>
                <div style={{
                  maxHeight: active ? 80 : 0,
                  opacity: active ? 1 : 0,
                  overflow: 'hidden',
                  transition: 'max-height .35s ease, opacity .25s ease, margin-top .25s ease',
                  marginTop: active ? 6 : 0,
                  fontSize: 14, lineHeight: 1.45,
                  color: 'var(--accent)', fontStyle: 'italic',
                }}>{line.es}</div>
              </button>
              <button className="tap" onClick={(e) => playLine(i, e)} aria-label="Leer esta oración" style={{
                width: 34, height: 34, borderRadius: '50%', border: 0,
                background: isLinePlaying ? 'var(--accent)' : 'transparent',
                color: isLinePlaying ? 'var(--accent-on)' : 'var(--text-faint)',
                cursor: 'pointer', flexShrink: 0,
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                marginTop: 6, transition: 'background .2s ease, color .2s ease',
              }}>
                {isLinePlaying ? <WavesPlaying /> : <IcoVolumeOn size={15} />}
              </button>
            </div>
          );
        })}
      </div>

      <div className="card" style={{ marginTop: 18, padding: 14, display: 'flex', gap: 10 }}>
        <IcoLightbulb size={18} color="var(--accent)" />
        <div style={{ fontSize: 12.5, color: 'var(--text-dim)', lineHeight: 1.5 }}>
          Reproduce el texto completo, o toca el altavoz junto a cada frase para oírla sola.
        </div>
      </div>
    </div>
  );
}

function PlayTriangle() {
  return (
    <svg width="14" height="14" viewBox="0 0 14 14" style={{ marginLeft: 2 }}>
      <path d="M3 2 L12 7 L3 12 Z" fill="currentColor" />
    </svg>
  );
}

// Flip-card vocabulary deck
function WordDeck({ vocabulary }) {
  const [flipped, setFlipped] = React.useState(new Set());
  const [playing, setPlaying] = React.useState(null);

  const toggle = (key) => setFlipped(prev => {
    const next = new Set(prev);
    next.has(key) ? next.delete(key) : next.add(key);
    return next;
  });

  const play = (key, german, e) => {
    e.stopPropagation();
    if (playing || !window.speechSynthesis) return;
    setPlaying(key);
    const u = makeUtterance(german);
    u.onend = () => setPlaying(null);
    u.onerror = () => setPlaying(null);
    window.speechSynthesis.speak(u);
  };

  if (vocabulary.length === 0) {
    return (
      <div style={{ padding: '24px 18px', textAlign: 'center', color: 'var(--text-dim)', fontSize: 14 }}>
        No se encontró vocabulario específico para este ejercicio.
      </div>
    );
  }

  return (
    <div style={{ padding: '8px 18px 24px', animation: 'fadeUp .25s ease both' }}>
      <div style={{
        display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12,
        fontFamily: 'var(--font-mono)', fontSize: 10, color: 'var(--text-faint)', letterSpacing: 1.5, textTransform: 'uppercase',
      }}>
        <span>{vocabulary.length} palabras · toca para girar</span>
        <span>{flipped.size}/{vocabulary.length} vistas</span>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
        {vocabulary.map((w, idx) => {
          const key = w.german + idx;
          const isFlip = flipped.has(key);
          const isPlay = playing === key;
          return (
            <div key={key} className="tap" onClick={() => toggle(key)} style={{ cursor: 'pointer', height: 110, perspective: 1000 }}>
              <div style={{
                width: '100%', height: '100%', position: 'relative',
                transformStyle: 'preserve-3d',
                transition: 'transform .5s cubic-bezier(0.2,0.8,0.2,1)',
                transform: isFlip ? 'rotateY(180deg)' : 'none',
              }}>
                {/* Front: German */}
                <div style={{
                  position: 'absolute', inset: 0, backfaceVisibility: 'hidden',
                  background: 'var(--surface)', border: '1px solid var(--border)',
                  borderRadius: 'var(--r-md)', padding: 12,
                  display: 'flex', flexDirection: 'column', justifyContent: 'space-between',
                }}>
                  <div style={{ fontFamily: 'var(--font-mono)', fontSize: 9, color: 'var(--text-faint)', letterSpacing: 1.2, textTransform: 'uppercase' }}>DE</div>
                  <div style={{ fontFamily: 'var(--font-serif)', fontWeight: 600, fontSize: 22, color: 'var(--text)', lineHeight: 1.15 }}>
                    {w.article_de && <span style={{ fontWeight: 400, color: 'var(--text)', fontSize: 22, marginRight: 5 }}>{w.article_de}</span>}
                    {w.german}
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                    {w.word_type && <span style={{ fontFamily: 'var(--font-mono)', fontSize: 9, color: 'var(--accent)', background: 'var(--accent-soft)', border: '1px solid var(--accent-line)', borderRadius: 4, padding: '1px 5px', letterSpacing: 0.5 }}>{w.word_type}</span>}
                    <button className="tap" onClick={(e) => play(key, (w.article_de ? w.article_de + ' ' : '') + w.german, e)} aria-label="Reproducir" style={{
                      width: 28, height: 28, borderRadius: '50%', border: 0, cursor: 'pointer',
                      background: isPlay ? 'var(--accent)' : 'var(--surface-2)',
                      color: isPlay ? 'var(--accent-on)' : 'var(--accent)',
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                    }}>
                      {isPlay ? <WavesPlaying /> : <IcoVolumeOn size={14} />}
                    </button>
                  </div>
                </div>
                {/* Back: Spanish */}
                <div style={{
                  position: 'absolute', inset: 0, backfaceVisibility: 'hidden',
                  background: 'var(--accent-soft)', border: '1px solid var(--accent-line)',
                  borderRadius: 'var(--r-md)', padding: 12,
                  display: 'flex', flexDirection: 'column', justifyContent: 'space-between',
                  transform: 'rotateY(180deg)',
                }}>
                  <div style={{ fontFamily: 'var(--font-mono)', fontSize: 9, color: 'var(--accent)', letterSpacing: 1.2, textTransform: 'uppercase', opacity: 0.8 }}>ES</div>
                  <div style={{ fontFamily: 'var(--font-display)', fontWeight: 'var(--display-weight)', fontSize: 22, color: 'var(--text)', lineHeight: 1.15, letterSpacing: 'var(--display-tracking)' }}>
                    {w.article_es && <span style={{ fontWeight: 400, opacity: 0.5, marginRight: 5 }}>{w.article_es}</span>}
                    {w.spanish}
                  </div>
                  <div style={{ fontSize: 10.5, color: 'var(--text-dim)' }}>
                    {w.article_de && <span style={{ color: 'var(--text-faint)' }}>{w.article_de} </span>}
                    <span style={{ fontFamily: 'var(--font-serif)', fontWeight: 600 }}>{w.german}</span>
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

function WavesPlaying() {
  const bars = [0, 0.12, 0.24, 0.36, 0.18];
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 2, height: 12 }}>
      {bars.map((d, i) => (
        <div key={i} style={{
          width: 2, height: 12, background: 'currentColor', borderRadius: 1,
          animation: `wave 0.9s ease-in-out ${d}s infinite`,
          transformOrigin: 'center',
        }} />
      ))}
    </div>
  );
}

// ── Revisar tab ───────────────────────────────────────────────────────
function _getCachedCorrection(file) {
  try {
    const map = JSON.parse(localStorage.getItem('luzi_corrections') || '{}');
    const key = `${file.name}|${file.size}|${file.lastModified}`;
    const e = map[key];
    return e && Date.now() - e.ts < 24 * 60 * 60 * 1000 ? e.data : null;
  } catch { return null; }
}
function _setCachedCorrection(file, data) {
  try {
    const map = JSON.parse(localStorage.getItem('luzi_corrections') || '{}');
    const key = `${file.name}|${file.size}|${file.lastModified}`;
    map[key] = { ts: Date.now(), data };
    const keys = Object.keys(map).sort((a, b) => map[a].ts - map[b].ts);
    if (keys.length > 10) keys.slice(0, keys.length - 10).forEach(k => delete map[k]);
    localStorage.setItem('luzi_corrections', JSON.stringify(map));
  } catch {}
}

function TabRevisar({ child, previewUrl, analysis }) {
  const [stage, setStage] = React.useState('idle');
  const [pickedFile, setPickedFile] = React.useState(null);
  const [pickedUrl, setPickedUrl] = React.useState(null);
  const [results, setResults] = React.useState(null);
  const [analyzeError, setAnalyzeError] = React.useState(null);
  const fileRef = React.useRef(null);

  const handleFilePick = e => {
    const file = e.target.files?.[0];
    if (file) {
      if (pickedUrl) URL.revokeObjectURL(pickedUrl);
      setPickedFile(file);
      setPickedUrl(URL.createObjectURL(file));
    }
    e.target.value = '';
  };

  const analyze = async () => {
    if (!pickedFile) return;

    const cached = _getCachedCorrection(pickedFile);
    if (cached) { setResults(cached); setStage('done'); return; }

    setStage('analyzing');
    setAnalyzeError(null);

    const fd = new FormData();
    fd.append('file', pickedFile);
    fd.append('sentences', JSON.stringify(analysis?.sentences || []));
    fd.append('child_name', child.name || '');
    fd.append('child_age', String(child.age || 8));

    try {
      const res = await fetch('/api/correct', { method: 'POST', body: fd });
      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        if (res.status === 429) throw new Error(err.detail || 'Límite alcanzado. Inténtalo en un momento.');
        throw new Error(err.detail || `Error ${res.status}`);
      }
      const data = await res.json();
      setResults(data);
      _setCachedCorrection(pickedFile, data);
      setStage('done');
    } catch (err) {
      setAnalyzeError(err.message || 'No se pudo conectar con el servidor.');
      setStage('error');
    }
  };

  const reset = () => {
    setStage('idle');
    setPickedFile(null);
    setResults(null);
    setAnalyzeError(null);
    if (pickedUrl) URL.revokeObjectURL(pickedUrl);
    setPickedUrl(null);
  };

  return (
    <div style={{ padding: '4px 18px 18px', animation: 'fadeUp .25s ease both' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 14 }}>
        <div>
          <div style={{ fontFamily: 'var(--font-mono)', fontSize: 10, color: 'var(--text-faint)', letterSpacing: 1.5, textTransform: 'uppercase' }}>Verificación con IA</div>
          <div style={{ fontFamily: 'var(--font-display)', fontWeight: 'var(--display-weight)', fontSize: 22, letterSpacing: 'var(--display-tracking)', marginTop: 2 }}>
            ¿Cómo le quedó?
          </div>
        </div>
        <span className="chip" style={{ background: 'var(--accent-soft)', color: 'var(--accent)', borderColor: 'var(--accent-line)', fontWeight: 600 }}>
          <IcoBolt size={11} /> Beta
        </span>
      </div>

      {stage === 'idle'      && (
        <RevisarIdle
          child={child} previewUrl={previewUrl}
          pickedUrl={pickedUrl} pickedFile={pickedFile}
          fileRef={fileRef} onFilePick={handleFilePick}
          onAnalyze={analyze}
        />
      )}
      {stage === 'analyzing' && <RevisarAnalyzing />}
      {stage === 'done'      && <RevisarResults items={results?.items || []} summary={results?.summary || ''} onAgain={reset} />}
      {stage === 'error'     && (
        <div style={{ marginTop: 14, padding: 16, borderRadius: 'var(--r-lg)', background: 'var(--surface)', border: '1px solid var(--accent-line)', textAlign: 'center' }}>
          <div style={{ fontSize: 14, color: 'var(--text)', marginBottom: 12, lineHeight: 1.45 }}>{analyzeError}</div>
          <button className="btn btn-soft" onClick={reset} style={{ width: '100%' }}>Volver a intentar</button>
        </div>
      )}
    </div>
  );
}

function RevisarIdle({ child, previewUrl, pickedUrl, pickedFile, fileRef, onFilePick, onAnalyze }) {
  return (
    <>
      {/* Original task reference card */}
      <div style={{
        background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 'var(--r-md)',
        padding: 10, display: 'flex', alignItems: 'center', gap: 12, marginBottom: 10,
      }}>
        <div style={{ width: 48, height: 56, borderRadius: 'var(--r-xs)', flexShrink: 0, overflow: 'hidden', background: 'var(--surface-2)' }}>
          {previewUrl
            ? <img src={previewUrl} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }} />
            : <div style={{ width: '100%', height: '100%', background: 'var(--surface-3)' }} />
          }
        </div>
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ fontFamily: 'var(--font-mono)', fontSize: 9.5, color: 'var(--text-faint)', letterSpacing: 1.2, textTransform: 'uppercase' }}>ORIGINAL · ANALIZADA</div>
          <div style={{ fontSize: 13, fontWeight: 500, color: 'var(--text)', marginTop: 2 }}>Tarea subida</div>
        </div>
        <span style={{ width: 22, height: 22, borderRadius: '50%', background: 'var(--accent-soft)', color: 'var(--accent)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <IcoCheck size={13} />
        </span>
      </div>

      {/* Divider */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '4px 0', fontFamily: 'var(--font-mono)', fontSize: 10, color: 'var(--text-faint)', letterSpacing: 1.5 }}>
        <div style={{ flex: 1, height: 1, background: 'var(--border)' }} />
        COMPARAR CON
        <div style={{ flex: 1, height: 1, background: 'var(--border)' }} />
      </div>

      {/* Hidden file input */}
      <input ref={fileRef} type="file" accept="image/*,.pdf,application/pdf" style={{ display: 'none' }} onChange={onFilePick} />

      {/* Upload card — same language as Home */}
      <button className="tap" onClick={() => fileRef.current?.click()} style={{
        marginTop: 10, cursor: 'pointer', fontFamily: 'inherit',
        width: '100%', padding: '22px 20px', textAlign: 'left',
        background: pickedUrl ? 'var(--surface)' : 'var(--accent-soft)', color: 'var(--text)',
        border: `1px solid ${pickedUrl ? 'var(--border)' : 'var(--accent-line)'}`,
        borderRadius: 'var(--r-lg)',
        display: 'flex', flexDirection: 'column', gap: 16, position: 'relative', overflow: 'hidden',
      }}>
        <div style={{ position: 'absolute', right: -60, bottom: -80, width: 220, height: 220, borderRadius: '50%', background: 'var(--accent)', opacity: 0.08 }} />
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', position: 'relative' }}>
          {pickedUrl ? (
            <img src={pickedUrl} alt="Tarea completada" style={{ width: 56, height: 64, objectFit: 'cover', borderRadius: 'var(--r-sm)', border: '1px solid var(--border)' }} />
          ) : (
            <div style={{ width: 56, height: 56, borderRadius: 'var(--r-md)', background: 'var(--accent)', color: 'var(--accent-on)', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 6px 18px rgba(0,0,0,0.15)' }}>
              <IcoCheckCircle size={26} />
            </div>
          )}
          <span className="chip" style={{ background: 'rgba(0,0,0,0.06)', color: 'var(--accent)', borderColor: 'var(--accent-line)', fontWeight: 600 }}>
            <IcoSparkles size={11} /> Gemini Vision
          </span>
        </div>
        <div style={{ position: 'relative' }}>
          <div style={{ fontFamily: 'var(--font-display)', fontWeight: 'var(--display-weight)', fontSize: 22, lineHeight: 1.15, letterSpacing: 'var(--display-tracking)' }}>
            {pickedUrl ? 'Tarea completada lista' : 'Subir tarea completada'}
          </div>
          <div style={{ fontSize: 13, color: 'var(--text-dim)', marginTop: 6, lineHeight: 1.45 }}>
            {pickedUrl ? (pickedFile?.name || '') : `Toma una foto de la hoja con las respuestas de ${child.name || 'tu hijo'} y la comparamos con el original.`}
          </div>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', borderTop: '1px solid var(--accent-line)', paddingTop: 12, position: 'relative' }}>
          <div style={{ display: 'flex', gap: 14, color: 'var(--accent)', opacity: 0.85 }}>
            <IcoCamera size={18} /><IcoImage size={18} /><IcoBook size={18} />
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 6, color: 'var(--accent)', fontWeight: 600, fontSize: 13 }}>
            {pickedUrl ? 'Cambiar' : 'Seleccionar'} <IcoArrowRight size={16} />
          </div>
        </div>
      </button>

      {pickedUrl && (
        <button className="btn btn-primary" onClick={onAnalyze} style={{ width: '100%', marginTop: 10 }}>
          <IcoSparkles size={18} /> Analizar <IcoArrowRight size={16} />
        </button>
      )}

      {/* Beta status strip */}
      <div style={{ marginTop: 14, padding: 12, borderRadius: 'var(--r-sm)', background: 'var(--surface-2)', border: '1px solid var(--border)', display: 'flex', gap: 10, alignItems: 'center' }}>
        <div style={{ width: 28, height: 28, borderRadius: '50%', flexShrink: 0, background: 'var(--accent-soft)', color: 'var(--accent)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <IcoBolt size={14} />
        </div>
        <div style={{ flex: 1 }}>
          <div style={{ fontSize: 12.5, fontWeight: 500, color: 'var(--text)' }}>Verificación visual en pruebas</div>
          <div style={{ fontSize: 11.5, color: 'var(--text-dim)', marginTop: 1 }}>v0.4 beta · resultados con margen de error.</div>
        </div>
        <div style={{ width: 6, height: 6, borderRadius: '50%', background: 'var(--accent)', animation: 'pulse 1.6s ease-in-out infinite' }} />
      </div>
    </>
  );
}

function RevisarAnalyzing() {
  const lines = ['Leyendo la respuesta…', 'Comparando con el original…', 'Marcando aciertos…'];
  const [i, setI] = React.useState(0);
  React.useEffect(() => {
    const t = setInterval(() => setI(v => (v + 1) % lines.length), 900);
    return () => clearInterval(t);
  }, []);
  return (
    <div style={{ padding: '40px 20px', textAlign: 'center', animation: 'fadeUp .25s ease both', border: '1px solid var(--border)', borderRadius: 'var(--r-lg)', background: 'var(--surface)' }}>
      <div style={{ position: 'relative', width: 96, height: 96, margin: '0 auto' }}>
        <div style={{ position: 'absolute', inset: 0, borderRadius: '50%', border: '2px solid var(--border)' }} />
        <div style={{ position: 'absolute', inset: 0, borderRadius: '50%', border: '2px solid transparent', borderTopColor: 'var(--accent)', borderRightColor: 'var(--accent)', animation: 'spin 1.2s linear infinite' }} />
        <div style={{ position: 'absolute', inset: 14, borderRadius: '50%', background: 'var(--accent-soft)', color: 'var(--accent)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <IcoCheckCircle size={28} />
        </div>
      </div>
      <div style={{ marginTop: 20, fontSize: 15, fontWeight: 500, color: 'var(--text)' }}>{lines[i]}</div>
      <div style={{ marginTop: 6, fontSize: 12, color: 'var(--text-dim)' }}>Tarda unos segundos.</div>
    </div>
  );
}

function RevisarResults({ items, summary, onAgain }) {
  const ok    = items.filter(a => a.status === 'ok').length;
  const total = items.length;
  const pct   = total > 0 ? Math.round((ok / total) * 100) : 0;

  const statusDot = status => {
    if (status === 'ok')      return { bg: '#1f8a5b', icon: <IcoCheck size={14} /> };
    if (status === 'partial') return { bg: '#b45309', icon: <span style={{ fontSize: 14, fontWeight: 700 }}>~</span> };
    return { bg: 'var(--accent)', icon: <span style={{ fontSize: 13, fontWeight: 700 }}>!</span> };
  };

  return (
    <div style={{ animation: 'fadeUp .3s ease both' }}>
      <div style={{ padding: 18, borderRadius: 'var(--r-lg)', background: 'var(--accent-soft)', border: '1px solid var(--accent-line)', position: 'relative', overflow: 'hidden' }}>
        <div style={{ position: 'absolute', right: -40, top: -40, width: 160, height: 160, borderRadius: '50%', background: 'var(--accent)', opacity: 0.08 }} />
        <div style={{ display: 'flex', alignItems: 'flex-end', gap: 16, position: 'relative' }}>
          <div style={{ fontFamily: 'var(--font-display)', fontWeight: 'var(--display-weight)', fontSize: 56, color: 'var(--accent)', lineHeight: 0.9, letterSpacing: '-0.03em' }}>
            {ok}<span style={{ fontSize: 22, color: 'var(--text-dim)' }}>/{total}</span>
          </div>
          <div style={{ flex: 1, paddingBottom: 4 }}>
            <div style={{ fontSize: 13, color: 'var(--text-dim)', lineHeight: 1.4 }}>{summary}</div>
          </div>
        </div>
        <div style={{ marginTop: 14, height: 6, borderRadius: 4, background: 'rgba(0,0,0,0.08)', overflow: 'hidden', position: 'relative' }}>
          <div style={{ position: 'absolute', left: 0, top: 0, bottom: 0, width: `${pct}%`, background: 'var(--accent)', borderRadius: 4, transition: 'width .8s cubic-bezier(0.2,0.8,0.2,1)' }} />
        </div>
      </div>

      {items.length > 0 && (
        <>
          <div style={{ marginTop: 18, fontFamily: 'var(--font-mono)', fontSize: 10, color: 'var(--text-faint)', letterSpacing: 1.5, textTransform: 'uppercase', marginBottom: 10 }}>
            Respuestas detectadas
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            {items.map((a, i) => {
              const s = statusDot(a.status);
              return (
                <div key={i} className="card" style={{ padding: 12, display: 'flex', gap: 10, alignItems: 'flex-start', borderColor: a.status !== 'ok' ? 'var(--accent-line)' : 'var(--border)' }}>
                  <div style={{ width: 26, height: 26, borderRadius: '50%', flexShrink: 0, background: s.bg, color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', marginTop: 1 }}>
                    {s.icon}
                  </div>
                  <div style={{ flex: 1 }}>
                    <div style={{ fontFamily: 'var(--font-serif)', fontWeight: 600, fontSize: 14, color: 'var(--text)', lineHeight: 1.3 }}>{a.question}</div>
                    {a.note && <div style={{ fontSize: 12, color: 'var(--text-dim)', marginTop: 3 }}>{a.note}</div>}
                  </div>
                </div>
              );
            })}
          </div>
        </>
      )}

      <div style={{ display: 'flex', gap: 8, marginTop: 14 }}>
        <button className="btn btn-soft" onClick={onAgain} style={{ flex: 1 }}>
          <IcoUpload size={16} /> Subir otra
        </button>
      </div>
    </div>
  );
}

// ── Results wrapper ───────────────────────────────────────────────────
function ResultsScreen({ analysis, previewUrl, child, onSettings, onNew }) {
  const [active, setActive] = React.useState('tarea');

  let content = null;
  if (active === 'tarea')    content = <TabTarea    analysis={analysis} child={child} previewUrl={previewUrl} />;
  else if (active === 'estudiar') content = <TabEstudiar analysis={analysis} />;

  return (
    <div style={{ flex: 1, display: 'flex', flexDirection: 'column', background: 'var(--bg)', minHeight: 0 }}>
      {/* Header */}
      <div style={{ padding: '10px 14px 8px', display: 'flex', alignItems: 'center', gap: 6, flexShrink: 0 }}>
        <button className="tap" onClick={onNew} style={{
          width: 36, height: 36, borderRadius: '50%', background: 'var(--surface-2)',
          border: '1px solid var(--border)', display: 'flex', alignItems: 'center', justifyContent: 'center',
          color: 'var(--text)', cursor: 'pointer',
        }}>
          <IcoLeft size={18} />
        </button>
        <div style={{ flex: 1, textAlign: 'center', minWidth: 0 }}>
          <div style={{ fontFamily: 'var(--font-mono)', fontSize: 10, color: 'var(--text-faint)', letterSpacing: 1.5, textTransform: 'uppercase' }}>
            {analysis.exercise_type || 'RESULTADO'}
          </div>
          <div style={{ fontSize: 14, fontWeight: 500, color: 'var(--text)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
            {analysis.title || 'Análisis completado'}
          </div>
        </div>
        <button className="tap" onClick={onSettings} style={{
          width: 36, height: 36, borderRadius: '50%', background: 'var(--surface-2)',
          border: '1px solid var(--border)', display: 'flex', alignItems: 'center', justifyContent: 'center',
          color: 'var(--text-dim)', cursor: 'pointer',
        }}>
          <IcoSettings size={16} />
        </button>
      </div>

      {/* Content area */}
      <div style={{ flex: 1, overflow: 'hidden', display: 'flex', flexDirection: 'column', minHeight: 0 }} key={active}>
        <div style={{ flex: 1, overflow: 'auto', minHeight: 0 }} className="phone-scroll">
          {content}
        </div>
      </div>

      {/* Bottom tab bar */}
      <TabBarBottom active={active} setActive={setActive} />
    </div>
  );
}

Object.assign(window, { ResultsScreen });
