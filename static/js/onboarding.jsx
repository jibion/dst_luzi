// Onboarding — 4 steps: Welcome → Child name → Child age → Parent level → Summary

const LEVELS = [
  { id: 'ninguno',      label: 'Ninguno',      hint: 'No hablo alemán' },
  { id: 'principiante', label: 'Principiante', hint: 'Conozco algunas palabras' },
  { id: 'intermedio',   label: 'Intermedio',   hint: 'Frases del día a día' },
  { id: 'avanzado',     label: 'Avanzado',     hint: 'Conversación fluida' },
  { id: 'nativo',       label: 'Nativo',       hint: 'Lengua materna' },
];

function Progress({ step, total }) {
  return (
    <div style={{ display: 'flex', gap: 6, padding: '8px 24px 0' }}>
      {Array.from({ length: total }).map((_, i) => (
        <div key={i} style={{
          flex: 1, height: 3, borderRadius: 2,
          background: i <= step ? 'var(--accent)' : 'var(--surface-3)',
          transition: 'background .3s ease',
        }} />
      ))}
    </div>
  );
}

function OnboardingHeader({ step, total, onBack, onSkip }) {
  return (
    <>
      <Progress step={step} total={total} />
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '14px 16px 0' }}>
        <button className="tap" onClick={onBack} disabled={step === 0} style={{
          background: 'transparent', border: 0,
          color: step === 0 ? 'var(--text-faint)' : 'var(--text-dim)',
          padding: 8, cursor: step === 0 ? 'default' : 'pointer',
          display: 'flex', alignItems: 'center', gap: 4,
          fontFamily: 'inherit', fontSize: 14,
        }}>
          <IcoLeft size={18} /> Atrás
        </button>
        <span style={{ fontFamily: 'var(--font-mono)', fontSize: 11, color: 'var(--text-faint)', letterSpacing: 1 }}>
          {String(step + 1).padStart(2, '0')} / {String(total).padStart(2, '0')}
        </span>
        <button className="tap" onClick={onSkip} style={{
          background: 'transparent', border: 0, color: 'var(--text-dim)',
          padding: 8, cursor: 'pointer', fontFamily: 'inherit', fontSize: 14,
        }}>Omitir</button>
      </div>
    </>
  );
}

// Step 0: Welcome
function StepWelcome() {
  return (
    <div style={{ padding: '28px 24px 0', flex: 1, display: 'flex', flexDirection: 'column', animation: 'fadeUp .35s ease both' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 22 }}>
        <div style={{
          padding: '4px 9px', borderRadius: 'var(--r-xs)',
          background: 'var(--accent)', color: 'var(--accent-on)',
          fontFamily: 'var(--font-mono)', fontWeight: 600, fontSize: 11, letterSpacing: 1.5,
        }}>DST</div>
        <span style={{
          fontFamily: 'var(--font-display)', fontWeight: 'var(--display-weight)',
          fontSize: 22, letterSpacing: 'var(--display-tracking)', color: 'var(--text)',
        }}>Luzi</span>
      </div>

      <div style={{ fontFamily: 'var(--font-mono)', fontSize: 11, color: 'var(--accent)', letterSpacing: 2, marginBottom: 14 }}>
        BIENVENIDA / WILLKOMMEN
      </div>
      <h1 style={{
        margin: 0, fontFamily: 'var(--font-display)', fontWeight: 'var(--display-weight)',
        fontSize: 38, lineHeight: 1.05, letterSpacing: 'var(--display-tracking)', color: 'var(--text)',
      }}>
        Ayuda a tu hijo<br />con la tarea<br />de <span style={{ color: 'var(--accent)' }}>alemán</span>.
      </h1>
      <p style={{ marginTop: 18, fontSize: 15, lineHeight: 1.55, color: 'var(--text-dim)' }}>
        Toma una foto. Te explicamos en español qué pide el ejercicio y cómo acompañar — sin hacerlo por él.
      </p>

      <div style={{ marginTop: 28, display: 'flex', flexDirection: 'column', gap: 12 }}>
        <FeatureBullet icon={<IcoCamera size={16} />} title="Foto, galería o PDF" desc="Sube la página tal cual viene del cole." />
        <FeatureBullet icon={<IcoSparkles size={16} />} title="Explicación en español" desc="Qué pide la tarea y cómo guiar a tu hijo." />
        <FeatureBullet icon={<IcoVolume size={16} />} title="Lee el alemán por ti" desc="Voz nativa para practicar la pronunciación." />
      </div>

      <div style={{
        marginTop: 'auto', padding: '14px 0 4px',
        fontSize: 11, fontFamily: 'var(--font-mono)', color: 'var(--text-faint)',
        letterSpacing: 1.2, textAlign: 'center',
      }}>
        Acceso para familias DST Tenerife
      </div>
    </div>
  );
}

