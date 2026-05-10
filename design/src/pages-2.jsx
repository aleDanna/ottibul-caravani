// pages-2.jsx — Booking flow + secondary pages
const { useState: uS, useEffect: uE } = React;

// =================================================================
// BOOKING (3 step)
// =================================================================
const BookingPage = ({ id, onToast }) => {
  const v = window.OTTI_DATA.FLEET.find(x => x.id === id);
  const [step, setStep] = uS(1);
  const [form, setForm] = uS({
    from: '', to: '', persons: 2,
    nome: '', cognome: '', email: '', tel: '',
    extras: { pulizia: false, kmExtra: false, secondoGuid: false, secondaryDriver: false },
    pagamento: 'carta',
    accept: false,
  });
  const [errors, setErrors] = uS({});

  if (!v) return <main className="container section"><h2>Vehículo no encontrado.</h2></main>;

  const days = (() => {
    if (!form.from || !form.to) return 7;
    const d = (new Fechas(form.to) - new Fechas(form.from)) / 86400000;
    return Math.max(1, Math.round(d));
  })();
  const extrasCost =
    (form.extras.pulizia ? 60 : 0) +
    (form.extras.kmExtra ? 80 : 0) +
    (form.extras.secondoGuid ? 40 : 0);
  const subtotal = v.pricePerDay * days;
  const total = subtotal + extrasCost;

  const validate1 = () => {
    const e = {};
    if (!form.from) e.from = 'Selecciona una fecha';
    if (!form.to) e.to = 'Selecciona una fecha';
    if (form.from && form.to && new Fechas(form.to) <= new Fechas(form.from)) e.to = 'Debe ser posterior a la recogida';
    setErrors(e);
    return Object.keys(e).length === 0;
  };
  const validate2 = () => {
    const e = {};
    if (!form.nome) e.nome = 'Falta el nombre';
    if (!form.cognome) e.cognome = 'Falta el apellido';
    if (!form.email || !/.+@.+\..+/.test(form.email)) e.email = 'Email no válido';
    if (!form.tel || form.tel.replace(/\D/g,'').length < 8) e.tel = 'Teléfono non valido';
    setErrors(e);
    return Object.keys(e).length === 0;
  };
  const next = () => {
    if (step === 1 && !validate1()) return;
    if (step === 2 && !validate2()) return;
    setStep(s => Math.min(4, s + 1));
    window.scrollTo({top: 0, behavior: 'smooth'});
  };
  const back = () => { setStep(s => Math.max(1, s - 1)); setErrors({}); };

  const setExtras = (k, val) => setForm(f => ({...f, extras: {...f.extras, [k]: val}}));

  return (
    <main className="page-enter">
      <PageHero crumbs={[{label: v.name, href:`#/veicolo/${v.id}`}, {label:'Reservarzione'}]} title="Reservar il tuo viaggio"/>

      <section className="section-sm">
        <div className="container">
          <div className="steps" style={{marginBottom: 40}}>
            {[
              {n:1, t:'Fechas'},
              {n:2, t:'Datos'},
              {n:3, t:'Pago'},
              {n:4, t:'Confirmación'},
            ].map((s, i, arr) => (
              <React.Fragment key={s.n}>
                <div className="step" data-state={step === s.n ? 'active' : step > s.n ? 'done' : ''}>
                  <span className="step-num">{step > s.n ? <Icon name="check" className="icon-sm" stroke={2.5}/> : s.n}</span>
                  <span>{s.t}</span>
                </div>
                {i < arr.length - 1 && <span className="step-divider"/>}
              </React.Fragment>
            ))}
          </div>

          {step < 4 ? (
            <div style={{display:'grid', gridTemplateColumns:'1fr 380px', gap: 64, alignItems:'start'}}>
              <div>
                {/* STEP 1 */}
                {step === 1 && (
                  <div>
                    <h2 style={{fontSize:'var(--fs-2xl)', fontWeight: 600}}>¿Cuándo partes?</h2>
                    <p className="text-meta mt-2">Recogida disponibile dalle 9:00 alle 19:00 nella sede di {v.location}.</p>

                    <div className="grid-2 mt-8">
                      <div className="field">
                        <span className="field-label">Fecha recogida</span>
                        <input className="input" type="date" value={form.from} onChange={e => setForm(f => ({...f, from: e.target.value}))}/>
                        {errors.from && <span style={{color:'var(--danger)', fontSize:'var(--fs-xs)'}}>{errors.from}</span>}
                      </div>
                      <div className="field">
                        <span className="field-label">Fecha devolución</span>
                        <input className="input" type="date" value={form.to} onChange={e => setForm(f => ({...f, to: e.target.value}))}/>
                        {errors.to && <span style={{color:'var(--danger)', fontSize:'var(--fs-xs)'}}>{errors.to}</span>}
                      </div>
                      <div className="field">
                        <span className="field-label">Personas</span>
                        <select className="select" value={form.persons} onChange={e => setForm(f => ({...f, persons: +e.target.value}))}>
                          {Array.from({length: v.seats}, (_, i) => i+1).map(n => <option key={n} value={n}>{n} {n === 1 ? 'persona' : 'persone'}</option>)}
                        </select>
                      </div>
                    </div>

                    <h3 style={{fontSize:'var(--fs-lg)', fontWeight: 600, marginTop: 56}}>Servicios extra</h3>
                    <p className="text-meta mt-2" style={{marginBottom: 16}}>Añadidos al total, siempre cancelables antes dy la recogida.</p>
                    <div className="flex-col gap-3">
                      {[
                        {k:'pulizia', t:'Limpieza final', d:'Devoluciónlo come l\'hai trovato senza pensarci', p:60},
                        {k:'kmExtra', t:'Kilómetros ilimitados', d:'Estándar: 200 km/día. Con esta opción, viaja sin contar', p:80},
                        {k:'secondoGuid', t:'Segundo conductor', d:'Añade una persona al seguro', p:40},
                      ].map(x => (
                        <label key={x.k} className="card" style={{display:'flex', alignItems:'center', gap: 16, cursor:'pointer', padding: 16}}>
                          <input type="checkbox" checked={form.extras[x.k]} onChange={e => setExtras(x.k, e.target.checked)} style={{accentColor:'var(--bosco-700)', width: 18, height: 18}}/>
                          <div style={{flex: 1}}>
                            <div style={{fontWeight: 600}}>{x.t}</div>
                            <div className="text-meta" style={{fontSize:'var(--fs-sm)'}}>{x.d}</div>
                          </div>
                          <div style={{fontWeight: 600}}>+ €{x.p}</div>
                        </label>
                      ))}
                    </div>
                  </div>
                )}

                {/* STEP 2 */}
                {step === 2 && (
                  <div>
                    <h2 style={{fontSize:'var(--fs-2xl)', fontWeight: 600}}>Tus datos</h2>
                    <p className="text-meta mt-2">Sirven para el contrato y el check-in. Sin newsletters automáticas.</p>

                    <div className="grid-2 mt-8">
                      <div className="field">
                        <span className="field-label">Nombre</span>
                        <input className="input" value={form.nome} onChange={e => setForm(f => ({...f, nome: e.target.value}))}/>
                        {errors.nome && <span style={{color:'var(--danger)', fontSize:'var(--fs-xs)'}}>{errors.nome}</span>}
                      </div>
                      <div className="field">
                        <span className="field-label">Apellido</span>
                        <input className="input" value={form.cognome} onChange={e => setForm(f => ({...f, cognome: e.target.value}))}/>
                        {errors.cognome && <span style={{color:'var(--danger)', fontSize:'var(--fs-xs)'}}>{errors.cognome}</span>}
                      </div>
                      <div className="field">
                        <span className="field-label">Email</span>
                        <input className="input" type="email" placeholder="nome@esempio.it" value={form.email} onChange={e => setForm(f => ({...f, email: e.target.value}))}/>
                        {errors.email && <span style={{color:'var(--danger)', fontSize:'var(--fs-xs)'}}>{errors.email}</span>}
                      </div>
                      <div className="field">
                        <span className="field-label">Teléfono</span>
                        <input className="input" type="tel" placeholder="+39 ..." value={form.tel} onChange={e => setForm(f => ({...f, tel: e.target.value}))}/>
                        {errors.tel && <span style={{color:'var(--danger)', fontSize:'var(--fs-xs)'}}>{errors.tel}</span>}
                      </div>
                    </div>

                    <h3 style={{fontSize:'var(--fs-lg)', fontWeight: 600, marginTop: 56}}>Notas para nosotros</h3>
                    <textarea className="textarea mt-4" placeholder="Necesidades particulares, hora de llegada prevista, viajas con perro, ..."/>
                  </div>
                )}

                {/* STEP 3 */}
                {step === 3 && (
                  <div>
                    <h2 style={{fontSize:'var(--fs-2xl)', fontWeight: 600}}>Pago</h2>
                    <p className="text-meta mt-2">Pagas solo cuando confirmas. La fianza (€{v.deposit}) è preautorizada e liberada al regreso.</p>

                    <div className="flex-col gap-3 mt-8">
                      {[
                        {k:'carta', t:'Tarjeta de crédito', d:'Visa, Mastercard, American Express'},
                        {k:'bonifico', t:'Transferencia anticipada', d:'Disponibile hasta 5 giorni prima del ritiro'},
                        {k:'sede', t:'En sede al recoger', d:'Hasta 500 € en efectivo, el resto con tarjeta'},
                      ].map(x => (
                        <label key={x.k} className="card" style={{display:'flex', alignItems:'center', gap: 16, cursor:'pointer', padding: 16, borderColor: form.pagamento === x.k ? 'var(--bosco-700)' : ''}}>
                          <input type="radio" name="pag" checked={form.pagamento === x.k} onChange={() => setForm(f => ({...f, pagamento: x.k}))} style={{accentColor:'var(--bosco-700)', width: 18, height: 18}}/>
                          <div style={{flex: 1}}>
                            <div style={{fontWeight: 600}}>{x.t}</div>
                            <div className="text-meta" style={{fontSize:'var(--fs-sm)'}}>{x.d}</div>
                          </div>
                        </label>
                      ))}
                    </div>

                    {form.pagamento === 'carta' && (
                      <div className="card mt-6" style={{background:'var(--crema-100)'}}>
                        <div className="grid-2">
                          <div className="field" style={{gridColumn:'1 / -1'}}>
                            <span className="field-label">Número de tarjeta</span>
                            <input className="input" placeholder="1234 5678 9012 3456"/>
                          </div>
                          <div className="field">
                            <span className="field-label">Caducidad</span>
                            <input className="input" placeholder="MM / AA"/>
                          </div>
                          <div className="field">
                            <span className="field-label">CVV</span>
                            <input className="input" placeholder="123"/>
                          </div>
                        </div>
                      </div>
                    )}

                    <label className="checkbox mt-8" style={{padding: 12, alignItems:'flex-start'}}>
                      <input type="checkbox" checked={form.accept} onChange={e => setForm(f => ({...f, accept: e.target.checked}))} style={{marginTop: 2}}/>
                      <span style={{fontSize:'var(--fs-sm)', color:'var(--fg-2)'}}>Acepto los <a href="#/termini" className="text-link">términos de alquiler</a> y la <a href="#/privacy" className="text-link">privacy policy</a>.</span>
                    </label>
                  </div>
                )}

                <div style={{display:'flex', gap: 12, marginTop: 48}}>
                  {step > 1 && <button onClick={back} className="btn btn--secondary"><Icon name="arrow-left"/>Atrás</button>}
                  {step < 3 && <button onClick={next} className="btn btn--primary">Continuar<Icon name="arrow-right"/></button>}
                  {step === 3 && <button onClick={() => { if (!form.accept) { alert('Acepta los términos para continuar'); return; } setStep(4); window.scrollTo({top:0}); }} className="btn btn--primary" disabled={!form.accept}>Confirmación e prenota<Icon name="arrow-right"/></button>}
                </div>
              </div>

              {/* SUMMARY */}
              <aside className="sticky-side">
                <div className="card card--lifted">
                  <div className="flex gap-3 items-center">
                    <div style={{width: 64, height: 64, flexShrink: 0}}><VehPhoto tone={v.tone} className="" label=""/></div>
                    <div>
                      <div style={{fontWeight: 600, fontSize:'var(--fs-sm)'}}>{v.name}</div>
                      <div className="text-meta" style={{fontSize:'var(--fs-xs)'}}>{v.type} · {v.location}</div>
                    </div>
                  </div>
                  <hr className="divider" style={{margin:'20px 0'}}/>
                  <dl className="kv">
                    <dt>Del</dt><dd>{form.from || '—'}</dd>
                    <dt>Al</dt><dd>{form.to || '—'}</dd>
                    <dt>Días</dt><dd>{days}</dd>
                    <dt>Personas</dt><dd>{form.persons}</dd>
                  </dl>
                  <hr className="divider" style={{margin:'20px 0'}}/>
                  <dl className="kv">
                    <dt>{days} días × €{v.pricePerDay}</dt><dd>€{subtotal}</dd>
                    {extrasCost > 0 && <><dt>Extra</dt><dd>€{extrasCost}</dd></>}
                  </dl>
                  <hr className="divider" style={{margin:'20px 0'}}/>
                  <div className="flex justify-between" style={{fontSize:'var(--fs-md)', fontWeight: 700, alignItems:'baseline'}}>
                    <span>Total</span>
                    <span style={{fontFamily:'var(--font-display)', fontSize:'var(--fs-2xl)'}}>€{total.toLocaleString('it-IT')}</span>
                  </div>
                  <p className="text-meta mt-3" style={{fontSize:'var(--fs-xs)'}}>+ fianza €{v.deposit} preautorizada</p>
                </div>
              </aside>
            </div>
          ) : (
            // STEP 4 — CONFIRMATION
            <div className="text-center" style={{maxWidth: 640, margin: '0 auto', padding: '48px 0'}}>
              <div style={{width: 80, height: 80, borderRadius:'50%', background:'var(--bosco-100)', color:'var(--bosco-800)', display:'inline-flex', alignItems:'center', justifyContent:'center', margin:'0 auto'}}>
                <Icon name="check" stroke={3} className="icon-lg"/>
              </div>
              <h1 style={{fontFamily:'var(--font-display)', fontSize:'clamp(40px, 5vw, 60px)', fontWeight: 400, lineHeight: 1.05, marginTop: 24}}>
                Todo listo. <em style={{fontStyle:'italic', color:'var(--bosco-700)'}}>Nos vemos el {form.from && new Fechas(form.from).toLocaleFechasString('it-IT', {weekday:'long'})}.</em>
              </h1>
              <p className="lead mt-4">Te hemos enviado la confirmación a <strong>{form.email}</strong>. Código de reserva <code style={{background:'var(--crema-100)', padding:'4px 10px', borderRadius: 4, fontFamily:'var(--font-mono)'}}>OTT-{Fechas.now().toString(36).toUpperCase().slice(-6)}</code>.</p>

              <div className="card card--feature mt-8 text-center" style={{textAlign:'left'}}>
                <h4>Próximos pasos</h4>
                <div className="flex-col gap-3 mt-4">
                  {[
                    'Recibirás un recordatorio 3 días antes de la recogida',
                    'Trae carné, tarjeta de crédito y NIF al check-in',
                    'El check-in dura 30 minutos — tomémonos el tiempo para explicártelo todo',
                  ].map((t, i) => <div key={i} className="flex items-center gap-3"><Icon name="check" className="icon-sm" stroke={2}/><span style={{fontSize:'var(--fs-sm)'}}>{t}</span></div>)}
                </div>
              </div>

              <div className="flex gap-3 justify-center mt-8">
                <a href="#/" className="btn btn--primary">Volver al inicio</a>
                <a href="#/account" className="btn btn--secondary">Mis reservas</a>
              </div>
            </div>
          )}
        </div>
      </section>
    </main>
  );
};

