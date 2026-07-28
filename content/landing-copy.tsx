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

import { Compass, Sparkles, WhatsApp } from '@/components/icons';
import React from 'react';

type HowItWorksStep = {
  titulo: string;
  descripcion: string;
  icon: React.ReactNode;
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
  howItWorksEyebrow?: string;
  howItWorksHeadline?: string;
  howItWorksSubheadline?: string;
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
  howItWorksEyebrow: 'Kreanding · Escáner de crecimiento',
  howItWorksHeadline: 'Tres pasos para tu diagnóstico',
  howItWorksSubheadline: 'Responde, descubre y actúa en menos de 10 minutos',
  howItWorks: [
    {
      titulo: 'Cuéntanos de ti',
      descripcion: 'Unos datos rápidos para saber de qué negocio estamos hablando.',
      icon: <Compass className="h-6 w-6" />,
    },
    {
      titulo: 'Responde 11 preguntas',
      descripcion:
        'Una por pantalla. Se guardan solas, así que puedes salir y volver donde quedaste.',
      icon: <Sparkles className="h-6 w-6" />,
    },
    {
      titulo: 'Recibe tu diagnóstico',
      descripcion:
        'Tu freno principal, cómo estás en cada área y el siguiente paso concreto.',
      icon: <WhatsApp className="h-6 w-6" />,
    },
  ],
  cierre: 'Lo que descubras es tuyo, lo uses con nosotros o no.',
};
