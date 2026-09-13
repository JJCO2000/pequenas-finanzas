import { router, useLocalSearchParams } from 'expo-router';

function firstParam(value: string | string[] | undefined) {
  return Array.isArray(value) ? value[0] : value;
}

export function useCampBack() {
  const params = useLocalSearchParams<{ from?: string | string[] }>();
  const from = firstParam(params.from);
  const fromCamp = from === 'camp';
  const fromGameResult = from === 'game-result';

  const goBack = () => {
    if (fromCamp) {
      router.replace({ pathname: '/play', params: { camp: '1' } } as any);
      return;
    }
    if (fromGameResult) {
      router.replace('/play' as any);
      return;
    }
    router.back();
  };

  return { fromCamp, fromGameResult, goBack };
}
