'use client';

import { Chip } from '@/components/ui/Chip';
import { REDUCE_QUERY, useMedia } from './hooks';

/** What this device asks for right now – follows the OS setting live. */
export function MotionPreference() {
  const reduce = useMedia(REDUCE_QUERY);
  if (reduce === null) return <Chip tone="neutral">ההגדרה במכשיר הזה</Chip>;
  return reduce ? (
    <Chip tone="wheat">במכשיר הזה: תנועה מופחתת</Chip>
  ) : (
    <Chip tone="sprout">במכשיר הזה: תנועה מלאה</Chip>
  );
}
