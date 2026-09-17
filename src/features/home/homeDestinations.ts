// Destination illustration SSOTs live under assets/ui/home/destinations as each block is approved.
// Blocks 1-2 use semantic canonical layers from their approved references instead of generic mascot/prop slots.
type MapDestinationArtLayers = {
  kind: 'map';
  background: number;
  dino: number;
  sign: number;
};

type ArcadeDestinationArtLayers = {
  kind: 'arcade';
  background: number;
  pterosaur: number;
  starBlocks: number;
};

export type HomeDestinationArtLayers = MapDestinationArtLayers | ArcadeDestinationArtLayers;

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

const mapArt = {
  kind: 'map',
  background: require('../../../assets/ui/home/destinations/mapa/background.jpg'),
  dino: require('../../../assets/ui/home/destinations/mapa/dino.webp'),
  sign: require('../../../assets/ui/home/destinations/mapa/sign.webp'),
} satisfies MapDestinationArtLayers;

// Block 2 reference contract: sky/cliffs/foliage background + blue pterosaur + the two gold star blocks.
// All three assets share the same scene canvas so their approved composition stays aligned at every card size.
const arcadeArt = {
  kind: 'arcade',
  background: require('../../../assets/ui/home/destinations/arcade/background.webp'),
  pterosaur: require('../../../assets/ui/home/destinations/arcade/pterosaur.webp'),
  starBlocks: require('../../../assets/ui/home/destinations/arcade/star-blocks.webp'),
} satisfies ArcadeDestinationArtLayers;

export function getHomeDestinationArtLayerEntries(layers: HomeDestinationArtLayers) {
  switch (layers.kind) {
    case 'map':
      return [
        { key: 'background', source: layers.background },
        { key: 'dino', source: layers.dino },
        { key: 'sign', source: layers.sign },
      ] as const;
    case 'arcade':
      return [
        { key: 'background', source: layers.background },
        { key: 'pterosaur', source: layers.pterosaur },
        { key: 'starBlocks', source: layers.starBlocks },
      ] as const;
  }
}

export const HOME_DESTINATIONS: readonly HomeDestination[] = [
  { id: 'map', label: 'Mapa', subtitle: 'Aventura', hint: 'Abre la aventura principal', route: '/play', navigation: 'replace',
    artLayers: mapArt,
    artBackground: '#DDF3E4' },
  { id: 'arcade', label: 'Arcade', subtitle: '7 retos', hint: 'Abre los retos del arcade', route: '/arcade', navigation: 'push',
    artLayers: arcadeArt,
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
