export type HomeDestination = {
  id: 'map' | 'arcade' | 'wallet' | 'investments' | 'shop' | 'collection';
  label: string;
  hint: string;
  route: '/play' | '/arcade' | '/wallet' | '/investments' | '/shop' | '/collection';
  navigation: 'push' | 'replace';
  icon: string;
};

export const HOME_DESTINATIONS: readonly HomeDestination[] = [
  { id: 'map', label: 'Mapa', hint: 'Abre la aventura principal', route: '/play', navigation: 'replace', icon: '🗺️' },
  { id: 'arcade', label: 'Arcade', hint: 'Abre los retos del arcade', route: '/arcade', navigation: 'push', icon: '🎮' },
  { id: 'wallet', label: 'Mi dinero', hint: 'Abre tu cartera', route: '/wallet', navigation: 'push', icon: '💰' },
  { id: 'investments', label: 'Inversiones', hint: 'Abre tus expediciones de inversión', route: '/investments', navigation: 'push', icon: '📈' },
  { id: 'shop', label: 'Tienda', hint: 'Abre la tienda de mejoras', route: '/shop', navigation: 'push', icon: '🛒' },
  { id: 'collection', label: 'Colección', hint: 'Abre el museo y tu colección', route: '/collection', navigation: 'push', icon: '🏛️' },
] as const;
