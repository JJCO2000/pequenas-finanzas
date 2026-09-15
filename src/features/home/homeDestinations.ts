export type HomeDestination = {
  id: 'map' | 'arcade' | 'wallet' | 'investments' | 'shop' | 'collection';
  label: string;
  subtitle: string;
  hint: string;
  route: '/play' | '/arcade' | '/wallet' | '/investments' | '/shop' | '/collection';
  navigation: 'push' | 'replace';
  art: number;
  artBackground: string;
};

export const HOME_DESTINATIONS: readonly HomeDestination[] = [
  { id: 'map', label: 'Mapa', subtitle: 'Aventura', hint: 'Abre la aventura principal', route: '/play', navigation: 'replace',
    art: require('../../../assets/ui/home/mapa-vector.svg'), artBackground: '#DDF3E4' },
  { id: 'arcade', label: 'Arcade', subtitle: '7 retos', hint: 'Abre los retos del arcade', route: '/arcade', navigation: 'push',
    art: require('../../../assets/ui/v6/arcade/dino-market.webp'), artBackground: '#D8EEFF' },
  { id: 'wallet', label: 'Mi dinero', subtitle: '$0', hint: 'Abre tu cartera', route: '/wallet', navigation: 'push',
    art: require('../../../assets/ui/v6/coin/coin.png'), artBackground: '#FFF2A8' },
  { id: 'investments', label: 'Inversiones', subtitle: 'Expediciones', hint: 'Abre tus expediciones de inversión', route: '/investments', navigation: 'push',
    art: require('../../../assets/characters/stegosaurus/static/stegosaurus.png'), artBackground: '#FFE0B8' },
  { id: 'shop', label: 'Tienda', subtitle: 'Mejoras', hint: 'Abre la tienda de mejoras', route: '/shop', navigation: 'push',
    art: require('../../../assets/world/shop/egg-forest.png'), artBackground: '#E8DEFF' },
  { id: 'collection', label: 'Colección', subtitle: 'Museo', hint: 'Abre el museo y tu colección', route: '/collection', navigation: 'push',
    art: require('../../../assets/characters/longneck/static/longneck.png'), artBackground: '#DDF4FF' },
] as const;
