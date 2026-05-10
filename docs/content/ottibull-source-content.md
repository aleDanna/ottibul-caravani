# Source content from ottibull.com

Scraped 2026-05-10 via Chrome MCP. The original site only ships Spanish copy. The
implementer must produce Catalan (ca) and English (en) translations matching the
same key structure when seeding the DB or writing MDX.

The content below is the source of truth for the **About**, **Useful Links** and
**FAQ** pages of the new Otti Bull rental platform. Use it verbatim for the `es`
locale and translate naturally for `ca` and `en` (preserving brand names, product
names, and links).

---

## About Us — `/[locale]/about`

### es (verbatim from ottibull.com)

> **Otti Bull SL — Expertos en Caravaning desde Barcelona**
>
> En Otti Bull Caravaning, somos apasionados por la libertad de viajar y descubrir
> nuevos horizontes. Desde nuestra base en Barcelona, ofrecemos un servicio de
> alquiler de autocaravanas premium diseñado para hacer de tu aventura una
> experiencia inolvidable.
>
> Nuestro compromiso es proporcionarte vehículos en perfecto estado, totalmente
> equipados y con el mejor servicio de atención al cliente. Cada autocaravana de
> nuestra flota es cuidadosamente mantenida y preparada para garantizar tu
> seguridad y comodidad en cada kilómetro.
>
> Ya sea que planees una escapada de fin de semana por la costa catalana, una
> ruta por los Pirineos o un viaje largo por toda Europa, en Otti Bull encontrarás
> el vehículo perfecto y el apoyo que necesitas para vivir tu aventura con total
> tranquilidad. 🚐

### Stats block

| value | label |
|---|---|
| 5+ | Años de experiencia |
| 2 | Vehículos premium |
| 500+ | Clientes satisfechos |

### "Why us" bullets (sourced from ottibull.com footer "¿Por qué elegirnos?")

- Vehículos nuevos y bien mantenidos
- Precios competitivos sin sorpresas
- Atención personalizada
- Flexibilidad en recogida y entrega

### Translation guidance

- ca: keep proper nouns ("Otti Bull SL", "Barcelona", "Pirineos"). Catalan
  equivalents: "Pirineus" (instead of "Pirineos"), "carretera" stays.
- en: idiomatic — "Premium camper rental in Barcelona", "Whether you're planning
  a weekend escape along the Catalan coast, a Pyrenees route, or a long European
  trip…".

---

## Useful Links — `/[locale]/useful-links`

### Page title (es): "Enlaces de Interés"
### Page subtitle (es): "Recursos y webs de referencia para planificar mejor tu aventura en autocaravana"

### Links list

1. **Turismo de España**
   - URL: https://www.spain.info/
   - es description: "Página web que ofrece información turística detallada sobre
     diferentes regiones, ciudades y pueblos de España. Proporciona guías de
     viaje, recomendaciones de alojamiento, gastronomía y actividades, así como
     noticias y artículos de interés sobre la cultura y la historia de España."

2. **Park4Night**
   - URL: https://park4night.com/
   - es description: "Aplicación móvil y plataforma web que proporciona
     información detallada sobre lugares para acampar, estacionar y pasar la
     noche en caravana o autocaravana en diferentes países de todo el mundo."

3. **Campings Online**
   - URL: https://www.campingsonline.com/
   - es description: "Plataforma online que ofrece información sobre campings en
     diferentes países, incluyendo España, Francia, Portugal, Italia y Alemania.
     Permite buscar campings por ubicación, servicios y actividades, y reservar
     alojamiento en línea."

The URLs above are best-effort reconstructions from the brand names; the original
site only displayed names without anchors. Verify before launch and replace with
exact URLs from the client if different.

---

## FAQ — `/[locale]/faq`

### Page title (es): "Preguntas Frecuentes"
### Page subtitle (es): "Encuentra respuestas a las dudas más comunes sobre nuestro servicio de alquiler"

### 9 entries (sort_order matches list order, all `published`)

#### 1. ¿Qué requisitos necesito para alquilar una camper?

Necesitas tener al menos 25 años, carnet de conducir B con más de 2 años de
antigüedad y una tarjeta de crédito a tu nombre para la fianza. También te
pediremos un documento de identidad válido ó pasaporte.

#### 2. ¿Cuánto es el depósito de garantía?

El depósito de garantía es de 900€ y se realiza mediante pre-autorización en
tarjeta de crédito. Se libera automáticamente al devolver el vehículo en las
mismas condiciones en que se entregó.

#### 3. ¿Qué incluye el alquiler?

El alquiler incluye seguro a todo riesgo con franquicia, asistencia en carretera
24/7, equipamiento completo con nuestro servicio "Todo Incluido", y kilometraje
ilimitado dentro de España.

#### 4. ¿Puedo viajar fuera de España?

Sí, puedes viajar a Portugal, Francia y Andorra sin coste adicional. Para otros
países europeos, consulta con nosotros las condiciones y posibles suplementos del
seguro.

#### 5. ¿Cuál es la política de cancelación?

Cancelación gratuita hasta 30 días antes del inicio del alquiler. Entre 30 y 15
días: 50% del importe. Menos de 15 días: no reembolsable. Te recomendamos
contratar un seguro de cancelación.

#### 6. ¿Puedo llevar mascotas?

Por el momento, no está permitido viajar con mascotas en nuestras autocaravanas.
Queremos garantizar que todos los vehículos se mantengan en las mejores
condiciones de higiene y confort para todos los clientes, especialmente para
aquellas personas que puedan tener alergias o sensibilidades. Agradecemos mucho
tu comprensión y estaremos encantados de ayudarte a planificar un viaje perfecto.

#### 7. ¿Qué pasa si tengo una avería durante el viaje?

Todas nuestras campers incluyen asistencia en carretera 24/7. En caso de avería,
llama al número de emergencia que te proporcionamos y gestionaremos la reparación
o vehículo de sustitución sin coste adicional.

#### 8. ¿Necesito experiencia previa conduciendo campers?

No es necesario. Antes de la entrega, te damos una explicación completa del
funcionamiento del vehículo, equipamiento y consejos de conducción. Nuestras
campers son fáciles de manejar y del tamaño de una furgoneta.

#### 9. ¿Hay que dejar limpia la autocaravana al entregarla?

El vehículo deberá ser devuelto en buenas condiciones higiénicas con su interior
limpio y con el WC y los depósitos de aguas residuales debidamente vaciados. En
caso contrario, el usuario acepta el pago de la cantidad fija de 60€.

### Translation guidance

The FAQs include very specific monetary amounts (900€, 60€), durations
(24/7, 30/15 days), and document references (carnet B, pasaporte). Preserve all
of these in translations. Tone: warm-but-professional, mirroring the Spanish.

---

## Contact info (footer / contact card)

```
Direction:  C/ L'Alfambra, 14, P.4 Pta.2, 08034 Barcelona, España
Phone:      +34 691 82 02 42
Email:      info@ottibull.com
Hours:      Lun–Vie: 9:00–19:00 · Sáb: 10:00–14:00 · Dom: cerrado
Geo:        41.4036299, 2.1633835
```

This contact info is only used in the footer / Contact section of the home page.
There is **no separate Contact page** in the new site (the inquiry form on each
vehicle page is the conversion path).
