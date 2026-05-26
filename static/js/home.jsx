// Home screen, picker sheet, preview screen, and analyzing screen.

function BrandMark() {
  return (
    <div>
      <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
        <div style={{
          padding: '3px 7px', borderRadius: 'var(--r-xs)',
          background: 'var(--accent)', color: 'var(--accent-on)',
          fontFamily: 'var(--font-mono)', fontWeight: 600, fontSize: 10, letterSpacing: 1.2,
        }}>DST</div>
        <span style={{
          fontFamily: 'var(--font-display)', fontWeight: 'var(--display-weight)',
          fontSize: 20, letterSpacing: 'var(--display-tracking)', color: 'var(--text)',
        }}>Luzi</span>
      </div>
      <div style={{ fontSize: 10, color: 'var(--text-faint)', marginTop: 1, letterSpacing: 0.2 }}>
        Dos idiomas, una familia.
      </div>
    </div>
  );
}

function AppHeader({ onSettings, title, subtitle }) {
  return (
    <div style={{ padding: '12px 18px 8px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexShrink: 0 }}>
      {title ? (
        <div>
          <div style={{ fontFamily: 'var(--font-mono)', fontSize: 10, color: 'var(--text-faint)', letterSpacing: 1.5, textTransform: 'uppercase' }}>{subtitle}</div>
          <div style={{ fontFamily: 'var(--font-display)', fontWeight: 'var(--display-weight)', fontSize: 20, color: 'var(--text)', letterSpacing: 'var(--display-tracking)' }}>{title}</div>
        </div>
      ) : <BrandMark />}
      <button className="tap" onClick={onSettings} style={{
        width: 40, height: 40, borderRadius: '50%', background: 'var(--surface-2)',
        border: '1px solid var(--border)', display: 'flex', alignItems: 'center', justifyContent: 'center',
        color: 'var(--text-dim)', cursor: 'pointer',
      }}>
        <IcoSettings size={18} />
      </button>
    </div>
  );
}

// ── Upload card (filled-accent style, matches design) ────────────────
function UploadCard({ onPick }) {
  return (
    <button className="tap" onClick={onPick} style={{
      cursor: 'pointer', fontFamily: 'inherit',
      width: '100%', padding: '28px 22px', textAlign: 'left',
      background: 'var(--accent-soft)', color: 'var(--text)',
      border: '1px solid var(--accent-line)',
      borderRadius: 'var(--r-lg)',
      display: 'flex', flexDirection: 'column', gap: 22, position: 'relative', overflow: 'hidden',
    }}>
      <div style={{
        position: 'absolute', right: -60, bottom: -80, width: 240, height: 240, borderRadius: '50%',
        background: 'var(--accent)', opacity: 0.10,
      }} />

      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', width: '100%', position: 'relative' }}>
        <div style={{
          width: 64, height: 64, borderRadius: 'var(--r-md)', background: 'var(--accent)',
          color: 'var(--accent-on)', display: 'flex', alignItems: 'center', justifyContent: 'center',
          boxShadow: '0 6px 18px rgba(0,0,0,0.15)',
        }}>
          <IcoCamera size={30} />
        </div>
        <span className="chip" style={{ background: 'rgba(0,0,0,0.06)', color: 'var(--accent)', borderColor: 'var(--accent-line)', fontWeight: 600 }}>
          <IcoSparkles size={11} /> IA · Gemini
        </span>
      </div>

      <div style={{ position: 'relative' }}>
        <div style={{ fontFamily: 'var(--font-display)', fontWeight: 'var(--display-weight)', fontSize: 26, lineHeight: 1.1, letterSpacing: 'var(--display-tracking)', color: 'var(--text)' }}>
          Subir una tarea
        </div>
        <div style={{ fontSize: 13.5, color: 'var(--text-dim)', marginTop: 6, lineHeight: 1.45 }}>
          Toma una foto, elige de la galería o sube un PDF. Te lo explicamos en español.
        </div>
      </div>

      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', width: '100%', position: 'relative', borderTop: '1px solid var(--accent-line)', paddingTop: 14 }}>
        <div style={{ display: 'flex', gap: 14, color: 'var(--accent)', opacity: 0.85 }}>
          <IcoCamera size={18} />
          <IcoImage size={18} />
          <IcoBook size={18} />
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 6, color: 'var(--accent)', fontWeight: 600, fontSize: 13 }}>
          Empezar <IcoArrowRight size={16} />
        </div>
      </div>
    </button>
  );
}

