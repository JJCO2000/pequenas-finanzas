import type { ImageSourcePropType } from 'react-native';
import type { InvestmentCompanionKey } from '@/core/domain/types';

export type ThemeCharacterRole =
  | 'primary'
  | 'secondary'
  | 'tertiary'
  | 'quaternary'
  | 'marketGuide'
  | 'escapeGuide';

export type ThemeInvestmentCompanion = {
  key: InvestmentCompanionKey;
  label: string;
  asset: ImageSourcePropType;
};

export type ThemeGameCopy = {
  title?: string;
  description?: string;
  shortInstruction?: string;
};

export type ThemeShopItem = {
  asset: ImageSourcePropType;
  title: string;
  effectTitle: string;
  effectDescription: string;
};

export type ThemeDestinationArt = {
  backgroundBlurRadius: number;
  map: { background: ImageSourcePropType; dino: ImageSourcePropType; sign: ImageSourcePropType };
  arcade: { background: ImageSourcePropType; pterosaur: ImageSourcePropType; starBlocks: ImageSourcePropType };
  wallet: { background: ImageSourcePropType; coinStack: ImageSourcePropType; starCoin: ImageSourcePropType };
  investments: { background: ImageSourcePropType; stegosaur: ImageSourcePropType };
  shop: { background: ImageSourcePropType; eggNest: ImageSourcePropType };
  collection: { background: ImageSourcePropType; longneck: ImageSourcePropType };
};

export type ThemePack = {
  id: string;
  name: string;
  copy: {
    companionSingular: string;
    companionPlural: string;
    currencySingular: string;
    currencyPlural: string;
    escapeLocationLabel: string;
    investmentTravelling: string;
    investmentArrived: string;
    games: Readonly<Record<string, ThemeGameCopy>>;
  };
  characters: Record<ThemeCharacterRole, ImageSourcePropType> & {
    startCast: readonly ImageSourcePropType[];
    onboardingProfile: readonly ImageSourcePropType[];
  };
  world: {
    shell: ImageSourcePropType;
    onboarding: ImageSourcePropType;
    mapWater: ImageSourcePropType;
    map?: ImageSourcePropType;
    mapVolcano: ImageSourcePropType;
    mapIslands: ImageSourcePropType;
    mapCompass: ImageSourcePropType;
    lesson: ImageSourcePropType;
    activity: ImageSourcePropType;
    shop: ImageSourcePropType;
    finance: ImageSourcePropType;
    parents: ImageSourcePropType;
    camp?: ImageSourcePropType;
    arcade?: ImageSourcePropType;
    investments?: ImageSourcePropType;
    market?: ImageSourcePropType;
    gameIntro?: ImageSourcePropType;
    coinField?: ImageSourcePropType;
  };
  destinations: ThemeDestinationArt;
  decor: {
    currency: ImageSourcePropType;
    savings: ImageSourcePropType;
    event: ImageSourcePropType;
    trail: ImageSourcePropType;
  };
  tabs: {
    home: ImageSourcePropType;
    map: ImageSourcePropType;
    games: ImageSourcePropType;
    wallet: ImageSourcePropType;
    parents: ImageSourcePropType;
    camp?: ImageSourcePropType;
    arcade?: ImageSourcePropType;
    investments?: ImageSourcePropType;
    market?: ImageSourcePropType;
    gameIntro?: ImageSourcePropType;
    coinField?: ImageSourcePropType;
  };
  shop: {
    shelfTitle: string;
    shelfHint: string;
    featuredItem: ImageSourcePropType;
    items: Readonly<Record<string, ThemeShopItem>>;
  };
  investmentCompanions: readonly ThemeInvestmentCompanion[];
  gameHeroes: Readonly<Record<string, ImageSourcePropType>>;
  gameThumbnails?: Readonly<Record<string, ImageSourcePropType>>;
  marketItems?: Readonly<Record<string, ImageSourcePropType>>;
  coinCatcherArt?: { coin: ImageSourcePropType; bonus: ImageSourcePropType; hazard: ImageSourcePropType; basket: ImageSourcePropType; hero: ImageSourcePropType };
  fallbackGameHero: ImageSourcePropType;
};
