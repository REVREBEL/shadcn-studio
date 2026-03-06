import { useSyncExternalStore, useRef, useMemo } from "react";
export function useSyncExternalStoreWithSelector(subscribe, getSnapshot, getServerSnapshot, selector, isEqual) {
  const getSelection = () => {
    const nextSnapshot = getSnapshot();
    return selector(nextSnapshot);
  };
  const getServerSelection = getServerSnapshot ? () => selector(getServerSnapshot()) : undefined;
  let prevSelection = useRef(undefined);
  const memoizedGetSelection = () => {
    const nextSelection = getSelection();
    if (prevSelection.current !== undefined && isEqual && isEqual(prevSelection.current, nextSelection)) {
      return prevSelection.current;
    }
    prevSelection.current = nextSelection;
    return nextSelection;
  };
  return useSyncExternalStore(subscribe, memoizedGetSelection, getServerSelection);
}
