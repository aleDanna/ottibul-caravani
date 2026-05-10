import { db } from "../src/db/client";
import { faqs, faqTranslations } from "../src/db/schema";
import { eq } from "drizzle-orm";

type Trio = {
  es: { q: string; a: string };
  ca: { q: string; a: string };
  en: { q: string; a: string };
};

// Source: docs/content/ottibull-source-content.md
const ENTRIES: Trio[] = [
  // 1. Requisitos
  {
    es: {
      q: "¿Qué requisitos necesito para alquilar una camper?",
      a: "Necesitas tener al menos 25 años, carnet de conducir B con más de 2 años de antigüedad y una tarjeta de crédito a tu nombre para la fianza. También te pediremos un documento de identidad válido o pasaporte.",
    },
    ca: {
      q: "Quins requisits necessito per llogar una camper?",
      a: "Has de tenir com a mínim 25 anys, carnet de conduir B amb més de 2 anys d'antiguitat i una targeta de crèdit al teu nom per a la fiança. També et demanarem un document d'identitat vàlid o passaport.",
    },
    en: {
      q: "What requirements do I need to rent a camper?",
      a: "You need to be at least 25 years old, hold a B-class driving licence for more than 2 years, and have a credit card in your name for the deposit. We will also ask for a valid ID or passport.",
    },
  },
  // 2. Depósito
  {
    es: {
      q: "¿Cuánto es el depósito de garantía?",
      a: "El depósito de garantía es de 900€ y se realiza mediante pre-autorización en tarjeta de crédito. Se libera automáticamente al devolver el vehículo en las mismas condiciones en que se entregó.",
    },
    ca: {
      q: "Quant és el dipòsit de garantia?",
      a: "El dipòsit de garantia és de 900€ i es realitza mitjançant pre-autorització en targeta de crèdit. S'allibera automàticament en retornar el vehicle en les mateixes condicions en què es va lliurar.",
    },
    en: {
      q: "How much is the security deposit?",
      a: "The security deposit is 900€ and is handled via credit card pre-authorization. It is released automatically when the vehicle is returned in the same condition in which it was delivered.",
    },
  },
  // 3. Qué incluye
  {
    es: {
      q: "¿Qué incluye el alquiler?",
      a: 'El alquiler incluye seguro a todo riesgo con franquicia, asistencia en carretera 24/7, equipamiento completo con nuestro servicio "Todo Incluido", y kilometraje ilimitado dentro de España.',
    },
    ca: {
      q: "Què inclou el lloguer?",
      a: 'El lloguer inclou assegurança a tot risc amb franquícia, assistència en carretera 24/7, equipament complet amb el nostre servei "Tot Inclòs" i quilometratge il·limitat dins d\'Espanya.',
    },
    en: {
      q: "What does the rental include?",
      a: 'The rental includes comprehensive insurance with excess, 24/7 roadside assistance, full equipment under our "All Inclusive" service, and unlimited mileage within Spain.',
    },
  },
  // 4. Fuera de España
  {
    es: {
      q: "¿Puedo viajar fuera de España?",
      a: "Sí, puedes viajar a Portugal, Francia y Andorra sin coste adicional. Para otros países europeos, consulta con nosotros las condiciones y posibles suplementos del seguro.",
    },
    ca: {
      q: "Puc viatjar fora d'Espanya?",
      a: "Sí, pots viatjar a Portugal, França i Andorra sense cost addicional. Per a altres països europeus, consulta'ns les condicions i possibles suplements de l'assegurança.",
    },
    en: {
      q: "Can I travel outside Spain?",
      a: "Yes, you can travel to Portugal, France and Andorra at no extra cost. For other European countries, please contact us about conditions and possible insurance supplements.",
    },
  },
  // 5. Cancelación
  {
    es: {
      q: "¿Cuál es la política de cancelación?",
      a: "Cancelación gratuita hasta 30 días antes del inicio del alquiler. Entre 30 y 15 días: 50% del importe. Menos de 15 días: no reembolsable. Te recomendamos contratar un seguro de cancelación.",
    },
    ca: {
      q: "Quina és la política de cancel·lació?",
      a: "Cancel·lació gratuïta fins a 30 dies abans de l'inici del lloguer. Entre 30 i 15 dies: 50% de l'import. Menys de 15 dies: no reemborsable. Et recomanem contractar una assegurança de cancel·lació.",
    },
    en: {
      q: "What is the cancellation policy?",
      a: "Free cancellation up to 30 days before the rental starts. Between 30 and 15 days: 50% of the amount. Less than 15 days: non-refundable. We recommend taking out cancellation insurance.",
    },
  },
  // 6. Mascotas
  {
    es: {
      q: "¿Puedo llevar mascotas?",
      a: "Por el momento, no está permitido viajar con mascotas en nuestras autocaravanas. Queremos garantizar que todos los vehículos se mantengan en las mejores condiciones de higiene y confort para todos los clientes, especialmente para aquellas personas que puedan tener alergias o sensibilidades. Agradecemos mucho tu comprensión y estaremos encantados de ayudarte a planificar un viaje perfecto.",
    },
    ca: {
      q: "Puc portar mascotes?",
      a: "De moment, no està permès viatjar amb mascotes a les nostres autocaravanes. Volem garantir que tots els vehicles es mantinguin en les millors condicions d'higiene i confort per a tots els clients, especialment per a aquelles persones que puguin tenir al·lèrgies o sensibilitats. T'agraïm molt la comprensió i estarem encantats d'ajudar-te a planificar un viatge perfecte.",
    },
    en: {
      q: "Can I bring pets?",
      a: "At this time, pets are not allowed in our campers. We want to ensure that all vehicles stay in the best hygiene and comfort conditions for every customer, especially those who may have allergies or sensitivities. We very much appreciate your understanding and will be glad to help you plan a perfect trip.",
    },
  },
  // 7. Avería
  {
    es: {
      q: "¿Qué pasa si tengo una avería durante el viaje?",
      a: "Todas nuestras campers incluyen asistencia en carretera 24/7. En caso de avería, llama al número de emergencia que te proporcionamos y gestionaremos la reparación o vehículo de sustitución sin coste adicional.",
    },
    ca: {
      q: "Què passa si tinc una avaria durant el viatge?",
      a: "Totes les nostres campers inclouen assistència en carretera 24/7. En cas d'avaria, truca al número d'emergència que t'hem facilitat i gestionarem la reparació o un vehicle de substitució sense cost addicional.",
    },
    en: {
      q: "What if I have a breakdown during the trip?",
      a: "All our campers include 24/7 roadside assistance. In case of breakdown, call the emergency number we provide and we will handle the repair or a replacement vehicle at no additional cost.",
    },
  },
  // 8. Experiencia previa
  {
    es: {
      q: "¿Necesito experiencia previa conduciendo campers?",
      a: "No es necesario. Antes de la entrega, te damos una explicación completa del funcionamiento del vehículo, equipamiento y consejos de conducción. Nuestras campers son fáciles de manejar y del tamaño de una furgoneta.",
    },
    ca: {
      q: "Necessito experiència prèvia conduint campers?",
      a: "No és necessari. Abans del lliurament, et donem una explicació completa del funcionament del vehicle, equipament i consells de conducció. Les nostres campers són fàcils de conduir i de la mida d'una furgoneta.",
    },
    en: {
      q: "Do I need previous experience driving campers?",
      a: "Not required. Before handover we give you a full walkthrough of the vehicle, equipment and driving tips. Our campers are easy to drive and the size of a small van.",
    },
  },
  // 9. Limpieza
  {
    es: {
      q: "¿Hay que dejar limpia la autocaravana al entregarla?",
      a: "El vehículo deberá ser devuelto en buenas condiciones higiénicas con su interior limpio y con el WC y los depósitos de aguas residuales debidamente vaciados. En caso contrario, el usuario acepta el pago de la cantidad fija de 60€.",
    },
    ca: {
      q: "S'ha de deixar neta l'autocaravana en lliurar-la?",
      a: "El vehicle s'haurà de retornar en bones condicions higièniques amb l'interior net i amb el WC i els dipòsits d'aigües residuals degudament buidats. En cas contrari, l'usuari accepta el pagament de la quantitat fixa de 60€.",
    },
    en: {
      q: "Do I have to return the camper clean?",
      a: "The vehicle must be returned in good hygienic condition with the interior clean and the WC and waste-water tanks properly emptied. Otherwise, the user agrees to pay a fixed fee of 60€.",
    },
  },
];

async function main() {
  for (let i = 0; i < ENTRIES.length; i++) {
    const e = ENTRIES[i];
    // Idempotent: match by ES question
    const existing = await db
      .select({ id: faqs.id })
      .from(faqs)
      .innerJoin(faqTranslations, eq(faqs.id, faqTranslations.faqId))
      .where(eq(faqTranslations.question, e.es.q))
      .limit(1);

    let faqId = existing[0]?.id;
    if (!faqId) {
      const [created] = await db
        .insert(faqs)
        .values({ sortOrder: i, status: "published" })
        .returning({ id: faqs.id });
      faqId = created.id;
      await db.insert(faqTranslations).values([
        { faqId, locale: "es", question: e.es.q, answer: e.es.a },
        { faqId, locale: "ca", question: e.ca.q, answer: e.ca.a },
        { faqId, locale: "en", question: e.en.q, answer: e.en.a },
      ]);
      console.log(`Inserted FAQ ${i + 1}: ${e.es.q.slice(0, 60)}…`);
    } else {
      console.log(`Skipped FAQ ${i + 1} (already present)`);
    }
  }
  process.exit(0);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
