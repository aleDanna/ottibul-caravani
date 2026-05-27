# Copy Retrofit — Draft for Owner Review

**Status:** Draft awaiting Spanish review. Once approved, copy is applied to `src/messages/{es,ca,en}.json`.

## Conventions

- `metaTitle`: ≤60 characters total, contains primary keyword, ends with `· Otti Bull`.
- `metaDescription`: 150–160 characters, contains secondary keyword + clear CTA verb.
- `H1` / hero copy: natural-language phrasing for humans; SEO comes second.
- Keyword density: aim for 1 primary keyword occurrence in title/H1/intro, NOT keyword stuffing.
- Catalan and English translations adapt meaning, not word-for-word.

## Home `/[locale]`

### ES
| Field | Current (`messages/es.json`) | Proposed |
|---|---|---|
| `home.metaTitle` | Otti Bull · Alquiler de Autocaravanas en Barcelona | Alquiler de autocaravanas en Barcelona · Otti Bull |
| `home.metaDescription` | Alquila autocaravanas y motos premium en Barcelona. Reserva fácil, atención personalizada. | Alquiler de autocaravanas premium en Barcelona. Vehículos equipados, seguro a todo riesgo y atención personalizada. Reserva online. |
| `home.heroEyebrow` | Libertad sobre Ruedas | Libertad sobre ruedas |
| `home.heroTitle` | Tu próxima aventura empieza aquí | Tu próxima aventura empieza aquí |
| `home.heroSubtitle` | Alquiler de autocaravanas premium en Barcelona | Alquiler de autocaravanas premium en Barcelona y Cataluña |
| `home.whyTitle` | Lo que nos hace diferentes | Lo que nos hace diferentes |
| `home.whySubtitle` | Por qué cientos de viajeros confían en Otti Bull para sus aventuras | Por qué cientos de viajeros eligen Otti Bull para alquilar su autocaravana en Barcelona |

### CA (translate from approved ES)
| Field | Proposed |
|---|---|
| `home.metaTitle` | Lloguer d'autocaravanes a Barcelona · Otti Bull |
| `home.metaDescription` | Lloguer d'autocaravanes premium a Barcelona. Vehicles equipats, assegurança a tot risc i atenció personalitzada. Reserva en línia. |
| `home.heroSubtitle` | Lloguer d'autocaravanes premium a Barcelona i Catalunya |
| `home.whySubtitle` | Per què centenars de viatgers escullen Otti Bull per llogar la seva autocaravana a Barcelona |

### EN
| Field | Proposed |
|---|---|
| `home.metaTitle` | Camper rentals in Barcelona · Otti Bull |
| `home.metaDescription` | Premium camper rentals in Barcelona. Fully equipped vehicles, comprehensive insurance and personalized service. Book online. |
| `home.heroSubtitle` | Premium camper rentals in Barcelona and Catalonia |
| `home.whySubtitle` | Why hundreds of travellers choose Otti Bull to rent their camper in Barcelona |

## Catalog `/[locale]/catalog`

### ES
| Field | Current | Proposed |
|---|---|---|
| `catalog.metaTitle` | Catálogo de Vehículos \| Otti Bull | Flota de autocaravanas en Barcelona · Otti Bull |
| `catalog.metaDescription` | Explora nuestra flota de autocaravanas, motos y más en alquiler en Barcelona. | Explora la flota completa de autocaravanas en alquiler en Barcelona y Cataluña: camper, motos y vehículos equipados para tu viaje. |
| `catalog.title` | Nuestra flota | Flota de autocaravanas en alquiler |

### CA
| Field | Proposed |
|---|---|
| `catalog.metaTitle` | Flota d'autocaravanes a Barcelona · Otti Bull |
| `catalog.metaDescription` | Explora la flota completa d'autocaravanes en lloguer a Barcelona i Catalunya: camper, motos i vehicles equipats per al teu viatge. |
| `catalog.title` | Flota d'autocaravanes en lloguer |

### EN
| Field | Proposed |
|---|---|
| `catalog.metaTitle` | Camper fleet in Barcelona · Otti Bull |
| `catalog.metaDescription` | Explore our full camper fleet for rent in Barcelona and Catalonia: campervans, motorcycles and fully equipped vehicles for your trip. |
| `catalog.title` | Our camper fleet for rent |

## About `/[locale]/about`

### ES
| Field | Current | Proposed |
|---|---|---|
| `about.metaTitle` | Nosotros \| Otti Bull | Otti Bull SL · Alquiler de autocaravanas en Barcelona |
| `about.metaDescription` | Otti Bull SL — expertos en alquiler de autocaravanas en Barcelona. | Otti Bull SL: empresa especializada en alquiler de autocaravanas premium en Barcelona. Vehículos propios, atención personalizada y servicio local. |
| `about.heroTitle` | Expertos en Caravaning desde Barcelona | Expertos en alquiler de autocaravanas en Barcelona |

### CA
| Field | Proposed |
|---|---|
| `about.metaTitle` | Otti Bull SL · Lloguer d'autocaravanes a Barcelona |
| `about.metaDescription` | Otti Bull SL: empresa especialitzada en lloguer d'autocaravanes premium a Barcelona. Vehicles propis, atenció personalitzada i servei local. |
| `about.heroTitle` | Experts en lloguer d'autocaravanes a Barcelona |

### EN
| Field | Proposed |
|---|---|
| `about.metaTitle` | Otti Bull SL · Camper rentals in Barcelona |
| `about.metaDescription` | Otti Bull SL: specialists in premium camper rentals in Barcelona. Owned fleet, personalized service and local know-how. |
| `about.heroTitle` | Camper rental experts in Barcelona |

## FAQ `/[locale]/faq`

### ES
| Field | Current | Proposed |
|---|---|---|
| `faq.metaTitle` | Preguntas Frecuentes \| Otti Bull | Preguntas frecuentes sobre alquiler de autocaravanas · Otti Bull |
| `faq.metaDescription` | Respuestas a las dudas más comunes sobre el alquiler de autocaravanas en Otti Bull. | Respuestas a las preguntas más frecuentes sobre alquiler de autocaravanas en Barcelona: precios, seguros, documentación y entrega. |
| `faq.title` | Preguntas Frecuentes | Preguntas frecuentes |
| `faq.subtitle` | Encuentra respuestas a las dudas más comunes sobre nuestro servicio de alquiler | Todo lo que necesitas saber antes de alquilar una autocaravana en Barcelona |

### CA
| Field | Proposed |
|---|---|
| `faq.metaTitle` | Preguntes freqüents sobre lloguer d'autocaravanes · Otti Bull |
| `faq.metaDescription` | Respostes a les preguntes més freqüents sobre el lloguer d'autocaravanes a Barcelona: preus, assegurances, documentació i lliurament. |
| `faq.subtitle` | Tot el que has de saber abans de llogar una autocaravana a Barcelona |

### EN
| Field | Proposed |
|---|---|
| `faq.metaTitle` | FAQ — Camper rentals · Otti Bull |
| `faq.metaDescription` | Answers to the most common questions about camper rentals in Barcelona: pricing, insurance, documents and delivery. |
| `faq.subtitle` | Everything you need to know before renting a camper in Barcelona |

## Owner review checklist

- [ ] All ES `metaTitle` ≤60 characters (visual scan)
- [ ] All ES `metaDescription` 150–160 characters
- [ ] ES copy reads naturally as a Spanish native speaker
- [ ] CA translations are accurate (Catalan native check)
- [ ] EN translations are accurate (native English check)
- [ ] No keyword that feels unnatural / "stuffed"
- [ ] Approve → notify implementer to apply changes to `messages/*.json`
