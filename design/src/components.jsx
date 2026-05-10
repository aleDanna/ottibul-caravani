// components.jsx — Nav, Footer, SearchBar, VehicleCard, shared UI
const { useState, useEffect, useRef, useMemo } = React;

// ---------- Icons (Lucide-style inline SVGs) ----------
const Icon = ({ name, className = 'icon', stroke = 1.75 }) => {
  const paths = {
    search: <><circle cx="11" cy="11" r="7"/><path d="m20 20-3.5-3.5"/></>,
    'map-pin': <><path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0Z"/><circle cx="12" cy="10" r="3"/></>,
    calendar: <><rect x="3" y="5" width="18" height="16" rx="2"/><path d="M16 3v4M8 3v4M3 11h18"/></>,
    users: <><circle cx="9" cy="8" r="4"/><path d="M2 21a7 7 0 0 1 14 0"/><circle cx="17" cy="9" r="3"/><path d="M22 20a5 5 0 0 0-7-4.6"/></>,
    truck: <><path d="M2 17V6a1 1 0 0 1 1-1h11v12"/><path d="M14 9h4l3 4v4h-2"/><circle cx="7" cy="18" r="2"/><circle cx="17" cy="18" r="2"/></>,
    bike: <><circle cx="6" cy="17" r="4"/><circle cx="18" cy="17" r="4"/><path d="m6 17 4-9h5l3 9"/><path d="M11 6h3"/></>,
    caravan: <><path d="M2 17V6a1 1 0 0 1 1-1h15a3 3 0 0 1 3 3v9"/><path d="M2 17h20"/><circle cx="8" cy="18" r="2"/></>,
    star: <path d="m12 3 2.6 5.6 6 .6-4.5 4.2 1.3 6-5.4-3.2L6.6 19.4l1.3-6L3.4 9.2l6-.6Z"/>,
    check: <path d="m4 12 5 5L20 6"/>,
    'arrow-right': <><path d="M5 12h14"/><path d="m12 5 7 7-7 7"/></>,
    'arrow-left': <><path d="M19 12H5"/><path d="m12 19-7-7 7-7"/></>,
    'chevron-right': <path d="m9 6 6 6-6 6"/>,
    'chevron-left': <path d="m15 6-6 6 6 6"/>,
    'chevron-down': <path d="m6 9 6 6 6-6"/>,
    x: <><path d="M18 6 6 18"/><path d="m6 6 12 12"/></>,
    menu: <><path d="M4 6h16"/><path d="M4 12h16"/><path d="M4 18h16"/></>,
    shield: <><path d="M12 2 4 5v6c0 5 3.5 9 8 11 4.5-2 8-6 8-11V5l-8-3Z"/></>,
    sparkles: <><path d="M12 3v4M12 17v4M3 12h4M17 12h4"/><path d="m6 6 2.5 2.5M15.5 15.5 18 18M6 18l2.5-2.5M15.5 8.5 18 6"/></>,
    leaf: <><path d="M11 20A7 7 0 0 1 4 13c0-5 3-9 17-9-1 11-5 16-10 16Z"/><path d="M2 22c4-4 5-8 9-12"/></>,
    heart: <path d="M12 21s-7-4.5-7-11a4 4 0 0 1 7-2.5A4 4 0 0 1 19 10c0 6.5-7 11-7 11Z"/>,
    'phone': <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.86 19.86 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.86 19.86 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 13 13 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 13 13 0 0 0 2.81.7A2 2 0 0 1 22 16.92Z"/>,
    mail: <><rect x="3" y="5" width="18" height="14" rx="2"/><path d="m3 7 9 6 9-6"/></>,
    snowflake: <><path d="M12 2v20M2 12h20m-2.5-7.5-15 15m0-15 15 15"/></>,
    'wifi': <><path d="M5 12.5a10 10 0 0 1 14 0"/><path d="M8.5 16a5 5 0 0 1 7 0"/><circle cx="12" cy="19" r="1"/></>,
    'fuel': <><path d="M3 21V5a2 2 0 0 1 2-2h7a2 2 0 0 1 2 2v16"/><path d="M2 21h14"/><path d="M14 8h2a2 2 0 0 1 2 2v6a1 1 0 0 0 1 1 1 1 0 0 0 1-1V9.41a1 1 0 0 0-.29-.71l-2.21-2.2"/></>,
    instagram: <><rect x="3" y="3" width="18" height="18" rx="5"/><circle cx="12" cy="12" r="4"/><circle cx="17.5" cy="6.5" r="0.6" fill="currentColor" stroke="none"/></>,
    facebook: <path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3Z"/>,
    'youtube': <><path d="M22 8s-.2-1.5-.8-2.1c-.8-.9-1.7-.9-2.1-1C16.1 4.5 12 4.5 12 4.5s-4.1 0-7.1.4c-.4.1-1.3.1-2.1 1C2.2 6.5 2 8 2 8S1.8 9.7 1.8 11.5v1c0 1.8.2 3.5.2 3.5s.2 1.5.8 2.1c.8.9 1.9.9 2.4 1 1.7.2 7.3.4 7.3.4s4.1 0 7.1-.4c.4-.1 1.3-.1 2.1-1 .6-.6.8-2.1.8-2.1s.2-1.7.2-3.5v-1c0-1.8-.2-3.5-.2-3.5Z"/><path d="m10 15 5-3-5-3Z"/></>,
    bed: <><path d="M2 9v12"/><path d="M22 12v9"/><path d="M2 15h20"/><path d="M2 12h13a4 4 0 0 1 4 4"/><circle cx="7" cy="11" r="2"/></>,
    ruler: <path d="M21 11.5 11.5 2 2 11.5l9.5 9.5L21 11.5Zm-13 0 1.5 1.5M11 8.5l1.5 1.5M14 5.5 15.5 7"/>,
    settings: <><path d="M12 15a3 3 0 1 0 0-6 3 3 0 0 0 0 6Z"/><path d="M19.4 15a1.6 1.6 0 0 0 .3 1.8l.1.1a2 2 0 1 1-2.8 2.8l-.1-.1a1.6 1.6 0 0 0-1.8-.3 1.6 1.6 0 0 0-1 1.5V21a2 2 0 1 1-4 0v-.1a1.6 1.6 0 0 0-1-1.5 1.6 1.6 0 0 0-1.8.3l-.1.1A2 2 0 1 1 4.4 17l.1-.1a1.6 1.6 0 0 0 .3-1.8 1.6 1.6 0 0 0-1.5-1H3a2 2 0 1 1 0-4h.1a1.6 1.6 0 0 0 1.5-1 1.6 1.6 0 0 0-.3-1.8l-.1-.1A2 2 0 1 1 7 4.4l.1.1a1.6 1.6 0 0 0 1.8.3h.1a1.6 1.6 0 0 0 1-1.5V3a2 2 0 1 1 4 0v.1a1.6 1.6 0 0 0 1 1.5h.1a1.6 1.6 0 0 0 1.8-.3l.1-.1A2 2 0 1 1 19.6 7l-.1.1a1.6 1.6 0 0 0-.3 1.8v.1a1.6 1.6 0 0 0 1.5 1H21a2 2 0 1 1 0 4h-.1a1.6 1.6 0 0 0-1.5 1Z"/></>,
    info: <><circle cx="12" cy="12" r="10"/><path d="M12 16v-4M12 8h.01"/></>,
    award: <><circle cx="12" cy="9" r="6"/><path d="m9 14-2 7 5-3 5 3-2-7"/></>,
  };
  const p = paths[name];
  if (!p) return null;
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={stroke} strokeLinecap="round" strokeLinejoin="round">
      {p}
    </svg>
  );
};

