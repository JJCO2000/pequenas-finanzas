export const ASSETS = {
  app: {
    icon: require('../../assets/app/icon.png'),
    splash: require('../../assets/app/splash-icon.png'),
  },
  tabs: {
    home: require('../../assets/ui/tabs/home.png'), map: require('../../assets/ui/tabs/map.png'), games: require('../../assets/ui/tabs/games.png'), wallet: require('../../assets/ui/tabs/wallet.png'), parents: require('../../assets/ui/tabs/parents.png'),
  },
  characters: {
    trex: require('../../assets/characters/trex/static/trex.png'),
    stegosaurus: require('../../assets/characters/stegosaurus/static/stegosaurus.png'),
    longneck: require('../../assets/characters/longneck/static/longneck.png'),
  },
  references: { resourceSheet: require('../../assets/characters/reference/dino-sheet.png') },
} as const;
