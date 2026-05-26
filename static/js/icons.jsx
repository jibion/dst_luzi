// Inline icon components — each accepts size + color props.
const _I = (paths, viewBox = '0 0 24 24') =>
  ({ size = 20, color = 'currentColor', strokeWidth = 1.75, style, ...rest }) => (
    <svg width={size} height={size} viewBox={viewBox} fill="none"
         stroke={color} strokeWidth={strokeWidth} strokeLinecap="round" strokeLinejoin="round"
         style={{ display: 'block', flexShrink: 0, ...style }} {...rest}>
      {paths}
    </svg>
  );

const IcoCamera      = _I(<><path d="M3 8a2 2 0 0 1 2-2h2.5l1.5-2h6l1.5 2H19a2 2 0 0 1 2 2v10a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8z"/><circle cx="12" cy="13" r="3.5"/></>);
const IcoUpload      = _I(<><path d="M12 16V4"/><path d="m7 9 5-5 5 5"/><path d="M5 20h14"/></>);
const IcoImage       = _I(<><rect x="3" y="3" width="18" height="18" rx="2"/><circle cx="8.5" cy="9" r="1.5"/><path d="m21 17-6-6-9 9"/></>);
const IcoSparkles    = _I(<><path d="M12 3v3M12 18v3M3 12h3M18 12h3M5.6 5.6l2.1 2.1M16.3 16.3l2.1 2.1M5.6 18.4l2.1-2.1M16.3 7.7l2.1-2.1"/><circle cx="12" cy="12" r="3"/></>);
const IcoSettings    = _I(<><circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.7 1.7 0 0 0 .3 1.8l.1.1a2 2 0 1 1-2.8 2.8l-.1-.1a1.7 1.7 0 0 0-1.8-.3 1.7 1.7 0 0 0-1 1.5V21a2 2 0 1 1-4 0v-.1a1.7 1.7 0 0 0-1.1-1.5 1.7 1.7 0 0 0-1.8.3l-.1.1a2 2 0 1 1-2.8-2.8l.1-.1a1.7 1.7 0 0 0 .3-1.8 1.7 1.7 0 0 0-1.5-1H3a2 2 0 1 1 0-4h.1a1.7 1.7 0 0 0 1.5-1.1 1.7 1.7 0 0 0-.3-1.8l-.1-.1a2 2 0 1 1 2.8-2.8l.1.1a1.7 1.7 0 0 0 1.8.3H9a1.7 1.7 0 0 0 1-1.5V3a2 2 0 1 1 4 0v.1a1.7 1.7 0 0 0 1 1.5 1.7 1.7 0 0 0 1.8-.3l.1-.1a2 2 0 1 1 2.8 2.8l-.1.1a1.7 1.7 0 0 0-.3 1.8V9a1.7 1.7 0 0 0 1.5 1H21a2 2 0 1 1 0 4h-.1a1.7 1.7 0 0 0-1.5 1z"/></>);
const IcoBook        = _I(<><path d="M4 4.5A2.5 2.5 0 0 1 6.5 2H20v17H6.5A2.5 2.5 0 0 0 4 21.5v-17z"/><path d="M4 19.5A2.5 2.5 0 0 1 6.5 22H20"/></>);
const IcoText        = _I(<><path d="M4 7V5h16v2"/><path d="M9 5v14"/><path d="M15 5v14"/><path d="M6 19h12"/></>);
const IcoVocab       = _I(<><path d="M3 5a2 2 0 0 1 2-2h6v18H5a2 2 0 0 1-2-2V5z"/><path d="M21 5a2 2 0 0 0-2-2h-6v18h6a2 2 0 0 0 2-2V5z"/><path d="M6 8h3M6 12h3M15 8h3M15 12h3"/></>);
const IcoCheck       = _I(<><path d="m5 12 5 5L20 7"/></>);
const IcoCheckCircle = _I(<><circle cx="12" cy="12" r="9"/><path d="m8 12 3 3 5-6"/></>);
const IcoArrowRight  = _I(<><path d="M5 12h14"/><path d="m13 5 7 7-7 7"/></>);
const IcoArrowLeft   = _I(<><path d="M19 12H5"/><path d="m11 19-7-7 7-7"/></>);
const IcoClose       = _I(<><path d="M6 6 18 18"/><path d="M18 6 6 18"/></>);
const IcoVolume      = _I(<><path d="M11 5 6 9H3v6h3l5 4V5z"/><path d="M15.5 8.5a5 5 0 0 1 0 7"/><path d="M19 5a9 9 0 0 1 0 14"/></>);
const IcoVolumeOn    = _I(<><path d="M11 5 6 9H3v6h3l5 4V5z"/><path d="M15.5 8.5a5 5 0 0 1 0 7"/></>);
const IcoChild       = _I(<><circle cx="12" cy="6" r="3"/><path d="M6 21v-3a6 6 0 0 1 12 0v3"/></>);
const IcoCake        = _I(<><path d="M3 19V12a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2v7"/><path d="M3 16h18"/><path d="M12 10V6"/><path d="M12 4v.01"/><path d="M3 21h18"/></>);
const IcoGlobe       = _I(<><circle cx="12" cy="12" r="9"/><path d="M3 12h18"/><path d="M12 3a14 14 0 0 1 0 18"/><path d="M12 3a14 14 0 0 0 0 18"/></>);
const IcoHome        = _I(<><path d="m3 11 9-8 9 8"/><path d="M5 10v10a1 1 0 0 0 1 1h12a1 1 0 0 0 1-1V10"/></>);
const IcoPlus        = _I(<><path d="M12 5v14M5 12h14"/></>);
const IcoLeft        = _I(<><path d="m15 18-6-6 6-6"/></>);
const IcoMore        = _I(<><circle cx="5" cy="12" r="1" fill="currentColor"/><circle cx="12" cy="12" r="1" fill="currentColor"/><circle cx="19" cy="12" r="1" fill="currentColor"/></>);
const IcoEye         = _I(<><path d="M1 12s4-7 11-7 11 7 11 7-4 7-11 7S1 12 1 12z"/><circle cx="12" cy="12" r="3"/></>);
const IcoLightbulb   = _I(<><path d="M9 18h6"/><path d="M10 21h4"/><path d="M12 3a6 6 0 0 0-4 10.5c.7.7 1 1.7 1 2.5h6c0-.8.3-1.8 1-2.5A6 6 0 0 0 12 3z"/></>);
const IcoClock       = _I(<><circle cx="12" cy="12" r="9"/><path d="M12 7v5l3 2"/></>);
const IcoBolt        = _I(<><path d="M13 2 4 14h7l-1 8 9-12h-7l1-8z"/></>);
const IcoWave        = _I(<><path d="M3 12c2 0 2-4 4-4s2 8 4 8 2-8 4-8 2 4 4 4"/></>);
const IcoStar        = _I(<><path d="m12 3 2.7 5.5 6.1.9-4.4 4.3 1 6.1L12 17l-5.4 2.8 1-6.1L3.2 9.4l6.1-.9L12 3z"/></>);
const IcoAlert       = _I(<><path d="M10.29 3.86 1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"/><line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12.01" y2="17"/></>);

Object.assign(window, {
  IcoCamera, IcoUpload, IcoImage, IcoSparkles, IcoSettings, IcoBook, IcoText, IcoVocab,
  IcoCheck, IcoCheckCircle, IcoArrowRight, IcoArrowLeft, IcoClose, IcoVolume, IcoVolumeOn,
  IcoChild, IcoCake, IcoGlobe, IcoHome, IcoPlus, IcoLeft, IcoMore, IcoEye,
  IcoLightbulb, IcoClock, IcoBolt, IcoWave, IcoStar, IcoAlert,
});