// ---------- Logo ----------
const Logo = ({ light }) => (
  <a href="#/" className="nav-logo-link">
    <img className="nav-logo" src={light ? 'assets/logo-ottibull-light.svg' : 'assets/logo-ottibull.svg'} alt="Ottibull Caravanaing"/>
  </a>
);

// ---------- Nav ----------
const NAV_LINKS = [
  { href: '#/cerca', label: 'Buscar vehículos' },
  { href: '#/come-funziona', label: 'Cómo funciona' },
  { href: '#/storie', label: 'Historias' },
  { href: '#/chi-siamo', label: 'Quiénes somos' },
  { href: '#/contatti', label: 'Contacto' },
];

const Nav = ({ route }) => {
  const [open, setOpen] = useState(false);
  useEffect(() => { setOpen(false); }, [route]);
  const isActive = (href) => route.startsWith(href.replace('#', ''));
  return (
    <header className="nav">
      <div className="container nav-inner">
        <Logo />
        <nav className="nav-links">
          {NAV_LINKS.map(l => (
            <a key={l.href} href={l.href} className="nav-link" data-active={isActive(l.href)}>{l.label}</a>
          ))}
        </nav>
        <div className="nav-cta">
          <a href="#/account" className="nav-link desktop-only">Acceder</a>
          <a href="#/cerca" className="btn btn--primary btn--sm">Reservar</a>
          <button className="nav-mobile-toggle btn btn--ghost" onClick={() => setOpen(o => !o)} aria-label="Menu">
            <Icon name={open ? 'x' : 'menu'}/>
          </button>
        </div>
      </div>
      <div className="mobile-menu" data-open={open}>
        {NAV_LINKS.map(l => (
          <a key={l.href} href={l.href} className="nav-link" data-active={isActive(l.href)}>{l.label}</a>
        ))}
        <a href="#/account" className="nav-link">Acceder</a>
      </div>
    </header>
  );
};