function FeatureBullet({ icon, title, desc }) {
  return (
    <div style={{ display: 'flex', gap: 12, alignItems: 'flex-start' }}>
      <div style={{
        width: 32, height: 32, borderRadius: 'var(--r-sm)',
        background: 'var(--accent-soft)', color: 'var(--accent)',
        display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0,
      }}>{icon}</div>
      <div style={{ flex: 1 }}>
        <div style={{ fontSize: 14, fontWeight: 500, color: 'var(--text)' }}>{title}</div>
        <div style={{ fontSize: 12.5, color: 'var(--text-dim)', marginTop: 1 }}>{desc}</div>
      </div>
    </div>
  );
}

// Step 1: Child name
function StepName({ child, setChild }) {
  const ref = React.useRef(null);
  React.useEffect(() => { const t = setTimeout(() => ref.current?.focus(), 250); return () => clearTimeout(t); }, []);
  const len = child.name.length;
  const ok = len >= 2 && len <= 30;
  return (
    <div style={{ padding: '36px 24px 0', flex: 1, display: 'flex', flexDirection: 'column', animation: 'fadeUp .35s ease both' }}>
      <div style={{
        width: 56, height: 56, borderRadius: 'var(--r-lg)', background: 'var(--accent-soft)',
        display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--accent)', marginBottom: 18,
      }}>
        <IcoChild size={28} />
      </div>
      <h2 style={{ margin: 0, fontFamily: 'var(--font-display)', fontWeight: 'var(--display-weight)', fontSize: 28, letterSpacing: 'var(--display-tracking)' }}>
        ¿Cómo se llama tu hijo o hija?
      </h2>
      <p style={{ marginTop: 8, fontSize: 14, color: 'var(--text-dim)', lineHeight: 1.5 }}>
        Lo usaremos para personalizar las explicaciones.
      </p>
      <div style={{ marginTop: 28 }}>
        <input
          ref={ref}
          value={child.name}
          onChange={e => setChild({ ...child, name: e.target.value.slice(0, 30) })}
          placeholder="Nombre"
          style={{
            width: '100%', fontFamily: 'var(--font-display)', fontWeight: 'var(--display-weight)',
            fontSize: 32, letterSpacing: 'var(--display-tracking)',
            background: 'transparent', border: 0,
            borderBottom: `2px solid ${ok ? 'var(--accent)' : 'var(--border-strong)'}`,
            color: 'var(--text)', padding: '6px 0', outline: 'none', transition: 'border-color .2s ease',
          }}
        />
        <div style={{ marginTop: 8, display: 'flex', justifyContent: 'space-between', fontFamily: 'var(--font-mono)', fontSize: 11, color: 'var(--text-faint)' }}>
          <span>{ok ? 'Perfecto' : 'Mínimo 2, máximo 30 caracteres'}</span>
          <span>{len}/30</span>
        </div>
      </div>
    </div>
  );
}

