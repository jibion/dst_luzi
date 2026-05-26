// Settings sheet — edits child info, parent level, and theme.

function Settings({ theme, setTheme, child, setChild, level, setLevel, onClose }) {
  return (
    <div className="sheet-overlay" onClick={onClose} style={{
      position: 'absolute', inset: 0, background: 'rgba(0,0,0,0.5)',
      display: 'flex', alignItems: 'flex-end', zIndex: 20,
    }}>
      <div className="sheet-panel" onClick={e => e.stopPropagation()} style={{
        width: '100%', maxHeight: '88%', overflow: 'auto',
        background: 'var(--surface)',
        borderTopLeftRadius: 'var(--r-xl)', borderTopRightRadius: 'var(--r-xl)',
        padding: '12px 18px calc(28px + var(--safe-bottom))',
      }} className="phone-scroll">
        <div style={{ width: 36, height: 4, background: 'var(--border-strong)', borderRadius: 2, margin: '6px auto 14px' }} />

        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 20 }}>
          <div>
            <div style={{ fontFamily: 'var(--font-mono)', fontSize: 10, color: 'var(--text-faint)', letterSpacing: 1.5, textTransform: 'uppercase' }}>Ajustes</div>
            <div style={{ fontFamily: 'var(--font-display)', fontWeight: 'var(--display-weight)', fontSize: 22, letterSpacing: 'var(--display-tracking)' }}>Tu familia</div>
          </div>
          <button className="tap" onClick={onClose} style={{
            width: 36, height: 36, borderRadius: '50%', background: 'var(--surface-2)', border: 0,
            display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--text-dim)', cursor: 'pointer',
          }}>
            <IcoClose size={18} />
          </button>
        </div>

        {/* Child name */}
        <SettingsSection label="Nombre del niño/a">
          <input
            value={child.name}
            onChange={e => setChild({ ...child, name: e.target.value.slice(0, 30) })}
            placeholder="Nombre"
            style={{
              width: '100%', background: 'var(--surface-2)', border: '1px solid var(--border)',
              borderRadius: 'var(--r-sm)', padding: '12px 14px',
              fontFamily: 'inherit', fontSize: 15, color: 'var(--text)', outline: 'none',
            }}
          />
        </SettingsSection>

        {/* Child age */}
        <SettingsSection label={`Edad — ${child.age} años`}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <span style={{ fontFamily: 'var(--font-mono)', fontSize: 11, color: 'var(--text-faint)' }}>3</span>
            <input
              type="range" min={3} max={18} value={child.age}
              onChange={e => setChild({ ...child, age: parseInt(e.target.value, 10) })}
              style={{ flex: 1, accentColor: 'var(--accent)' }}
            />
            <span style={{ fontFamily: 'var(--font-mono)', fontSize: 11, color: 'var(--text-faint)' }}>18</span>
          </div>
        </SettingsSection>

        {/* Parent level */}
        <SettingsSection label="Tu nivel de alemán">
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
            {LEVELS.map(l => {
              const active = level === l.id;
              return (
                <button key={l.id} className="tap" onClick={() => setLevel(l.id)} style={{
                  cursor: 'pointer', fontFamily: 'inherit',
                  padding: '8px 12px', borderRadius: 'var(--r-sm)',
                  border: `1px solid ${active ? 'var(--accent)' : 'var(--border)'}`,
                  background: active ? 'var(--accent-soft)' : 'transparent',
                  color: active ? 'var(--accent)' : 'var(--text-dim)',
                  fontSize: 13, fontWeight: 500,
                }}>{l.label}</button>
              );
            })}
          </div>
        </SettingsSection>

        {/* Theme */}
        <SettingsSection label="Tema">
          <div style={{ display: 'flex', gap: 6 }}>
            {[
              { id: 'auto',  label: 'Auto'   },
              { id: 'light', label: 'Claro'  },
              { id: 'dark',  label: 'Oscuro' },
            ].map(o => {
              const active = theme === o.id;
              return (
                <button key={o.id} className="tap" onClick={() => setTheme(o.id)} style={{
                  flex: 1, cursor: 'pointer', fontFamily: 'inherit',
                  padding: '10px 0', borderRadius: 'var(--r-sm)',
                  border: `1px solid ${active ? 'var(--accent)' : 'var(--border)'}`,
                  background: active ? 'var(--accent-soft)' : 'transparent',
                  color: active ? 'var(--accent)' : 'var(--text)',
                  fontSize: 13, fontWeight: 500,
                }}>{o.label}</button>
              );
            })}
          </div>
        </SettingsSection>

        {/* Footer note */}
        <div style={{ marginTop: 18, padding: 12, borderRadius: 'var(--r-sm)', background: 'var(--surface-2)', display: 'flex', alignItems: 'center', gap: 10 }}>
          <span style={{ width: 6, height: 6, borderRadius: '50%', background: 'var(--accent)', flexShrink: 0 }} />
          <div style={{ flex: 1, fontSize: 12, color: 'var(--text-dim)', lineHeight: 1.4 }}>
            Acceso limitado a familias <strong style={{ color: 'var(--text)' }}>DST Tenerife</strong>. Versión 0.4 beta.
          </div>
        </div>

        <button className="btn btn-primary" onClick={onClose} style={{ width: '100%', marginTop: 16 }}>
          <IcoCheck size={18} /> Guardar cambios
        </button>
      </div>
    </div>
  );
}

function SettingsSection({ label, children }) {
  return (
    <div style={{ marginBottom: 18 }}>
      <div style={{ fontFamily: 'var(--font-mono)', fontSize: 10, color: 'var(--text-faint)', letterSpacing: 1.5, textTransform: 'uppercase', marginBottom: 8 }}>{label}</div>
      {children}
    </div>
  );
}

Object.assign(window, { Settings });