// ---------- Footer ----------
const Footer = () => (
  <footer className="footer">
    <div className="container">
      <div className="footer-grid">
        <div>
          <img src="assets/logo-ottibull-light.svg" alt="Ottibull" style={{height: 40, marginBottom: 16}}/>
          <p style={{color: 'var(--bosco-200)', fontSize: 'var(--fs-sm)', maxWidth: 320}}>
            La carretera es de quien la toma. Autocaravanas, roulotte e moto a noleggio in 14 ciudades italianas.
          </p>
          <div style={{display:'flex', gap: 8, marginTop: 20}}>
            <a href="#" aria-label="Instagram"><Icon name="instagram"/></a>
            <a href="#" aria-label="Facebook"><Icon name="facebook"/></a>
            <a href="#" aria-label="YouTube"><Icon name="youtube"/></a>
          </div>
        </div>
        <div>
          <h4>Alquiler</h4>
          <a href="#/cerca?cat=camper">Autocaravanas</a><br/>
          <a href="#/cerca?cat=roulotte">Caravanaas</a><br/>
          <a href="#/cerca?cat=moto">Motos</a><br/>
          <a href="#/cerca">Todos los vehículos</a><br/>
          <a href="#/destinazioni">Destinos</a>
        </div>
        <div>
          <h4>Ayuda</h4>
          <a href="#/come-funziona">Cómo funciona</a><br/>
          <a href="#/faq">Preguntas frecuentes</a><br/>
          <a href="#/assicurazione">Seguro</a><br/>
          <a href="#/contatti">Contacto</a>
        </div>
        <div>
          <h4>Empresa</h4>
          <a href="#/chi-siamo">Quiénes somos</a><br/>
          <a href="#/storie">Historias de viaje</a><br/>
          <a href="#/lavora">Trabaja con nosotros</a><br/>
          <a href="#/stampa">Prensa</a>
        </div>
      </div>
      <div className="footer-bottom">
        <span>© 2026 Ottibull Caravanaing · P.IVA 02685590362</span>
        <div style={{display: 'flex', gap: 24}}>
          <a href="#/privacy">Privacy</a>
          <a href="#/cookie">Cookie</a>
          <a href="#/termini">Términos</a>
        </div>
      </div>
    </div>
  </footer>
);

// ---------- Vehicle photo placeholder ----------
const VehPhoto = ({ tone, label, className = '' }) => {
  const cls = tone ? `veh-photo veh-photo--${tone}` : 'veh-photo';
  return (
    <div className={`${cls} ${className}`}>
      {label ? <span className="veh-label">{label}</span> : null}
    </div>
  );
};

// ---------- Vehicle card ----------
const CAT_ICON = { camper: 'truck', roulotte: 'caravan', moto: 'bike' };

