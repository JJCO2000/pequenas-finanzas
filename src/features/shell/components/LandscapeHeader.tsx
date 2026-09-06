import React from 'react';
import { WorldHeader } from '@/features/shell/world';

export function LandscapeHeader({ eyebrow, title, onBack, backLabel = '←', right }: { eyebrow?: string; title: string; onBack: () => void; backLabel?: string; right?: React.ReactNode }) {
  return <WorldHeader eyebrow={eyebrow} title={title} onBack={onBack} right={right} />;
}
