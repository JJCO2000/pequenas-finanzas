import { ASSETS } from './assets';
export const CHARACTERS = {
  trex: { id: 'trex', name: 'Rex', static: ASSETS.characters.trex },
  stegosaurus: { id: 'stegosaurus', name: 'Stego', static: ASSETS.characters.stegosaurus },
  longneck: { id: 'longneck', name: 'Largo', static: ASSETS.characters.longneck },
} as const;
