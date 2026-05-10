// app.jsx — main router + mount
const { useState: uSa, useEffect: uEa } = React;

const useHashRoute = () => {
  const [route, setRoute] = uSa(location.hash.replace(/^#/, '') || '/');
  uEa(() => {
    const h = () => { setRoute(location.hash.replace(/^#/, '') || '/'); window.scrollTo(0,0); };
    window.addEventListener('hashchange', h);
    return () => window.removeEventListener('hashchange', h);
  }, []);
  return route;
};

const App = () => {
  const route = useHashRoute();
  const [path, query] = route.split('?');
  const params = new URLSearchParams(query || '');

  let page;
  if (path === '/' || path === '') page = <HomePage/>;
  else if (path === '/cerca') page = <SearchPage params={params}/>;
  else if (path.startsWith('/veicolo/')) page = <VehiclePage id={path.slice('/veicolo/'.length)}/>;
  else if (path.startsWith('/prenota/')) page = <BookingPage id={path.slice('/prenota/'.length)}/>;
  else if (path === '/come-funziona') page = <HowItWorksPage/>;
  else if (path === '/chi-siamo') page = <AboutPage/>;
  else if (path === '/contatti') page = <ContactPage/>;
  else if (path === '/storie' || path === '/destinazioni' || path.startsWith('/storia/') || path.startsWith('/destinazione/')) page = <HistoriassPage/>;
  else if (path === '/faq') page = <HowItWorksPage/>;
  else page = <NotFoundPage/>;

  return (
    <>
      <Nav route={path}/>
      {page}
      <Footer/>
    </>
  );
};

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(<App/>);
