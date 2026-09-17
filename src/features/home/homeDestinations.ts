import type { ImageSourcePropType } from 'react-native';
import { ACTIVE_THEME } from '@/core/theme';

// Destination illustration SSOTs live under assets/ui/home/destinations as each block is approved.
// Blocks 1-6 use semantic canonical layers from their approved references instead of generic mascot/prop slots.
type MapDestinationArtLayers = {
  kind: 'map';
  background: ImageSourcePropType;
  dino: ImageSourcePropType;
  sign: ImageSourcePropType;
};

type ArcadeDestinationArtLayers = {
  kind: 'arcade';
  background: ImageSourcePropType;
  pterosaur: ImageSourcePropType;
  starBlocks: ImageSourcePropType;
};

type WalletDestinationArtLayers = {
  kind: 'wallet';
  background: ImageSourcePropType;
  coinStack: ImageSourcePropType;
  starCoin: ImageSourcePropType;
};

type InvestmentsDestinationArtLayers = {
  kind: 'investments';
  background: ImageSourcePropType;
  stegosaur: ImageSourcePropType;
};

type ShopDestinationArtLayers = {
  kind: 'shop';
  background: ImageSourcePropType;
  eggNest: ImageSourcePropType;
};

type CollectionDestinationArtLayers = {
  kind: 'collection';
  background: ImageSourcePropType;
  longneck: ImageSourcePropType;
};

export type HomeDestinationArtLayers =
  | MapDestinationArtLayers
  | ArcadeDestinationArtLayers
  | WalletDestinationArtLayers
  | InvestmentsDestinationArtLayers
  | ShopDestinationArtLayers
  | CollectionDestinationArtLayers;

export type HomeDestination = {
  id: 'map' | 'arcade' | 'wallet' | 'investments' | 'shop' | 'collection';
  label: string;
  subtitle: string;
  hint: string;
  route: '/play' | '/arcade' | '/wallet' | '/investments' | '/shop' | '/collection';
  navigation: 'push' | 'replace';
  art?: number;
  artLayers?: HomeDestinationArtLayers;
  artHeightRatio?: number;
  artBackground: string;
};

const mapArt = {
  kind: 'map',
  background: ACTIVE_THEME.destinations.map.background,
  dino: ACTIVE_THEME.destinations.map.dino,
  sign: ACTIVE_THEME.destinations.map.sign,
} satisfies MapDestinationArtLayers;

// Block 2 reference contract: sky/cliffs/foliage background + blue pterosaur + the two gold star blocks.
// All three assets share the same scene canvas so their approved composition stays aligned at every card size.
const arcadeArt = {
  kind: 'arcade',
  background: ACTIVE_THEME.destinations.arcade.background,
  pterosaur: ACTIVE_THEME.destinations.arcade.pterosaur,
  starBlocks: ACTIVE_THEME.destinations.arcade.starBlocks,
} satisfies ArcadeDestinationArtLayers;

// Block 3 reference contract: jungle/waterfall background + stacked coins + the large star coin in front.
// The background stays raster while the two transparent foreground layers are SVG so Expo Web renders them reliably.
const walletArt = {
  kind: 'wallet',
  background: ACTIVE_THEME.destinations.wallet.background,
  coinStack: ACTIVE_THEME.destinations.wallet.coinStack,
  starCoin: ACTIVE_THEME.destinations.wallet.starCoin,
} satisfies WalletDestinationArtLayers;

// Block 4 reference contract: desert/ruins background + orange stegosaur.
// Only two semantic layers are needed; adding more would be fake complexity.
const investmentsArt = {
  kind: 'investments',
  background: ACTIVE_THEME.destinations.investments.background,
  stegosaur: ACTIVE_THEME.destinations.investments.stegosaur,
} satisfies InvestmentsDestinationArtLayers;

// Block 5 reference contract: purple mountain/foliage scene + the green-spotted egg in its nest.
// The split is semantic and reconstructs the approved composition without placeholder props.
const shopArt = {
  kind: 'shop',
  background: ACTIVE_THEME.destinations.shop.background,
  eggNest: ACTIVE_THEME.destinations.shop.eggNest,
} satisfies ShopDestinationArtLayers;

// Block 6 reference contract: museum/ruins scene with the fossil exhibit in the background + the green longneck in front.
// The fossil belongs to the museum environment, so Collection needs two semantic layers rather than fake extra props.
const collectionArt = {
  kind: 'collection',
  background: ACTIVE_THEME.destinations.collection.background,
  longneck: ACTIVE_THEME.destinations.collection.longneck,
} satisfies CollectionDestinationArtLayers;

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
    case 'wallet':
      return [
        { key: 'background', source: layers.background },
        { key: 'coinStack', source: layers.coinStack },
        { key: 'starCoin', source: layers.starCoin },
      ] as const;
    case 'investments':
      return [
        { key: 'background', source: layers.background },
        { key: 'stegosaur', source: layers.stegosaur },
      ] as const;
    case 'shop':
      return [
        { key: 'background', source: layers.background },
        { key: 'eggNest', source: layers.eggNest },
      ] as const;
    case 'collection':
      return [
        { key: 'background', source: layers.background },
        { key: 'longneck', source: layers.longneck },
      ] as const;
  }
}

export const HOME_DESTINATIONS: readonly HomeDestination[] = [
  { id: 'map', label: 'Mapa', subtitle: 'Aventura', hint: 'Abre la aventura principal', route: '/play', navigation: 'replace',
    artLayers: mapArt,
    artBackground: '#DDF3E4' },
  // Approved reference: the painted Arcade scene occupies ~67% of the card height before the label area begins.
  { id: 'arcade', label: 'Arcade', subtitle: '7 retos', hint: 'Abre los retos del arcade', route: '/arcade', navigation: 'push',
    artLayers: arcadeArt,
    artHeightRatio: 0.67,
    artBackground: '#D8EEFF' },
  // Approved reference: the money illustration uses the same tall image-to-copy split as Arcade.
  { id: 'wallet', label: 'Mi dinero', subtitle: '$0', hint: 'Abre tu cartera', route: '/wallet', navigation: 'push',
    artLayers: walletArt,
    artHeightRatio: 0.67,
    artBackground: '#FFF2A8' },
  // Approved reference: the investments illustration uses the same tall image-to-copy split as Arcade and Wallet.
  { id: 'investments', label: 'Inversiones', subtitle: 'Expediciones', hint: 'Abre tus expediciones de inversión', route: '/investments', navigation: 'push',
    artLayers: investmentsArt,
    artHeightRatio: 0.67,
    artBackground: '#FFE0B8' },
  // Approved reference: Tienda keeps the same tall scene-to-copy split and uses the real egg-in-nest composition.
  { id: 'shop', label: 'Tienda', subtitle: 'Mejoras', hint: 'Abre la tienda de mejoras', route: '/shop', navigation: 'push',
    artLayers: shopArt,
    artHeightRatio: 0.67,
    artBackground: '#E8DEFF' },
  // Approved reference: Colección keeps the same tall scene-to-copy split and the real museum + longneck composition.
  { id: 'collection', label: 'Colección', subtitle: 'Museo', hint: 'Abre el museo y tu colección', route: '/collection', navigation: 'push',
    artLayers: collectionArt,
    artHeightRatio: 0.67,
    artBackground: '#DDF4FF' },
] as const;