// Step 2: Child age
function StepAge({ child, setChild }) {
  const ages = Array.from({ length: 16 }, (_, i) => i + 3);
  return (
    <div style={{ padding: '36px 24px 0', flex: 1, display: 'flex', flexDirection: 'column', animation: 'fadeUp .35s ease both' }}>
      <div style={{
        width: 56, height: 56, borderRadius: 'var(--r-lg)', background: 'var(--accent-soft)',
        display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--accent)', marginBottom: 18,
      }}>
        <IcoCake size={28} />
      </div>
      <h2 style={{ margin: 0, fontFamily: 'var(--font-display)', fontWeight: 'var(--display-weight)', fontSize: 28, letterSpacing: 'var(--display-tracking)' }}>
        ¿Qué edad tiene {child.name || 'tu hijo'}?
      </h2>
      <p style={{ marginTop: 8, fontSize: 14, color: 'var(--text-dim)', lineHeight: 1.5 }}>
        Adaptamos el nivel de las explicaciones.
      </p>

      <div style={{ marginTop: 28, textAlign: 'center' }}>
        <div style={{
          fontFamily: 'var(--font-display)', fontWeight: 'var(--display-weight)',
          fontSize: 84, lineHeight: 1, color: 'var(--accent)', letterSpacing: '-0.04em',
        }}>{child.age}</div>
        <div style={{ marginTop: 4, fontSize: 13, color: 'var(--text-dim)' }}>años</div>
      </div>

      <div style={{ marginTop: 24, display: 'flex', gap: 6, overflowX: 'auto', paddingBottom: 4, scrollbarWidth: 'none' }}>
        {ages.map(a => {
          const active = a === child.age;
          return (
            <button key={a} className="tap" onClick={() => setChild({ ...child, age: a })} style={{
              flexShrink: 0, minWidth: 48, padding: '10px 0',
              border: `1px solid ${active ? 'var(--accent)' : 'var(--border)'}`,
              background: active ? 'var(--accent)' : 'transparent',
              color: active ? 'var(--accent-on)' : 'var(--text-dim)',
              borderRadius: 'var(--r-sm)', cursor: 'pointer',
              fontFamily: 'var(--font-mono)', fontWeight: 500, fontSize: 14,
            }}>{a}</button>
          );
        })}
      </div>
    </div>
  );
}

