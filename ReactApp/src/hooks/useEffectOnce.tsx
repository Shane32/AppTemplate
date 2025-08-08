import * as React from "react";

const useEffectOnce = (fn: () => void) => {
  React.useEffect(() => {
    fn();
  }, []); // eslint-disable-line react-hooks/exhaustive-deps
};

export default useEffectOnce;
