export type GreedyKingChoice = {
  label: string;
  goldDelta: number;
  wisdom: number;
  feedback: string;
};

export type GreedyKingRound = {
  id: string;
  offer: string;
  choices: [GreedyKingChoice, GreedyKingChoice];
};

export const GREEDY_KING_ROUNDS: GreedyKingRound[] = [
  {
    id: 'crown',
    offer: 'El Rey Codicioso te vende una corona brillante por 8 monedas. Tu meta cuesta 20 al final.',
    choices: [
      { label: 'Comprar corona (-8)', goldDelta: -8, wisdom: 0, feedback: 'Brilla mucho, pero te aleja de tu meta.' },
      { label: 'Seguir hacia la meta', goldDelta: 0, wisdom: 1, feedback: 'Protegiste tu dinero para algo que importa más.' },
    ],
  },
  {
    id: 'work',
    offer: 'Puedes ordenar el almacén del castillo y ganar 5 monedas.',
    choices: [
      { label: 'Hacer el trabajo (+5)', goldDelta: 5, wisdom: 1, feedback: 'Ganaste dinero con una acción útil.' },
      { label: 'Ignorarlo (+0)', goldDelta: 0, wisdom: 0, feedback: 'No perdiste dinero, pero dejaste pasar un ingreso.' },
    ],
  },
  {
    id: 'snack',
    offer: 'El Rey ofrece un snack gigante por 6 monedas, aunque ya tienes comida.',
    choices: [
      { label: 'Comprar snack (-6)', goldDelta: -6, wisdom: 0, feedback: 'Fue un gusto extra; tu tesoro bajó.' },
      { label: 'Guardar las monedas', goldDelta: 0, wisdom: 1, feedback: 'Diferenciaste un deseo de una necesidad.' },
    ],
  },
  {
    id: 'safe-chest',
    offer: 'Encuentras un cofre seguro. Puedes separar 4 monedas para tu meta.',
    choices: [
      { label: 'Separar para la meta', goldDelta: 0, wisdom: 1, feedback: 'Separar dinero ayuda a no gastarlo por accidente.' },
      { label: 'Dejar todo mezclado', goldDelta: 0, wisdom: 0, feedback: 'El total no cambia, pero será más fácil gastarlo.' },
    ],
  },
  {
    id: 'final-offer',
    offer: 'Última tentación: una capa especial por 7 monedas.',
    choices: [
      { label: 'Comprar capa (-7)', goldDelta: -7, wisdom: 0, feedback: 'Fue tentador, pero la meta está al final del camino.' },
      { label: 'Llegar con el tesoro', goldDelta: 0, wisdom: 1, feedback: 'Priorizaste la meta sobre una compra impulsiva.' },
    ],
  },
];
