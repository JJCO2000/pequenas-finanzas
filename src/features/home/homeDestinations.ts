// Destination illustration SSOTs live under assets/ui/home/destinations as each block is approved.
// Blocks 1-2 CI lock v5: Mapa and Arcade both use three independently replaceable scene layers in the shared renderer; Arcade now mirrors the approved Block 1 pattern with a clean raster background plus reusable mascot and prop layers.
export type HomeDestinationArtLayers = {
  background: number;
  mascot: number;
  prop: number;
};

export type HomeDestination = {
  id: 'map' | 'arcade' | 'wallet' | 'investments' | 'shop' | 'collection';
  label: string;
  subtitle: string;
  hint: string;
  route: '/play' | '/arcade' | '/wallet' | '/investments' | '/shop' | '/collection';
  navigation: 'push' | 'replace';
  art?: number;
  artLayers?: HomeDestinationArtLayers;
  artBackground: string;
};

export const HOME_DESTINATIONS: readonly HomeDestination[] = [
  { id: 'map', label: 'Mapa', subtitle: 'Aventura', hint: 'Abre la aventura principal', route: '/play', navigation: 'replace',
    artLayers: {
      background: require('../../../assets/ui/home/destinations/mapa/background.jpg'),
      mascot: require('../../../assets/ui/home/destinations/mapa/dino.webp'),
      prop: require('../../../assets/ui/home/destinations/mapa/sign.webp'),
    },
    artBackground: '#DDF3E4' },
  // Block 2 only: clean painted Arcade background + reusable blue pterosaur + reusable star-block props.
  { id: 'arcade', label: 'Arcade', subtitle: '7 retos', hint: 'Abre los retos del arcade', route: '/arcade', navigation: 'push',
    artLayers: {
      background: require('../../../assets/ui/home/destinations/arcade/background.webp'),
      mascot: require('../../../assets/ui/home/destinations/arcade/mascot.webp'),
      prop: require('../../../assets/ui/home/destinations/arcade/prop.webp'),
    },
    artBackground: '#D8EEFF' },
  { id: 'wallet', label: 'Mi dinero', subtitle: '$0', hint: 'Abre tu cartera', route: '/wallet', navigation: 'push',
    art: require('../../../assets/ui/home/dinero-vector.svg'), artBackground: '#FFF2A8' },
  { id: 'investments', label: 'Inversiones', subtitle: 'Expediciones', hint: 'Abre tus expediciones de inversión', route: '/investments', navigation: 'push',
    art: require('../../../assets/ui/home/inversiones-vector.svg'), artBackground: '#FFE0B8' },
  { id: 'shop', label: 'Tienda', subtitle: 'Mejoras', hint: 'Abre la tienda de mejoras', route: '/shop', navigation: 'push',
    art: require('../../../assets/ui/home/tienda-vector.svg'), artBackground: '#E8DEFF' },
  { id: 'collection', label: 'Colección', subtitle: 'Museo', hint: 'Abre el museo y tu colección', route: '/collection', navigation: 'push',
    art: require('../../../assets/ui/home/coleccion-vector.svg'), artBackground: '#DDF4FF' },
] as const;