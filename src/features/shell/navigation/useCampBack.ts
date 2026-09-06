import { router, useLocalSearchParams } from 'expo-router';

function firstParam(value: string | string[] | undefined) {
  return Array.isArray(value) ? value[0] : value;
}

export function useCampBack() {
  const params = useLocalSearchParams<{ from?: string | string[] }>();
  const fromCamp = firstParam(params.from) === 'camp';

  const goBack = () => {
    if (fromCamp) {
      router.replace({ pathname: '/play', params: { camp: '1' } } as any);
      return;
    }
    router.back();
  };

  return { fromCamp, goBack };
}