// =================================================================
// HOW IT WORKS
// =================================================================
const HowItWorksPage = () => (
  <main className="page-enter">
    <PageHero crumbs={[{label:'Cómo funciona'}]}
      title="Tres pasos y estás en marcha."
      sub="La forma Ottibull de alquilar. Sin sorpresas, sin extras, sin formularios que firmar deprisa."/>

    <section className="section">
      <div className="container">
        <div className="flex-col gap-12">
          {[
            {n:'01', t:'Buscas y reservas online', d:'Eliges ciudad, fechas, vehículo. Confirmas en 2 minutos. Pagas solo cuando estás seguro.', img:''},
            {n:'02', t:'Recoges en sede', d:'Te recibimos, te explicamos el vehículo durante 30 minutos, firmamos el contrato y partes. Limpio, revisado, gas y agua llenos.', img:'bosco'},
            {n:'03', t:'Vives el viaje', d:'Asistencia real al telefono, sette giorni su sette. Una persona, in 5 minuti, pronta a risolvere.', img:'cielo'},
            {n:'04', t:'Vuelves y te vas', d:'Devolución in 15 minuti. Niente extra a sorpresa, niente penali nascoste. Fianza sbloccata in 3 giorni.', img:'terra'},
          ].map((s, i) => (
            <div key={s.n} style={{display:'grid', gridTemplateColumns: i % 2 ? '1fr 1.2fr' : '1.2fr 1fr', gap: 64, alignItems:'center'}}>
              {i % 2 === 0 ? (
                <div>
                  <span style={{fontFamily:'var(--font-display)', fontSize: 80, color:'var(--sole-500)', lineHeight: 1}}>{s.n}</span>
                  <h2 style={{fontFamily:'var(--font-display)', fontSize:'var(--fs-3xl)', fontWeight: 400, marginTop: 16}}>{s.t}</h2>
                  <p className="lead mt-4">{s.d}</p>
                </div>
              ) : null}
              <VehPhoto tone={s.img} className="" label="" style={{aspectRatio:'4/3', borderRadius:'var(--radius-xl)'}}/>
              {i % 2 === 1 ? (
                <div>
                  <span style={{fontFamily:'var(--font-display)', fontSize: 80, color:'var(--sole-500)', lineHeight: 1}}>{s.n}</span>
                  <h2 style={{fontFamily:'var(--font-display)', fontSize:'var(--fs-3xl)', fontWeight: 400, marginTop: 16}}>{s.t}</h2>
                  <p className="lead mt-4">{s.d}</p>
                </div>
              ) : null}
            </div>
          ))}
        </div>
      </div>
    </section>

    <section className="section">
      <div className="container">
        <div className="section-head"><div><h2>Preguntas comunes.</h2></div></div>
        <div className="flex-col gap-4">
          {[
            {q:'Qué está incluido nel prezzo?', a:'Veicolo pulito e controllato, assicurazione completa hasta 5.000 € senza franchigia, 200 km al giorno, soccorso stradale Europa. La pulizia finale e i km illimitati sono extra opzionali.'},
            {q:'¿Puedo cancelar?', a:'Sì, gratuitamente hasta 7 giorni prima del ritiro. Da 7 a 3 giorni prima trattieni il 30%. Da 3 giorni prima trattieni il 70%.'},
            {q:'¿Hacen falta carnés especiales?', a:'Para autocaravanas de menos de 3,5 t basta el carné B. Para motos hace falta A o A2 según el modelo. Para caravanas de más de 750 kg hace falta B+E.'},
            {q:'¿Puedo llevar al perro?', a:'Su molti veicoli sì, cerca il filtro "Admite mascotas". Pulizia animali compresa.'},
            {q:'Cómo funciona la cauzione?', a:'Preautorizada en la tarjeta al recoger, liberada en 3 días laborables al regreso. No se cobra si el vehículo está en orden.'},
          ].map(f => <FaqItem key={f.q} {...f}/>)}
        </div>
      </div>
    </section>
  </main>
);

