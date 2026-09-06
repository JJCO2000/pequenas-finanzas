export type FossilEscapeClue = {
  id: string;
  clue: string;
  question: string;
  options: string[];
  correctIndex: number;
  keyWord: string;
};

export const FOSSIL_ESCAPE_CLUES: FossilEscapeClue[] = [
  {
    id: 'rainy-day',
    clue: 'La primera puerta tiene una nube y una alcancía.',
    question: '¿Qué te ayuda cuando aparece un gasto inesperado?',
    options: ['Gastar todo hoy', 'Fondo para imprevistos', 'Comprar por impulso'],
    correctIndex: 1,
    keyWord: 'PREVISIÓN',
  },
  {
    id: 'compare',
    clue: 'Dos artículos iguales tienen precios distintos.',
    question: '¿Qué haces antes de comprar?',
    options: ['Comparar precios', 'Elegir el más caro', 'No mirar el precio'],
    correctIndex: 0,
    keyWord: 'COMPARAR',
  },
  {
    id: 'budget',
    clue: 'Una tablilla divide monedas entre varias cosas.',
    question: '¿Cómo se llama el plan para decidir a dónde va tu dinero?',
    options: ['Tesoro secreto', 'Presupuesto', 'Premio sorpresa'],
    correctIndex: 1,
    keyWord: 'PLAN',
  },
  {
    id: 'investment',
    clue: 'Un compañero lleva monedas hacia un día futuro.',
    question: '¿Qué describe mejor una inversión dentro del juego?',
    options: ['Dinero que puede crecer con el tiempo', 'Dinero perdido para siempre', 'Un gasto sin objetivo'],
    correctIndex: 0,
    keyWord: 'CRECER',
  },
];