// Step 3: Parent German level
function StepLevel({ level, setLevel }) {
  return (
    <div style={{ padding: '36px 24px 0', flex: 1, display: 'flex', flexDirection: 'column', animation: 'fadeUp .35s ease both' }}>
      <div style={{
        width: 56, height: 56, borderRadius: 'var(--r-lg)', background: 'var(--accent-soft)',
        display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--accent)', marginBottom: 18,
      }}>
        <IcoGlobe size={28} />
      </div>
      <h2 style={{ margin: 0, fontFamily: 'var(--font-display)', fontWeight: 'var(--display-weight)', fontSize: 28, letterSpacing: 'var(--display-tracking)' }}>
        Tu nivel de alemán
      </h2>
      <p style={{ marginTop: 8, fontSize: 14, color: 'var(--text-dim)', lineHeight: 1.5 }}>
        Ajustamos qué tanto traducimos para ti.
      </p>

      <div style={{ marginTop: 22, display: 'flex', flexDirection: 'column', gap: 8 }}>
        {LEVELS.map(l => {
          const active = level === l.id;
          return (
            <button key={l.id} className="tap" onClick={() => setLevel(l.id)} style={{
              cursor: 'pointer', textAlign: 'left', fontFamily: 'inherit',
              border: `1px solid ${active ? 'var(--accent)' : 'var(--border)'}`,
              background: active ? 'var(--accent-soft)' : 'var(--surface)',
              borderRadius: 'var(--r-md)', padding: '14px 16px',
              display: 'flex', alignItems: 'center', gap: 12,
            }}>
              <div style={{ flex: 1 }}>
                <div style={{ fontSize: 15, fontWeight: 500, color: active ? 'var(--accent)' : 'var(--text)' }}>{l.label}</div>
                <div style={{ fontSize: 12, color: 'var(--text-dim)', marginTop: 2 }}>{l.hint}</div>
              </div>
              <div style={{
                width: 22, height: 22, borderRadius: '50%',
                border: `2px solid ${active ? 'var(--accent)' : 'var(--border-strong)'}`,
                display: 'flex', alignItems: 'center', justifyContent: 'center',
              }}>
                {active && <div style={{ width: 10, height: 10, borderRadius: '50%', background: 'var(--accent)' }} />}
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
}

// Step 4: Summary
function StepSummary({ child, level }) {
  const lvl = LEVELS.find(l => l.id === level);
  return (
    <div style={{ padding: '36px 24px 0', flex: 1, display: 'flex', flexDirection: 'column', animation: 'fadeUp .35s ease both' }}>
      <div style={{
        width: 56, height: 56, borderRadius: 'var(--r-lg)', background: 'var(--accent-soft)',
        display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--accent)', marginBottom: 18,
      }}>
        <IcoCheckCircle size={30} />
      </div>
      <h2 style={{ margin: 0, fontFamily: 'var(--font-display)', fontWeight: 'var(--display-weight)', fontSize: 28, letterSpacing: 'var(--display-tracking)' }}>
        ¡Todo listo!
      </h2>
      <p style={{ marginTop: 8, fontSize: 14, color: 'var(--text-dim)', lineHeight: 1.5 }}>
        Podrás cambiar estos datos cuando quieras desde ajustes.
      </p>

      <div className="card" style={{ marginTop: 24, padding: 18, display: 'flex', flexDirection: 'column', gap: 14 }}>
        <SumRow k="App"       v="DST · Luzi" />
        <SumRow k="Nombre"    v={child.name || '—'} />
        <SumRow k="Edad"      v={`${child.age} años`} />
        <SumRow k="Tu alemán" v={lvl?.label || '—'} />
      </div>

      <div style={{
        marginTop: 18, padding: 14, borderRadius: 'var(--r-md)',
        background: 'var(--accent-soft)', border: '1px solid var(--accent-line)',
        display: 'flex', gap: 12, alignItems: 'flex-start',
      }}>
        <IcoLightbulb size={18} color="var(--accent)" />
        <div style={{ fontSize: 13, color: 'var(--text)', lineHeight: 1.5 }}>
          <strong style={{ color: 'var(--accent)' }}>Tip:</strong> funciona mejor con fotos bien iluminadas y rectas.
        </div>
      </div>
    </div>
  );
}

function SumRow({ k, v }) {
  return (
    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline' }}>
      <span style={{ fontFamily: 'var(--font-mono)', fontSize: 11, color: 'var(--text-faint)', letterSpacing: 1, textTransform: 'uppercase' }}>{k}</span>
      <span style={{ fontSize: 15, fontWeight: 500, color: 'var(--text)' }}>{v}</span>
    </div>
  );
}

function Onboarding({ child, setChild, level, setLevel, onDone }) {
  const [step, setStep] = React.useState(0);
  const total = 5;
  const nameOK = child.name.length >= 2;
  const canNext = step !== 1 || nameOK;

  const next = () => { if (step < total - 1) setStep(step + 1); else onDone(); };
  const back = () => { if (step > 0) setStep(step - 1); };
  const skip = () => onDone();

  let view = null;
  if (step === 0) view = <StepWelcome />;
  if (step === 1) view = <StepName child={child} setChild={setChild} />;
  if (step === 2) view = <StepAge child={child} setChild={setChild} />;
  if (step === 3) view = <StepLevel level={level} setLevel={setLevel} />;
  if (step === 4) view = <StepSummary child={child} level={level} />;

  return (
    <div style={{ flex: 1, display: 'flex', flexDirection: 'column', background: 'var(--bg)' }}>
      <OnboardingHeader step={step} total={total} onBack={back} onSkip={skip} />
      <div style={{ flex: 1, overflow: 'auto' }} className="phone-scroll">{view}</div>
      <div style={{ padding: '14px 20px calc(18px + var(--safe-bottom))', display: 'flex', gap: 10, borderTop: '1px solid var(--border)', background: 'var(--bg)', flexShrink: 0 }}>
        {step > 0 && (
          <button className="btn btn-soft" onClick={back} style={{ flex: '0 0 auto' }}>
            <IcoArrowLeft size={18} />
          </button>
        )}
        <button className="btn btn-primary" onClick={next} disabled={!canNext}
                style={{ flex: 1, opacity: canNext ? 1 : 0.4 }}>
          {step === total - 1 ? 'Empezar' : 'Continuar'} <IcoArrowRight size={18} />
        </button>
      </div>
    </div>
  );
}

Object.assign(window, { Onboarding, LEVELS });
