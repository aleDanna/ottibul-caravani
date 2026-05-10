// pages.jsx — tutte le pagine del sito Ottibull
const { useState: useS, useEffect: useE, useMemo: useM } = React;

// =================================================================
// HOME
// =================================================================
const HomePage = () => {
  const { FLEET, DESTINATIONS, STORIES } = window.OTTI_DATA;
  const [cat, setCat] = useS('tutti');
  const featured = useM(() => {
    const list = cat === 'tutti' ? FLEET : FLEET.filter(v => v.cat === cat);
    return list.slice(0, 4);
  }, [cat]);

  return (
    <main className="page-enter">
      {/* HERO */}
      <section className="hero">
        <div className="container">
          <div className="hero-grid">
            <div>
              <span className="eyebrow">Autocaravanas · Caravanaas · Motos</span>
              <h1 className="hero-display" style={{marginTop: 16}}>
                La carretera es de quien <em>la toma.</em>
              </h1>
              <p className="hero-sub">
                Autocaravanas, caravanas y motos de alquiler en 14 ciudades italianas. Recogida flexible, seguro incluido, sin sorpresas al regreso.
              </p>
              <div style={{display:'flex', gap: 12, marginTop: 32, flexWrap: 'wrap'}}>
                <a href="#/cerca" className="btn btn--primary btn--lg"><Icon name="search"/>Buscar disponibilidad</a>
                <a href="#/come-funziona" className="btn btn--ghost btn--lg">Cómo funciona</a>
              </div>
              <div style={{display:'flex', gap: 32, marginTop: 48, flexWrap: 'wrap'}}>
                <div className="stat"><span className="stat-num">14</span><span className="stat-label">ciudades italianas</span></div>
                <div className="stat"><span className="stat-num">120+</span><span className="stat-label">vehículos listos</span></div>
                <div className="stat"><span className="stat-num">4.8</span><span className="stat-label">media de reseñas</span></div>
              </div>
            </div>
            <div className="hero-stack">
              <div className="vc vc-1"><VehPhoto tone="" label=""/><span className="vc-tag">Capuchina · 6 plazas</span></div>
              <div className="vc vc-2"><VehPhoto tone="bosco" label=""/><span className="vc-tag">Van compacta</span></div>
              <div className="vc vc-3"><VehPhoto tone="terra" label=""/><span className="vc-tag">BMW R 1250 GS</span></div>
            </div>
          </div>
          <div style={{marginTop: 56}}><SearchBar/></div>
        </div>
      </section>

      {/* CATEGORIES */}
      <section className="section">
        <div className="container">
          <div className="section-head">
            <div>
              <span className="eyebrow">En flota ahora</span>
              <h2 style={{marginTop: 12}}>Elige cómo quieres <em style={{fontStyle:'italic', color:'var(--bosco-700)', fontFamily:'var(--font-display)'}}>partir.</em></h2>
            </div>
            <p className="section-sub">Tres formas distintas de vivir la misma libertad. Tú dime por dónde empiezas.</p>
          </div>

          <div style={{display:'flex', justifyContent:'center', marginBottom: 40}}>
            <div className="cat-tabs">
              {['tutti','camper','roulotte','moto'].map(c => (
                <button key={c} className="cat-tab" data-active={cat === c} onClick={() => setCat(c)}>
                  {c[0].toUpperCase()+c.slice(1)}
                </button>
              ))}
            </div>
          </div>

          <div className="grid-4">
            {featured.map(v => <VehicleCard key={v.id} v={v}/>)}
          </div>
          <div style={{textAlign:'center', marginTop: 40}}>
            <a href="#/cerca" className="text-link">Ver toda la flota <Icon name="arrow-right" className="icon-sm"/></a>
          </div>
        </div>
      </section>

      {/* WHY OTTIBULL */}
      <section className="section">
        <div className="container">
          <div className="section-head">
            <div>
              <h2>Sin sorpresas. Solo la <em style={{fontStyle:'italic', color:'var(--bosco-700)', fontFamily:'var(--font-display)'}}>carretera.</em></h2>
            </div>
          </div>
          <div className="grid-4">
            {[
              {icon:'shield', tone:'', t:'Seguro incluido', d:'Cobertura hasta 5.000 €, sin franquicia. Nada extra al regreso.'},
              {icon:'sparkles', tone:'sole', t:'Listo para partir', d:'Limpio, revisado, gas y agua llenos. Tú giras la llave.'},
              {icon:'leaf', tone:'cielo', t:'Recogida flexible', d:'Cambias fecha hasta 7 días antes. Sin penalizaciones.'},
              {icon:'phone', tone:'terra', t:'Asistencia real', d:'Una persona al teléfono en 5 minutos, siete días a la semana.'},
            ].map((f, i) => (
              <div key={i} className="feat" style={{flexDirection:'column'}}>
                <div className={`feat-icon${f.tone ? ' feat-icon--'+f.tone : ''}`}><Icon name={f.icon}/></div>
                <div>
                  <h4>{f.t}</h4>
                  <p>{f.d}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* DESTINATIONS */}
      <section className="section">
        <div className="container">
          <div className="section-head">
            <div>
              <span className="eyebrow">Destinos</span>
              <h2 style={{marginTop: 12}}>A dónde te lleva el próximo viaje.</h2>
            </div>
            <a href="#/destinazioni" className="text-link">Todos los destinos <Icon name="arrow-right" className="icon-sm"/></a>
          </div>
          <div className="grid-4">
            {DESTINATIONS.map(d => (
              <a key={d.id} href={`#/destinazione/${d.id}`} className="dest-card">
                <VehPhoto tone={d.tone} label=""/>
                <div className="dest-info">
                  <h3>{d.name}</h3>
                  <span>{d.sub}</span>
                </div>
              </a>
            ))}
          </div>
        </div>
      </section>

      {/* HOW IT WORKS — short */}
      <section className="section">
        <div className="container">
          <div className="section-inverse" style={{padding: '80px 64px'}}>
            <div style={{display:'grid', gridTemplateColumns:'1fr 1fr', gap: 64, alignItems:'center'}}>
              <div>
                <span className="eyebrow" style={{color: 'var(--sole-300)'}}>Cómo funciona</span>
                <h2 style={{marginTop: 12, color: 'var(--crema-50)', fontSize: 'clamp(36px, 4.5vw, 60px)', fontFamily:'var(--font-display)', fontWeight: 400, lineHeight: 1.05}}>
                  Tres pasos y estás <em style={{fontStyle:'italic', color: 'var(--sole-400)'}}>en marcha.</em>
                </h2>
                <p className="text-2" style={{marginTop: 16, fontSize:'var(--fs-md)'}}>Sin pasos ocultos, sin extras al pagar, sin sorpresas al regreso.</p>
                <a href="#/come-funziona" className="btn btn--inverse mt-6">Descubre más</a>
              </div>
              <div style={{display:'flex', flexDirection:'column', gap: 24}}>
                {[
                  {n:'01', t:'Buscas y reservas', d:'Eliges ciudad, fechas y vehículo. Confirmas en 2 minutos.'},
                  {n:'02', t:'Recoges el vehículo', d:'Limpio, revisado, listo. 30 minutos de entrega guiada.'},
                  {n:'03', t:'Sales y vuelves', d:'Devuelves donde y cuando quieras. Ninguna sorpresa.'},
                ].map(s => (
                  <div key={s.n} style={{display:'flex', gap: 24, paddingBottom: 24, borderBottom: '1px solid rgba(255,255,255,0.1)'}}>
                    <span style={{fontFamily:'var(--font-display)', fontSize: 44, color: 'var(--sole-400)', lineHeight: 1}}>{s.n}</span>
                    <div>
                      <h4 style={{color:'var(--crema-50)'}}>{s.t}</h4>
                      <p className="text-2" style={{marginTop: 4}}>{s.d}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* TESTIMONIAL */}
      <section className="section">
        <div className="container">
          <div className="grid-2" style={{alignItems: 'stretch'}}>
            <div className="testimonial">
              <blockquote>"Me daba miedo el primer viaje en autocaravana. Me lo explicaron todo, con calma, sin prisa. Por la noche estábamos en Trentino frente a una hoguera."</blockquote>
              <div className="testimonial-author">
                <div className="avatar">MR</div>
                <div>
                  <div style={{fontWeight: 600}}>Marta R.</div>
                  <div className="text-meta">Familia, Verona → Dolomitas</div>
                </div>
              </div>
            </div>
            <div className="testimonial" style={{background:'var(--bosco-100)'}}>
              <blockquote>"La GS lista con depósito lleno, maletas montadas, ruta sugerida. Partí en media hora. Cuatro días en Cerdeña sin una preocupación."</blockquote>
              <div className="testimonial-author">
                <div className="avatar" style={{background:'var(--terra-300)', color:'var(--terra-900)'}}>LB</div>
                <div>
                  <div style={{fontWeight: 600}}>Luca B.</div>
                  <div className="text-meta">Motosrista, Milán → Costa Esmeralda</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* STORIES */}
      <section className="section">
        <div className="container">
          <div className="section-head">
            <div>
              <span className="eyebrow">Historias de viaje</span>
              <h2 style={{marginTop: 12}}>Lecturas para quienes sueñan despiertos.</h2>
            </div>
            <a href="#/storie" className="text-link">Todas las historias <Icon name="arrow-right" className="icon-sm"/></a>
          </div>
          <div className="grid-3">
            {STORIES.map(s => (
              <a key={s.id} href={`#/storia/${s.id}`} className="card card--lifted" style={{padding: 0, display:'flex', flexDirection:'column', textDecoration:'none'}}>
                <VehPhoto tone={s.tone} className="" label=""/>
                <div style={{padding: 24}}>
                  <span className="text-meta">{s.meta}</span>
                  <h4 style={{marginTop: 8, fontSize:'var(--fs-lg)', fontWeight: 600}}>{s.title}</h4>
                </div>
              </a>
            ))}
          </div>
        </div>
      </section>

      {/* FINAL CTA */}
      <section className="section">
        <div className="container">
          <div style={{
            borderRadius: 'var(--radius-2xl)',
            background: 'linear-gradient(135deg, var(--bosco-700), var(--bosco-900))',
            padding: '80px 64px',
            textAlign: 'center',
            color: 'var(--crema-50)',
            position:'relative',
            overflow:'hidden',
          }}>
            <div style={{position:'absolute', top: -40, right: -40, width: 200, height: 200, background: 'var(--sole-500)', borderRadius:'50%', opacity: 0.15}}/>
            <span className="eyebrow" style={{color:'var(--sole-300)'}}>¿Listo?</span>
            <h2 style={{fontFamily:'var(--font-display)', fontWeight: 400, fontSize:'clamp(40px, 5.5vw, 80px)', color:'var(--crema-50)', lineHeight: 1.05, marginTop: 16, position:'relative'}}>
              Encuentra tu vehículo. <em style={{fontStyle:'italic', color:'var(--sole-400)'}}>Parte cuando quieras.</em>
            </h2>
            <a href="#/cerca" className="btn btn--accent btn--lg" style={{marginTop: 32}}>
              <Icon name="search"/>Buscar disponibilidad
            </a>
          </div>
        </div>
      </section>
    </main>
  );
};

// =================================================================
// SEARCH / RESULTS
// =================================================================
const SearchPage = ({ params }) => {
  const { FLEET, CITIES } = window.OTTI_DATA;
  const initialCat = params.get('cat') || 'tutti';
  const initialWhere = params.get('where') || '';
  const [cat, setCat] = useS(initialCat);
  const [where, setWhere] = useS(initialWhere);
  const [from, setFrom] = useS(params.get('from') || '');
  const [to, setTo] = useS(params.get('to') || '');
  const [priceMax, setPriceMax] = useS(250);
  const [petOnly, setPetOnly] = useS(false);
  const [premiumOnly, setPremiumOnly] = useS(false);
  const [sort, setSort] = useS('relevance');

  const results = useM(() => {
    let r = [...FLEET];
    if (cat !== 'tutti') r = r.filter(v => v.cat === cat);
    if (where) r = r.filter(v => v.location === where);
    r = r.filter(v => v.pricePerDay <= priceMax);
    if (petOnly) r = r.filter(v => v.pet);
    if (premiumOnly) r = r.filter(v => v.premium);
    if (sort === 'price-asc') r.sort((a,b) => a.pricePerDay - b.pricePerDay);
    if (sort === 'price-desc') r.sort((a,b) => b.pricePerDay - a.pricePerDay);
    if (sort === 'rating') r.sort((a,b) => b.rating - a.rating);
    return r;
  }, [cat, where, priceMax, petOnly, premiumOnly, sort]);

  return (
    <main className="page-enter">
      <PageHero crumbs={[{label:'Buscar vehículos'}]} title="Encuentra tu vehículo">
        <div style={{marginTop: 32}}>
          <SearchBar initial={{where, from, to, cat}}/>
        </div>
      </PageHero>

      <section className="section-sm">
        <div className="container" style={{display:'grid', gridTemplateColumns:'280px 1fr', gap: 48}}>
          {/* SIDEBAR */}
          <aside style={{position:'sticky', top: 96, alignSelf:'start'}}>
            <h3 style={{fontSize:'var(--fs-md)', fontWeight: 600, marginBottom: 16}}>Filtrar</h3>
            <div className="filter-block">
              <h5>Categoría</h5>
              <div className="flex-col" style={{gap: 4}}>
                {['tutti','camper','roulotte','moto'].map(c => (
                  <label key={c} className="checkbox">
                    <input type="radio" name="cat" checked={cat === c} onChange={() => setCat(c)}/>
                    <span>{c[0].toUpperCase()+c.slice(1)}</span>
                  </label>
                ))}
              </div>
            </div>
            <div className="filter-block">
              <h5>Ciudad</h5>
              <select className="select" value={where} onChange={e => setWhere(e.target.value)}>
                <option value="">Todas las ciudades</option>
                {CITIES.map(c => <option key={c} value={c}>{c}</option>)}
              </select>
            </div>
            <div className="filter-block">
              <h5>Prezzo massimo / día</h5>
              <input type="range" min={50} max={300} step={10} value={priceMax} onChange={e => setPriceMax(+e.target.value)} style={{width:'100%', accentColor:'var(--bosco-700)'}}/>
              <div className="flex justify-between text-meta" style={{marginTop: 4}}>
                <span>50 €</span><span style={{fontWeight: 600, color: 'var(--fg-1)'}}>hasta {priceMax} €</span><span>300 €</span>
              </div>
            </div>
            <div className="filter-block">
              <h5>Características</h5>
              <label className="checkbox"><input type="checkbox" checked={petOnly} onChange={e => setPetOnly(e.target.checked)}/><span>Admite mascotas</span></label>
              <label className="checkbox"><input type="checkbox" checked={premiumOnly} onChange={e => setPremiumOnly(e.target.checked)}/><span>Solo premium</span></label>
            </div>
          </aside>

          {/* RESULTS */}
          <div>
            <div className="flex justify-between items-center" style={{marginBottom: 24, flexWrap:'wrap', gap: 16}}>
              <span className="text-meta">{results.length} vehículos disponibles{where ? ` a ${where}` : ''}</span>
              <div className="flex items-center gap-3">
                <span className="text-meta">Ordenar:</span>
                <select className="select" style={{width: 'auto'}} value={sort} onChange={e => setSort(e.target.value)}>
                  <option value="relevance">Más relevantes</option>
                  <option value="price-asc">Precio ascendente</option>
                  <option value="price-desc">Precio descendente</option>
                  <option value="rating">Migliori reseñas</option>
                </select>
              </div>
            </div>
            {results.length === 0 ? (
              <div className="card" style={{textAlign:'center', padding: 64}}>
                <Icon name="info" className="icon-lg" stroke={1.5}/>
                <h3 style={{marginTop: 16, fontSize:'var(--fs-lg)'}}>Ningún vehículo libre con estos filtros</h3>
                <p className="text-meta" style={{marginTop: 8}}>Prueba a ampliar el precio o quitar un filtro.</p>
              </div>
            ) : (
              <div className="grid-3" style={{gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))'}}>
                {results.map(v => <VehicleCard key={v.id} v={v}/>)}
              </div>
            )}
          </div>
        </div>
      </section>
    </main>
  );
};

// =================================================================
// VEHICLE DETAIL
// =================================================================
const VehiclePage = ({ id }) => {
  const v = window.OTTI_DATA.FLEET.find(x => x.id === id);
  if (!v) return <main className="container section"><h2>Vehículo no encontrado.</h2><a href="#/cerca" className="text-link mt-6">Volver a los resultados</a></main>;

  return (
    <main className="page-enter">
      <PageHero crumbs={[{label:'Buscar vehículos', href:'#/cerca'}, {label: v.name}]} title={v.name}
        sub={null}>
        <div className="flex items-center gap-4 mt-4" style={{flexWrap: 'wrap'}}>
          <span className="badge"><Icon name={CAT_ICON[v.cat]} className="icon-sm"/>{v.type}</span>
          {v.premium && <span className="badge badge--sole">Premium</span>}
          {v.pet && <span className="badge badge--cielo">Admite mascotas</span>}
          <span style={{display:'inline-flex', alignItems:'center', gap: 6}}><Icon name="star" className="icon-sm" stroke={2}/><strong>{v.rating}</strong> <span className="text-meta">({v.reviews} reseñas)</span></span>
          <span style={{display:'inline-flex', alignItems:'center', gap: 6}} className="text-meta"><Icon name="map-pin" className="icon-sm"/>{v.location}</span>
        </div>
      </PageHero>

      <section className="section-sm">
        <div className="container">
          <div className="gallery">
            <VehPhoto tone={v.tone} label="" className="gh-main"/>
            <VehPhoto tone="bosco" label="Interior" className="gh"/>
            <VehPhoto tone="cielo" label="Exterior" className="gh"/>
            <VehPhoto tone="" label="Cocina" className="gh"/>
            <VehPhoto tone="terra" label="Baño" className="gh"/>
          </div>
        </div>
      </section>

      <section className="section-sm">
        <div className="container" style={{display:'grid', gridTemplateColumns:'1fr 380px', gap: 64, alignItems:'start'}}>
          <div>
            <h2 style={{fontSize:'var(--fs-2xl)', fontWeight: 600}}>Resumen</h2>
            <p className="lead mt-4">{v.summary}</p>

            <hr className="divider" style={{margin: '40px 0'}}/>

            <h2 style={{fontSize:'var(--fs-2xl)', fontWeight: 600}}>Características tecniche</h2>
            <dl className="kv mt-6" style={{maxWidth: 540}}>
              <dt>Categoría</dt><dd>{v.type}</dd>
              <dt>Año</dt><dd>{v.year}</dd>
              {v.length && <><dt>Longitud</dt><dd>{v.length.toFixed(2).replace('.', ',')} m</dd></>}
              <dt>Plazas de viaje</dt><dd>{v.seats}</dd>
              {v.sleeps && <><dt>Plazas noche</dt><dd>{v.sleeps}</dd></>}
              <dt>Cambio</dt><dd>{v.transmission}</dd>
              <dt>Carné</dt><dd>{v.license}</dd>
              <dt>Fianza</dt><dd>€{v.deposit.toLocaleString('it-IT')}</dd>
            </dl>

            <hr className="divider" style={{margin: '40px 0'}}/>

            <h2 style={{fontSize:'var(--fs-2xl)', fontWeight: 600}}>Qué está incluido</h2>
            <div className="grid-2 mt-6" style={{gap: 12}}>
              {v.features.map(f => (
                <div key={f} className="flex items-center gap-3">
                  <Icon name="check" className="icon-sm" stroke={2}/>
                  <span style={{fontSize:'var(--fs-sm)'}}>{f}</span>
                </div>
              ))}
            </div>

            <hr className="divider" style={{margin: '40px 0'}}/>

            <h2 style={{fontSize:'var(--fs-2xl)', fontWeight: 600}}>Coberturas</h2>
            <div className="card mt-6" style={{borderLeft: '3px solid var(--sole-500)'}}>
              <h4 style={{display:'flex', alignItems:'center', gap: 10}}><Icon name="shield" className="icon-sm"/>Seguro incluido</h4>
              <p className="mt-2 text-2" style={{fontSize:'var(--fs-sm)'}}>Coperto hasta 5.000 €, senza franchigia. Furto, incendio, kasco e RC sempre attivi.</p>
            </div>
          </div>

          {/* BOOKING SIDE CARD */}
          <aside className="sticky-side">
            <div className="card card--lifted card--feature">
              <div style={{display:'flex', alignItems:'baseline', gap: 8}}>
                <span style={{fontFamily:'var(--font-display)', fontSize: 'var(--fs-3xl)', lineHeight: 1}}>€{v.pricePerDay}</span>
                <span className="text-meta">/ día</span>
              </div>
              <p className="text-meta mt-2">Total estimado para 7 días: <strong style={{color:'var(--fg-1)'}}>€{(v.pricePerDay * 7).toLocaleString('it-IT')}</strong></p>

              <div className="flex-col gap-3" style={{marginTop: 24}}>
                <div className="field">
                  <span className="field-label">Recogida</span>
                  <input className="input" type="date"/>
                </div>
                <div className="field">
                  <span className="field-label">Devolución</span>
                  <input className="input" type="date"/>
                </div>
                <div className="field">
                  <span className="field-label">Personas</span>
                  <select className="select" defaultValue="2">
                    {[1,2,3,4,5,6].slice(0, v.seats).map(n => <option key={n} value={n}>{n} {n === 1 ? 'persona' : 'persone'}</option>)}
                  </select>
                </div>
              </div>

              <a href={`#/prenota/${v.id}`} className="btn btn--primary btn--block btn--lg" style={{marginTop: 24}}>
                Reservar subito
              </a>
              <p className="text-meta text-center mt-3" style={{fontSize: 'var(--fs-xs)'}}>Cancellazione gratuita hasta 7 giorni prima</p>

              <hr className="divider" style={{margin: '20px 0'}}/>
              <div className="flex items-center gap-3 text-meta" style={{fontSize:'var(--fs-sm)'}}>
                <Icon name="info" className="icon-sm"/>
                <span>Fianza di €{v.deposit.toLocaleString('it-IT')} liberada al regreso</span>
              </div>
            </div>
          </aside>
        </div>
      </section>

      {/* SIMILAR */}
      <section className="section">
        <div className="container">
          <div className="section-head"><div><h2>Vehículos similares</h2></div></div>
          <div className="grid-4">
            {window.OTTI_DATA.FLEET.filter(x => x.cat === v.cat && x.id !== v.id).slice(0, 4).map(x => <VehicleCard key={x.id} v={x}/>)}
          </div>
        </div>
      </section>
    </main>
  );
};

Object.assign(window, { HomePage, SearchPage, VehiclePage });
