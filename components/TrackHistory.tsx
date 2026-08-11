'use client';

import { useEffect } from 'react';
import { useClientStore } from '@/lib/clientStore';

export default function TrackHistory({ slug }: { slug: string }) {
  const { addHistory } = useClientStore();

  useEffect(() => {
    addHistory(slug);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [slug]);

  return null;
}
