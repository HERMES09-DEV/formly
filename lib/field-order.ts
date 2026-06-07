export function hasExactFieldOrder(
  activeFieldIds: string[],
  orderedIds: string[],
) {
  if (activeFieldIds.length !== orderedIds.length) {
    return false;
  }

  const activeIds = new Set(activeFieldIds);
  const orderedIdSet = new Set(orderedIds);

  return (
    activeIds.size === activeFieldIds.length &&
    orderedIdSet.size === orderedIds.length &&
    orderedIds.every((fieldId) => activeIds.has(fieldId))
  );
}
