// Destination illustration SSOTs live under assets/ui/home/destinations as each block is approved.
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
  // Block 1 SSOT: the Mapa illustration lives only in assets/ui/home/destinations/mapa.svg.
  { id: 'map', label: 'Mapa', subtitle: 'Aventura', hint: 'Abre la aventura principal', route: '/play', navigation: 'replace',
    art: require('../../../assets/ui/home/destinations/mapa.svg'), artBackground: '#DDF3E4' },
  { id: 'arcade', label: 'Arcade', subtitle: '7 retos', hint: 'Abre los retos del arcade', route: '/arcade', navigation: 'push',
    art: require('../../../assets/ui/home/arcade-vector.svg'), artBackground: '#D8EEFF' },
  { id: 'wallet', label: 'Mi dinero', subtitle: '$0', hint: 'Abre tu cartera', route: '/wallet', navigation: 'push',
    art: require('../../../assets/ui/home/dinero-vector.svg'), artBackground: '#FFF2A8' },
  { id: 'investments', label: 'Inversiones', subtitle: 'Expediciones', hint: 'Abre tus expediciones de inversión', route: '/investments', navigation: 'push',
    art: require('../../../assets/ui/home/inversiones-vector.svg'), artBackground: '#FFE0B8' },
  { id: 'shop', label: 'Tienda', subtitle: 'Mejoras', hint: 'Abre la tienda de mejoras', route: '/shop', navigation: 'push',
    art: require('../../../assets/ui/home/tienda-vector.svg'), artBackground: '#E8DEFF' },
  { id: 'collection', label: 'Colección', subtitle: 'Museo', hint: 'Abre el museo y tu colección', route: '/collection', navigation: 'push',
    art: require('../../../assets/ui/home/coleccion-vector.svg'), artBackground: '#DDF4FF' },
] as const;