const VehicleCard = ({ v }) => (
  <a href={`#/veicolo/${v.id}`} className="vehicle-card" aria-label={v.name}>
    <VehPhoto tone={v.tone} label={`${v.cat} · ${v.type}`}/>
    <div className="vc-body">
      <div className="vc-row">
        <span className="vc-title">{v.name}</span>
        <span style={{display:'inline-flex', alignItems:'center', gap:4, fontSize:'var(--fs-sm)', color:'var(--fg-2)'}}>
          <Icon name="star" className="icon-sm" stroke={0}/>
          <svg width="0" height="0"><defs/></svg>
          {v.rating}
        </span>
      </div>
      <div className="vc-meta">
        <span><Icon name={CAT_ICON[v.cat]} className="icon-sm"/>{v.type}</span>
        {v.cat !== 'moto' ? <span><Icon name="bed" className="icon-sm"/>{v.sleeps} plazas noche</span>
          : <span><Icon name="users" className="icon-sm"/>{v.seats} plazas</span>}
        <span><Icon name="map-pin" className="icon-sm"/>{v.location}</span>
      </div>
      <div className="vc-row" style={{marginTop: 8}}>
        <span className="vc-price">€{v.pricePerDay} <small>/ día</small></span>
        {v.premium && <span className="badge badge--sole">Premium</span>}
      </div>
    </div>
  </a>
);

// ---------- Search bar ----------
const SearchBar = ({ onSubmit, initial = {} }) => {
  const [where, setWhere] = useState(initial.where || '');
  const [from, setFrom] = useState(initial.from || '');
  const [to, setTo] = useState(initial.to || '');
  const [cat, setCat] = useState(initial.cat || 'tutti');
  const submit = (e) => {
    e.preventDefault();
    const params = new URLSearchParams();
    if (where) params.set('where', where);
    if (from) params.set('from', from);
    if (to) params.set('to', to);
    if (cat && cat !== 'tutti') params.set('cat', cat);
    location.hash = '#/cerca' + (params.toString() ? '?' + params.toString() : '');
    onSubmit?.();
  };
  return (
    <form className="searchbar" onSubmit={submit}>
      <label className="searchbar-cell">
        <span className="field-label">Dónde</span>
        <select className="select" value={where} onChange={e => setWhere(e.target.value)}>
          <option value="">Todas las ciudades</option>
          {window.OTTI_DATA.CITIES.map(c => <option key={c} value={c}>{c}</option>)}
        </select>
      </label>
      <label className="searchbar-cell">
        <span className="field-label">Recogida</span>
        <input className="input" type="date" value={from} onChange={e => setFrom(e.target.value)}/>
      </label>
      <label className="searchbar-cell">
        <span className="field-label">Devolución</span>
        <input className="input" type="date" value={to} onChange={e => setTo(e.target.value)}/>
      </label>
      <label className="searchbar-cell">
        <span className="field-label">Categoría</span>
        <select className="select" value={cat} onChange={e => setCat(e.target.value)}>
          <option value="tutti">Todas</option>
          <option value="camper">Autocaravanas</option>
          <option value="roulotte">Caravanaas</option>
          <option value="moto">Motos</option>
        </select>
      </label>
      <div className="searchbar-submit">
        <button type="submit" className="btn btn--primary"><Icon name="search"/>Buscar</button>
      </div>
    </form>
  );
};

// ---------- Toast ----------
const Toast = ({ message, onDismiss }) => {
  useEffect(() => {
    const t = setTimeout(() => onDismiss?.(), 3500);
    return () => clearTimeout(t);
  }, [message]);
  if (!message) return null;
  return <div className="toast"><Icon name="check" className="icon-sm"/>{message}</div>;
};

// ---------- Page hero with breadcrumb ----------
const PageHero = ({ crumbs = [], title, sub, children }) => (
  <section className="page-hero">
    <div className="container">
      <nav className="breadcrumb">
        <a href="#/">Home</a>
        {crumbs.map((c, i) => (
          <React.Fragment key={i}>
            <Icon name="chevron-right" className="icon-sm"/>
            {c.href ? <a href={c.href}>{c.label}</a> : <span>{c.label}</span>}
          </React.Fragment>
        ))}
      </nav>
      <h1>{title}</h1>
      {sub && <p className="lead" style={{marginTop: 12, maxWidth: 640}}>{sub}</p>}
      {children}
    </div>
  </section>
);

Object.assign(window, {
  Icon, Logo, Nav, Footer, VehPhoto, VehicleCard, SearchBar, Toast, PageHero, CAT_ICON,
});