const FaqItem = ({ q, a }) => {
  const [open, set] = uS(false);
  return (
    <div className="card" style={{cursor:'pointer'}} onClick={() => set(o => !o)}>
      <div className="flex justify-between items-center gap-4">
        <h4 style={{fontSize:'var(--fs-md)'}}>{q}</h4>
        <Icon name="chevron-down" style={{transform: open ? 'rotate(180deg)' : '', transition: 'transform 200ms'}} className="icon"/>
      </div>
      {open && <p className="text-2 mt-3" style={{maxWidth: 720}}>{a}</p>}
    </div>
  );
};

// =================================================================
// ABOUT
// =================================================================
const AboutPage = () => (
  <main className="page-enter">
    <PageHero crumbs={[{label:'Quiénes somos'}]}
      title="Cresciuti su carretera."
      sub="Ottibull nasce da quattro personas che hanno passato vent'anni in officina e in campeggio. Sappiamo cosa vuol dire un camper rotto a 200 km da casa. Per questo facciamo le cose come le faremmo per noi."/>

    <section className="section">
      <div className="container">
        <div className="grid-2" style={{alignItems: 'center'}}>
          <VehPhoto tone="bosco" label="" className="" style={{aspectRatio:'4/5', borderRadius:'var(--radius-xl)'}}/>
          <div>
            <span className="eyebrow">La historia</span>
            <h2 style={{marginTop: 12, fontFamily:'var(--font-display)', fontSize:'var(--fs-3xl)', fontWeight: 400, lineHeight: 1.1}}>
              De taller de pueblo a 14 sedes italianas.
            </h2>
            <p className="lead mt-4">Empezamos en 2008 con dos autocaravanas usadas en un taller de Verona. Hoy gestionamos más de 120 vehículos en toda Italia, pero la forma de trabajar es la misma: cada vehículo vuelve al taller tras cada alquiler, a cada cliente lo conocemos por su nombre.</p>
            <p className="mt-4 text-2">Non siamo una piattaforma. Non siamo intermediari. Todos los vehículos sono nostri, tutto il personale è nostro. Quando chiami, risponde uno di noi.</p>
          </div>
        </div>
      </div>
    </section>

    <section className="section">
      <div className="container">
        <div className="section-head"><div><h2>En lo que creemos.</h2></div></div>
        <div className="grid-3">
          {[
            {t:'Honestidad en el precio', d:'El precio que ves es el precio que pagas. Sin extras al regreso, sin costes ocultos.'},
            {t:'Mantenimiento real', d:'Cada vehículo vuelve al taller tras cada alquiler. No solo lavado: revisado.'},
            {t:'Respuesta humana', d:'Si tienes un problema, hablas con una persona en 5 minutos. Siempre.'},
          ].map(v => (
            <div key={v.t} className="card card--feature">
              <h4 style={{fontSize:'var(--fs-lg)'}}>{v.t}</h4>
              <p className="mt-3 text-2">{v.d}</p>
            </div>
          ))}
        </div>
      </div>
    </section>

    <section className="section">
      <div className="container">
        <div className="section-inverse" style={{padding: '80px 64px', textAlign: 'center'}}>
          <span className="eyebrow" style={{color: 'var(--sole-300)'}}>Los números</span>
          <h2 style={{marginTop: 16, color:'var(--crema-50)', fontFamily:'var(--font-display)', fontWeight: 400, fontSize:'clamp(36px, 4.5vw, 60px)', lineHeight: 1.05}}>Diciassette anni di carretera.</h2>
          <div style={{display:'grid', gridTemplateColumns:'repeat(4, 1fr)', gap: 32, marginTop: 56}}>
            {[
              {n:'17', l:'años de actividad'},
              {n:'14', l:'sedes en Italia'},
              {n:'120+', l:'vehículos en flota'},
              {n:'4.8', l:'media de reseñas'},
            ].map(s => (
              <div key={s.l}>
                <div style={{fontFamily:'var(--font-display)', fontSize:'clamp(48px, 8vw, 108px)', color:'var(--sole-400)', lineHeight: 1}}>{s.n}</div>
                <div className="text-2 mt-3">{s.l}</div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  </main>
);

// =================================================================
// CONTACT
// =================================================================
const ContactPage = () => {
  const [sent, setSent] = uS(false);
  return (
    <main className="page-enter">
      <PageHero crumbs={[{label:'Contacto'}]}
        title="Hablémoslo."
        sub="Una persona vera al telefono, sette giorni su sette. Per dubbi, prenotazioni, problemi en marcha."/>

      <section className="section">
        <div className="container">
          <div style={{display:'grid', gridTemplateColumns:'1fr 1.2fr', gap: 64}}>
            <div className="flex-col gap-8">
              <div>
                <span className="eyebrow">Teléfono</span>
                <h3 style={{fontFamily:'var(--font-display)', fontSize:'var(--fs-2xl)', fontWeight: 400, marginTop: 8}}>+39 045 123 4567</h3>
                <p className="text-meta mt-2">Todos los días 8:00 — 20:00</p>
              </div>
              <div>
                <span className="eyebrow">Email</span>
                <h3 style={{fontFamily:'var(--font-display)', fontSize:'var(--fs-2xl)', fontWeight: 400, marginTop: 8}}>ciao@ottibull.it</h3>
                <p className="text-meta mt-2">Respuesta en 4 horas</p>
              </div>
              <div>
                <span className="eyebrow">Sede principal</span>
                <h3 style={{fontFamily:'var(--font-display)', fontSize:'var(--fs-2xl)', fontWeight: 400, marginTop: 8}}>Verona</h3>
                <p className="text-meta mt-2">Via delle Strade Aperte 14, 37100</p>
                <a href="#/sedi" className="text-link mt-3">Todas le sedi <Icon name="arrow-right" className="icon-sm"/></a>
              </div>
              <div>
                <span className="eyebrow">Emergencia en viaje</span>
                <h3 style={{fontFamily:'var(--font-display)', fontSize:'var(--fs-2xl)', fontWeight: 400, marginTop: 8, color:'var(--terra-700)'}}>+39 045 123 4500</h3>
                <p className="text-meta mt-2">Número activo 24/7 para quien está de alquiler</p>
              </div>
            </div>

            <div className="card card--feature">
              {sent ? (
                <div className="text-center" style={{padding: 32}}>
                  <div style={{width: 64, height: 64, borderRadius:'50%', background:'var(--bosco-100)', color:'var(--bosco-800)', display:'inline-flex', alignItems:'center', justifyContent:'center', margin:'0 auto'}}>
                    <Icon name="check" stroke={3}/>
                  </div>
                  <h3 style={{fontFamily:'var(--font-display)', fontSize:'var(--fs-2xl)', fontWeight: 400, marginTop: 16}}>Te respondemos en 4 horas.</h3>
                  <p className="text-meta mt-2">Revisa el correo, también el spam.</p>
                </div>
              ) : (
                <form onSubmit={e => {e.preventDefault(); setSent(true);}}>
                  <h3 style={{fontFamily:'var(--font-display)', fontSize:'var(--fs-2xl)', fontWeight: 400}}>Escríbenos.</h3>
                  <div className="grid-2 mt-6">
                    <div className="field"><span className="field-label">Nombre</span><input className="input" required/></div>
                    <div className="field"><span className="field-label">Email</span><input className="input" type="email" required/></div>
                  </div>
                  <div className="field mt-4">
                    <span className="field-label">Asunto</span>
                    <select className="select">
                      <option>Información general</option>
                      <option>Reservarzione esistente</option>
                      <option>Vehículos de empresa</option>
                      <option>Trabaja con nosotros</option>
                    </select>
                  </div>
                  <div className="field mt-4">
                    <span className="field-label">Mensaje</span>
                    <textarea className="textarea" rows="5" required placeholder="Cuéntanos qué necesitas..."></textarea>
                  </div>
                  <button type="submit" className="btn btn--primary btn--lg btn--block mt-6">Enviar mensaje</button>
                </form>
              )}
            </div>
          </div>
        </div>
      </section>
    </main>
  );
};

// =================================================================
// STORIES INDEX
// =================================================================
const HistoriassPage = () => {
  const { STORIES } = window.OTTI_DATA;
  const more = [...STORIES,
    {id:'s4', title:'Toscana en 5 días: lo que hemos aprendido', meta:'Guía · 7 min', tone:''},
    {id:'s5', title:'Familia de cuatro en van compacta: ¿se puede?', meta:'Historia de viaje · 6 min', tone:'bosco'},
    {id:'s6', title:'Las 12 cosas que siempre llevo en la autocaravana', meta:'Lista · 4 min', tone:'cielo'},
  ];
  return (
    <main className="page-enter">
      <PageHero crumbs={[{label:'Historias de viaje'}]}
        title="Historias de viaje."
        sub="Reportajes, guías y cosas aprendidas en la carretera por quien pasa allí la vida."/>
      <section className="section">
        <div className="container">
          <div className="grid-3">
            {more.map(s => (
              <a key={s.id} href={`#/storia/${s.id}`} className="card card--lifted" style={{padding: 0, display:'flex', flexDirection:'column'}}>
                <VehPhoto tone={s.tone} label="" className=""/>
                <div style={{padding: 24}}>
                  <span className="text-meta">{s.meta}</span>
                  <h4 style={{marginTop: 8, fontSize:'var(--fs-lg)', fontWeight: 600}}>{s.title}</h4>
                </div>
              </a>
            ))}
          </div>
        </div>
      </section>
    </main>
  );
};

// =================================================================
// 404
// =================================================================
const NotFoundPage = () => (
  <main className="page-enter">
    <section className="section" style={{padding: '120px 0', textAlign: 'center'}}>
      <div className="container">
        <span className="eyebrow">404</span>
        <h1 style={{fontFamily:'var(--font-display)', fontSize:'clamp(48px, 8vw, 108px)', fontWeight: 400, marginTop: 16}}>Carretera cerrada.</h1>
        <p className="lead mt-4">La página que buscas no existe, o quizás esté aún en construcción.</p>
        <a href="#/" className="btn btn--primary mt-6">Volver al inicio</a>
      </div>
    </section>
  </main>
);

Object.assign(window, { BookingPage, HowItWorksPage, AboutPage, ContactPage, HistoriassPage, NotFoundPage });
