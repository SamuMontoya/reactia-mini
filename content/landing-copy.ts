/**
 * Landing copy.
 *
 * Structure follows the value-equation logic: name the pain, promise the
 * outcome, make the outcome feel achievable (short, free, no call), then one
 * CTA. Deliberately removed: the old "solo para dueños de negocio que facturan
 * >5M COP/mes con 1+ año de operación" line and the free-vs-paid comparison
 * table. Both told most visitors to leave before the product had shown them
 * anything, and qualification already happens quietly in the next step.
 */

type HowItWorksStep = {
  titulo: string;
  descripcion: string;
};

type LandingCopy = {
  eyebrow: string;
  headline: {
    antes: string;
    enfasis: string;
    despues: string;
  };
  subheadline: string;
  gratis: {
    palabra: string;
    apoyo: string;
  };
  reassurances: string[];
  cta: string;
  ctaNota: string;
  howItWorksTitulo: string;
  howItWorks: HowItWorksStep[];
  cierre: string;
};

export const landingCopy: LandingCopy = {
  eyebrow: 'Kreanding · Escáner de crecimiento',
  headline: {
    antes: 'Deja de adivinar por qué tu negocio ',
    enfasis: 'no crece',
    despues: '.',
  },
  subheadline:
    'Responde 11 preguntas sobre tu negocio y recibe al instante un diagnóstico que te dice qué te está frenando y qué hacer primero.',
  gratis: {
    palabra: 'Gratis',
    apoyo: 'Sin tarjeta, sin llamadas, sin compromiso.',
  },
  reassurances: ['11 preguntas', '10 minutos', 'Resultado al instante'],
  cta: 'Empezar mi diagnóstico',
  ctaNota: 'Es una versión corta del diagnóstico que hacemos con nuestros clientes.',
  howItWorksTitulo: 'Cómo funciona',
  howItWorks: [
    {
      titulo: 'Cuéntanos de ti',
      descripcion: 'Unos datos rápidos para saber de qué negocio estamos hablando.',
    },
    {
      titulo: 'Responde 11 preguntas',
      descripcion:
        'Una por pantalla. Se guardan solas, así que puedes salir y volver donde quedaste.',
    },
    {
      titulo: 'Recibe tu diagnóstico',
      descripcion:
        'Tu freno principal, cómo estás en cada área y el siguiente paso concreto.',
    },
  ],
  cierre: 'Lo que descubras es tuyo, lo uses con nosotros o no.',
};