// ── Home screen ──────────────────────────────────────────────────────
function HomeScreen({ child, onSettings, onPick }) {
  const now = new Date();
  const dayNames = ['domingo', 'lunes', 'martes', 'miércoles', 'jueves', 'viernes', 'sábado'];
  const dayLabel = `${dayNames[now.getDay()]} ${now.getDate()}`;
  const greet = (h => h < 12 ? 'Buenos días' : h < 19 ? 'Buenas tardes' : 'Buenas noches')(now.getHours());

  return (
    <div style={{ flex: 1, display: 'flex', flexDirection: 'column', background: 'var(--bg)' }}>
      <AppHeader onSettings={onSettings} />
      <div style={{ flex: 1, overflow: 'auto', padding: '8px 18px 24px' }} className="phone-scroll">
        <div style={{ animation: 'fadeUp .35s ease both' }}>
          <div style={{ fontFamily: 'var(--font-mono)', fontSize: 11, color: 'var(--text-faint)', letterSpacing: 1.5, textTransform: 'uppercase', marginTop: 8 }}>
            {greet} · <span style={{ marginLeft: 4 }}>{dayLabel}</span>
          </div>
          <h1 style={{
            margin: '6px 0 0', fontFamily: 'var(--font-display)', fontWeight: 'var(--display-weight)',
            fontSize: 32, lineHeight: 1.1, letterSpacing: 'var(--display-tracking)', color: 'var(--text)',
          }}>
            Hola, <span style={{ color: 'var(--accent)' }}>{child.name || 'familia'}</span>.<br />
            <span style={{ color: 'var(--text-dim)' }}>¿Qué tarea tenemos hoy?</span>
          </h1>

          <div style={{ marginTop: 22 }}>
            <UploadCard onPick={onPick} />
          </div>

          <div style={{ marginTop: 28, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <div style={{ fontFamily: 'var(--font-mono)', fontSize: 11, color: 'var(--text-faint)', letterSpacing: 1.5, textTransform: 'uppercase' }}>Recientes</div>
            <span style={{ fontSize: 12, color: 'var(--text-dim)' }}>Historial local</span>
          </div>

          <RecentList />
        </div>
      </div>
    </div>
  );
}

function RecentList() {
  const [items, setItems] = React.useState(() => {
    try { return JSON.parse(localStorage.getItem('luzi_recent') || '[]'); }
    catch { return []; }
  });

  if (items.length === 0) {
    return (
      <div style={{ marginTop: 12, padding: '20px 0', textAlign: 'center', color: 'var(--text-faint)', fontSize: 13 }}>
        Aquí aparecerán tus análisis anteriores.
      </div>
    );
  }

  return (
    <div style={{ marginTop: 10, display: 'flex', flexDirection: 'column', gap: 8 }}>
      {items.slice(0, 5).map((item, i) => (
        <div key={i} className="tap card" style={{ padding: '12px 14px', display: 'flex', alignItems: 'center', gap: 12, cursor: 'default' }}>
          <div style={{ width: 36, height: 36, borderRadius: 'var(--r-sm)', background: 'var(--surface-2)', color: 'var(--text-dim)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
            <IcoBook size={16} />
          </div>
          <div style={{ flex: 1, minWidth: 0 }}>
            <div style={{ fontSize: 14, fontWeight: 500, color: 'var(--text)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{item.title}</div>
            <div style={{ fontSize: 12, color: 'var(--text-dim)', marginTop: 1 }}>{item.exercise_type}</div>
          </div>
          <div style={{ fontFamily: 'var(--font-mono)', fontSize: 11, color: 'var(--text-faint)', flexShrink: 0 }}>{item.date}</div>
        </div>
      ))}
    </div>
  );
}

// ── Picker sheet with real file inputs ──────────────────────────────
function PickerSheet({ onPick, onClose }) {
  const cameraRef  = React.useRef(null);
  const galleryRef = React.useRef(null);
  const pdfRef     = React.useRef(null);

  const handleChange = e => {
    const file = e.target.files?.[0];
    if (file) onPick(file);
    // Reset so same file can be re-picked
    e.target.value = '';
  };

  return (
    <div className="sheet-overlay" onClick={onClose} style={{
      position: 'absolute', inset: 0, background: 'rgba(0,0,0,0.45)',
      display: 'flex', alignItems: 'flex-end', zIndex: 10,
    }}>
      <div className="sheet-panel" onClick={e => e.stopPropagation()} style={{
        width: '100%', background: 'var(--surface)',
        borderTopLeftRadius: 'var(--r-xl)', borderTopRightRadius: 'var(--r-xl)',
        padding: '12px 16px calc(22px + var(--safe-bottom))', display: 'flex', flexDirection: 'column', gap: 6,
      }}>
        {/* Hidden file inputs */}
        <input ref={cameraRef}  type="file" accept="image/*"              capture="environment" style={{ display: 'none' }} onChange={handleChange} />
        <input ref={galleryRef} type="file" accept="image/*"                                    style={{ display: 'none' }} onChange={handleChange} />
        <input ref={pdfRef}     type="file" accept=".pdf,application/pdf"                       style={{ display: 'none' }} onChange={handleChange} />

        <div style={{ width: 36, height: 4, background: 'var(--border-strong)', borderRadius: 2, margin: '6px auto 14px' }} />

        <SheetRow icon={<IcoCamera size={20} />} label="Tomar foto"           sub="Usar la cámara"   onClick={() => cameraRef.current?.click()} />
        <SheetRow icon={<IcoImage  size={20} />} label="Elegir de la galería" sub="Foto guardada"    onClick={() => galleryRef.current?.click()} />
        <SheetRow icon={<IcoBook   size={20} />} label="Subir PDF"            sub="Archivo del cole" onClick={() => pdfRef.current?.click()} />

        <button className="btn btn-ghost" onClick={onClose} style={{ marginTop: 6 }}>Cancelar</button>
      </div>
    </div>
  );
}

function SheetRow({ icon, label, sub, onClick }) {
  return (
    <button className="tap" onClick={onClick} style={{
      cursor: 'pointer', fontFamily: 'inherit', textAlign: 'left',
      background: 'var(--surface-2)', border: '1px solid var(--border)',
      borderRadius: 'var(--r-md)', padding: '14px 16px',
      display: 'flex', alignItems: 'center', gap: 14, color: 'var(--text)',
    }}>
      <div style={{ width: 40, height: 40, borderRadius: 'var(--r-sm)', background: 'var(--accent-soft)', color: 'var(--accent)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>{icon}</div>
      <div style={{ flex: 1 }}>
        <div style={{ fontSize: 15, fontWeight: 500 }}>{label}</div>
        <div style={{ fontSize: 12, color: 'var(--text-dim)', marginTop: 2 }}>{sub}</div>
      </div>
    </button>
  );
}

// ── Preview screen — shows the real uploaded file ───────────────────
function PreviewScreen({ file, previewUrl, child, onAnalyze, onCancel, onSettings }) {
  const isImage = file?.type?.startsWith('image/');
  const isPDF   = file?.type === 'application/pdf';
  const size    = file ? (file.size < 1024 * 1024 ? `${Math.round(file.size / 1024)} KB` : `${(file.size / 1024 / 1024).toFixed(1)} MB`) : '';

  return (
    <div style={{ flex: 1, display: 'flex', flexDirection: 'column', background: 'var(--bg)' }}>
      <AppHeader onSettings={onSettings} title="Vista previa" subtitle="REVISA Y ANALIZA" />
      <div style={{ flex: 1, overflow: 'auto', padding: '6px 18px 14px' }} className="phone-scroll">
        {isImage && previewUrl ? (
          <div style={{ borderRadius: 'var(--r-md)', overflow: 'hidden', boxShadow: '0 4px 14px rgba(0,0,0,0.22)' }}>
            <img src={previewUrl} alt="Tarea subida" style={{ width: '100%', display: 'block' }} />
          </div>
        ) : isPDF ? (
          <div style={{
            background: 'var(--surface)', border: '1px solid var(--border)',
            borderRadius: 'var(--r-md)', padding: '44px 20px',
            textAlign: 'center',
          }}>
            <IcoBook size={48} color="var(--accent)" />
            <div style={{ marginTop: 14, fontSize: 16, fontWeight: 600, color: 'var(--text)' }}>PDF listo</div>
            <div style={{ marginTop: 4, fontSize: 13, color: 'var(--text-dim)', wordBreak: 'break-all' }}>{file?.name}</div>
          </div>
        ) : null}

        <div style={{ marginTop: 14, display: 'flex', gap: 8, flexWrap: 'wrap' }}>
          {isImage && <span className="chip"><IcoImage size={11} /> {size}</span>}
          {isPDF   && <span className="chip"><IcoBook  size={11} /> PDF · {size}</span>}
          <span className="chip" style={{ background: 'var(--accent-soft)', borderColor: 'var(--accent-line)', color: 'var(--accent)' }}>
            <IcoSparkles size={11} /> Listo para analizar
          </span>
        </div>

        <div className="card" style={{ marginTop: 14, padding: 14, display: 'flex', alignItems: 'flex-start', gap: 10 }}>
          <IcoSparkles size={18} color="var(--accent)" />
          <div style={{ fontSize: 13, color: 'var(--text-dim)', lineHeight: 1.5 }}>
            Gemini leerá la imagen y te explicará en español qué pide el ejercicio. Suele tardar entre 5 y 15 segundos.
          </div>
        </div>
      </div>
      <div style={{ padding: '14px 20px calc(16px + var(--safe-bottom))', display: 'flex', gap: 10, borderTop: '1px solid var(--border)', background: 'var(--bg)' }}>
        <button className="btn btn-soft" onClick={onCancel} style={{ flex: '0 0 auto' }}>
          <IcoClose size={18} />
        </button>
        <button className="btn btn-primary" onClick={onAnalyze} style={{ flex: 1 }}>
          <IcoSparkles size={18} /> Analizar tarea
        </button>
      </div>
    </div>
  );
}

// ── Analyzing screen ─────────────────────────────────────────────────
function AnalyzingScreen() {
  const steps = ['Leyendo la imagen…', 'Reconociendo el alemán…', 'Preparando explicación…'];
  const [i, setI] = React.useState(0);
  React.useEffect(() => {
    const t = setInterval(() => setI(v => (v + 1) % steps.length), 1200);
    return () => clearInterval(t);
  }, []);

  return (
    <div style={{ flex: 1, display: 'flex', flexDirection: 'column', background: 'var(--bg)' }}>
      <div style={{ padding: '14px 18px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <BrandMark />
        <span className="chip" style={{ background: 'var(--accent-soft)', color: 'var(--accent)', borderColor: 'var(--accent-line)' }}>
          <span style={{ width: 6, height: 6, borderRadius: '50%', background: 'var(--accent)', animation: 'pulse 1.2s ease-in-out infinite' }} />
          Analizando
        </span>
      </div>

      <div style={{ flex: 1, padding: '0 18px', display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center', textAlign: 'center' }}>
        <div style={{ position: 'relative', width: 160, height: 160 }}>
          <div style={{ position: 'absolute', inset: 0, borderRadius: '50%', border: '2px solid var(--border)' }} />
          <div style={{
            position: 'absolute', inset: 0, borderRadius: '50%',
            border: '2px solid transparent', borderTopColor: 'var(--accent)', borderRightColor: 'var(--accent)',
            animation: 'spin 1.4s linear infinite',
          }} />
          <div style={{
            position: 'absolute', inset: 18, borderRadius: '50%',
            background: 'var(--accent-soft)', display: 'flex', alignItems: 'center', justifyContent: 'center',
            color: 'var(--accent)',
          }}>
            <IcoSparkles size={42} />
          </div>
        </div>
        <div style={{ marginTop: 28, fontFamily: 'var(--font-display)', fontWeight: 'var(--display-weight)', fontSize: 22, letterSpacing: 'var(--display-tracking)' }}>
          {steps[i]}
        </div>
        <div style={{ marginTop: 8, fontSize: 13, color: 'var(--text-dim)' }}>Esto tarda unos 5-15 segundos.</div>

        <div style={{ marginTop: 28, display: 'flex', gap: 6 }}>
          {steps.map((_, k) => (
            <div key={k} style={{ width: 28, height: 3, borderRadius: 2, background: k <= i ? 'var(--accent)' : 'var(--surface-3)', transition: 'background .3s' }} />
          ))}
        </div>
      </div>
    </div>
  );
}

// ── Error screen ─────────────────────────────────────────────────────
function ErrorScreen({ error, onRetry, onHome }) {
  const isQuota = error && error.toLowerCase().includes('límite');
  return (
    <div style={{ flex: 1, display: 'flex', flexDirection: 'column', background: 'var(--bg)' }}>
      <div style={{ padding: '14px 18px' }}>
        <BrandMark />
      </div>
      <div style={{ flex: 1, padding: '0 24px', display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center', textAlign: 'center' }}>
        <div style={{ width: 64, height: 64, borderRadius: 'var(--r-lg)', background: 'var(--surface-2)', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: 20 }}>
          <IcoAlert size={30} color="var(--accent)" />
        </div>
        <div style={{ fontFamily: 'var(--font-display)', fontWeight: 'var(--display-weight)', fontSize: 24, letterSpacing: 'var(--display-tracking)' }}>
          {isQuota ? 'Un momento' : 'Algo salió mal'}
        </div>
        <div style={{ marginTop: 8, fontSize: 14, color: 'var(--text-dim)', lineHeight: 1.55, maxWidth: 280 }}>
          {error || 'No se pudo conectar con el servicio de análisis.'}
        </div>
        <div style={{ marginTop: 32, display: 'flex', flexDirection: 'column', gap: 10, width: '100%', maxWidth: 300 }}>
          <button className="btn btn-primary" onClick={onRetry} style={{ width: '100%' }}>
            Intentar de nuevo
          </button>
          <button className="btn btn-soft" onClick={onHome} style={{ width: '100%' }}>
            Volver al inicio
          </button>
        </div>
      </div>
    </div>
  );
}

// ── Exercise picker ───────────────────────────────────────────────────
const TYPE_ICON = {
  Lectura:     '📖',
  Gramatica:   '🔡',
  Vocabulario: '🔤',
  Escritura:   '✍️',
  Dictado:     '👂',
  Matematicas: '🔢',
  Ciencias:    '🌿',
  Ingles:      '🇬🇧',
  Otro:        '📄',
};

function ExercisePicker({ analysis, onPick, onHome }) {
  const exercises = analysis?.exercises || [];
  return (
    <div style={{ flex: 1, display: 'flex', flexDirection: 'column', background: 'var(--bg)' }}>
      <div style={{ padding: '14px 18px', flexShrink: 0 }}>
        <BrandMark />
      </div>

      <div style={{ padding: '0 18px 12px', flexShrink: 0 }}>
        <div style={{ fontFamily: 'var(--font-mono)', fontSize: 10, color: 'var(--text-faint)', letterSpacing: 1.5, textTransform: 'uppercase' }}>
          {exercises.length} ejercicios encontrados
        </div>
        <div style={{ fontFamily: 'var(--font-display)', fontWeight: 'var(--display-weight)', fontSize: 22, letterSpacing: 'var(--display-tracking)', marginTop: 2 }}>
          {analysis?.title || 'Hoja de deberes'}
        </div>
      </div>

      <div style={{ flex: 1, overflow: 'auto', padding: '4px 18px calc(16px + var(--safe-bottom))' }} className="phone-scroll">
        <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
          {exercises.map((ex, i) => (
            <button key={i} className="tap card" onClick={() => onPick(i)} style={{
              width: '100%', cursor: 'pointer', fontFamily: 'inherit', textAlign: 'left',
              padding: '16px', border: '1px solid var(--border)',
              display: 'flex', alignItems: 'flex-start', gap: 14,
            }}>
              <div style={{
                width: 44, height: 44, borderRadius: 'var(--r-md)', flexShrink: 0,
                background: 'var(--accent-soft)', border: '1px solid var(--accent-line)',
                display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 22,
              }}>
                {TYPE_ICON[ex.exercise_type] || '📄'}
              </div>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4 }}>
                  <span style={{ fontFamily: 'var(--font-mono)', fontSize: 10, color: 'var(--text-faint)', letterSpacing: 1, textTransform: 'uppercase' }}>
                    Ejercicio {i + 1}
                  </span>
                  <span className="chip" style={{ background: 'var(--accent-soft)', color: 'var(--accent)', borderColor: 'var(--accent-line)', fontSize: 11 }}>
                    {ex.exercise_type || 'Otro'}
                  </span>
                </div>
                <div style={{ fontSize: 14, color: 'var(--text)', lineHeight: 1.45, display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
                  {ex.description || '—'}
                </div>
              </div>
              <div style={{ color: 'var(--text-faint)', fontSize: 18, alignSelf: 'center' }}>›</div>
            </button>
          ))}
        </div>

        <button className="btn btn-ghost" onClick={onHome} style={{ width: '100%', marginTop: 16, color: 'var(--text-dim)' }}>
          Volver al inicio
        </button>
      </div>
    </div>
  );
}

Object.assign(window, { BrandMark, AppHeader, HomeScreen, PickerSheet, PreviewScreen, AnalyzingScreen, ErrorScreen, ExercisePicker });
