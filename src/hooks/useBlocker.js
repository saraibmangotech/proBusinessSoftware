import * as React from 'react';
import { UNSAFE_NavigationContext } from 'react-router-dom';
import history from 'services/HistoryService';




export function useBlocker(blocker, when = true) {
  const navigator = React.useContext(UNSAFE_NavigationContext).navigator;

  React.useEffect(() => {
    if (!when) return;

    const unblock = history.block((tx) => {
      const autoUnblockingTx = {
        ...tx,
        retry() {
          unblock();
          tx.retry();
        },
      };

      blocker(autoUnblockingTx);
    });

    return unblock;
  }, [blocker, when]);
}

  export default useBlocker;