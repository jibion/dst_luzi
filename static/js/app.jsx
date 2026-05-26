// App — owns all state, routes between screens.
// No phone frame, no tweaks panel — fixed design tokens, real functionality.

const ACCENT = 'green';
const FONT   = 'plex';
const RADIUS = 'soft';

function useResolvedTheme(choice) {
  const getPref = () => window.matchMedia?.('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
  const [sys, setSys] = React.useState(getPref);
  React.useEffect(() => {
    const m = window.matchMedia('(prefers-color-scheme: dark)');
    const h = e => setSys(e.matches ? 'dark' : 'light');
    m.addEventListener?.('change', h);
    return () => m.removeEventListener?.('change', h);
  }, []);
  return choice === 'auto' ? sys : choice;
}

function readLocal(key, fallback) {
  try { const v = localStorage.getItem(key); return v !== null ? JSON.parse(v) : fallback; }
  catch { return fallback; }
}

const CACHE_TTL = 24 * 60 * 60 * 1000; // 24 h
const CACHE_MAX = 20;

function cacheKey(file, child, level) {
  return `${file.name}|${file.size}|${file.lastModified}|${child.name}|${child.age}|${level}`;
}
function getCached(file, child, level) {
  try {
    const map = readLocal('luzi_cache', {});
    const e = map[cacheKey(file, child, level)];
    return e && Date.now() - e.ts < CACHE_TTL ? e.data : null;
  } catch { return null; }
}
function setCache(file, child, level, data) {
  try {
    const map = readLocal('luzi_cache', {});
    map[cacheKey(file, child, level)] = { ts: Date.now(), data };
    const keys = Object.keys(map).sort((a, b) => map[a].ts - map[b].ts);
    if (keys.length > CACHE_MAX) keys.slice(0, keys.length - CACHE_MAX).forEach(k => delete map[k]);
    localStorage.setItem('luzi_cache', JSON.stringify(map));
  } catch {}
}

function App() {
  // ── Persistent preferences ──────────────────────────────────────
  const [theme, setTheme] = React.useState(() => readLocal('luzi_theme', 'auto'));
  const [child, setChild] = React.useState(() => readLocal('luzi_child', { name: '', age: 8 }));
  const [level, setLevel] = React.useState(() => readLocal('luzi_level', 'principiante'));

  const resolvedTheme = useResolvedTheme(theme);

  React.useEffect(() => { try { localStorage.setItem('luzi_theme', JSON.stringify(theme)); } catch {} }, [theme]);
  React.useEffect(() => { try { localStorage.setItem('luzi_child', JSON.stringify(child)); } catch {} }, [child]);
  React.useEffect(() => { try { localStorage.setItem('luzi_level', JSON.stringify(level)); } catch {} }, [level]);

  // ── Navigation ───────────────────────────────────────────────────
  const [screen, setScreen] = React.useState(() =>
    readLocal('luzi_onboarding_done', false) ? 'home' : 'onboarding'
  );

  // ── Upload & analysis state ──────────────────────────────────────
  const [uploadedFile, setUploadedFile] = React.useState(null);
  const [previewUrl,   setPreviewUrl]   = React.useState(null);
  const [analysis,          setAnalysis]          = React.useState(null);
  const [selectedExercise,  setSelectedExercise]  = React.useState(0);
  const [analyzeError,      setAnalyzeError]      = React.useState(null);

  // Revoke blob URL on cleanup
  React.useEffect(() => {
    return () => { if (previewUrl) URL.revokeObjectURL(previewUrl); };
  }, [previewUrl]);

  // ── UI overlays ──────────────────────────────────────────────────
  const [showSettings, setShowSettings] = React.useState(false);
  const [showPicker,   setShowPicker]   = React.useState(false);
  const [toast,        setToast]        = React.useState(null);

  const showToast = msg => {
    setToast(msg);
    setTimeout(() => setToast(null), 3000);
  };

  // ── Handlers ─────────────────────────────────────────────────────
  const handleOnboardingDone = () => {
    try { localStorage.setItem('luzi_onboarding_done', 'true'); } catch {}
    setScreen('home');
  };

  const handleFilePicked = file => {
    if (previewUrl) URL.revokeObjectURL(previewUrl);
    setUploadedFile(file);
    setPreviewUrl(URL.createObjectURL(file));
    setShowPicker(false);
    setScreen('preview');
  };

  const handleAnalyze = async () => {
    if (!uploadedFile) return;

    // Return cached result immediately if available
    const cached = getCached(uploadedFile, child, level);
    if (cached) {
      setAnalysis(cached);
      setScreen('results');
      return;
    }

    setScreen('analyzing');
    setAnalyzeError(null);

    const formData = new FormData();
    formData.append('file', uploadedFile);
    formData.append('child_name', child.name);
    formData.append('child_age', String(child.age));
    formData.append('parent_level', level);

    try {
      const res = await fetch('/api/analyze', { method: 'POST', body: formData });
      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        if (res.status === 429) throw new Error(err.detail || 'Límite alcanzado. Inténtalo en un momento.');
        throw new Error(err.detail || `Error ${res.status}`);
      }
      const data = await res.json();
      setAnalysis(data);
      setSelectedExercise(0);
      setCache(uploadedFile, child, level, data);

      // Save to recent history
      try {
        const recent = readLocal('luzi_recent', []);
        const now = new Date();
        const entry = {
          title: data.title || 'Tarea analizada',
          exercise_type: data.exercises?.[0]?.exercise_type || '',
          date: `${now.getDate()}/${now.getMonth() + 1}`,
        };
        localStorage.setItem('luzi_recent', JSON.stringify([entry, ...recent].slice(0, 10)));
      } catch {}

      setScreen(data.exercises?.length > 1 ? 'exercises' : 'results');
    } catch (err) {
      setAnalyzeError(err.message || 'No se pudo conectar con el servidor.');
      setScreen('error');
    }
  };

  const goHome = () => {
    setScreen('home');
    setAnalysis(null);
    setSelectedExercise(0);
    setAnalyzeError(null);
  };

  // ── Screen routing ───────────────────────────────────────────────
  let content = null;

  if (screen === 'onboarding') {
    content = (
      <Onboarding
        child={child} setChild={setChild}
        level={level} setLevel={setLevel}
        onDone={handleOnboardingDone}
      />
    );
  } else if (screen === 'home') {
    content = (
      <HomeScreen
        child={child}
        onSettings={() => setShowSettings(true)}
        onPick={() => setShowPicker(true)}
      />
    );
  } else if (screen === 'preview') {
    content = (
      <PreviewScreen
        file={uploadedFile}
        previewUrl={previewUrl}
        child={child}
        onAnalyze={handleAnalyze}
        onCancel={goHome}
        onSettings={() => setShowSettings(true)}
      />
    );
  } else if (screen === 'analyzing') {
    content = <AnalyzingScreen />;
  } else if (screen === 'exercises') {
    content = (
      <ExercisePicker
        analysis={analysis}
        onPick={i => { setSelectedExercise(i); setScreen('results'); }}
        onHome={goHome}
      />
    );
  } else if (screen === 'results') {
    const selectedAnalysis = analysis
      ? { title: analysis.title, ...(analysis.exercises?.[selectedExercise] ?? analysis) }
      : null;
    content = (
      <ResultsScreen
        analysis={selectedAnalysis}
        previewUrl={previewUrl}
        child={child}
        onSettings={() => setShowSettings(true)}
        onNew={analysis?.exercises?.length > 1 ? () => setScreen('exercises') : goHome}
      />
    );
  } else if (screen === 'error') {
    content = (
      <ErrorScreen
        error={analyzeError}
        onRetry={() => setScreen('preview')}
        onHome={goHome}
      />
    );
  }

  return (
    <div
      className="app-root"
      data-theme={resolvedTheme}
      data-accent={ACCENT}
      data-font={FONT}
      data-radius={RADIUS}
    >
      {content}

      {showPicker && (
        <PickerSheet
          onClose={() => setShowPicker(false)}
          onPick={handleFilePicked}
        />
      )}

      {showSettings && (
        <Settings
          theme={theme} setTheme={setTheme}
          child={child} setChild={setChild}
          level={level} setLevel={setLevel}
          onClose={() => setShowSettings(false)}
        />
      )}

      {toast && <div className="toast">{toast}</div>}
    </div>
  );
}

ReactDOM.createRoot(document.getElementById('root')).render(<App />);
