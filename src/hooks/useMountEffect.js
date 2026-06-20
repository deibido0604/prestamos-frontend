/* eslint-disable react-hooks/rules-of-hooks */
import { useEffect, useRef } from "react";

/**
 * Run callback once when the component is mounted
 * @param {*} effect callback
 * @param {*} deps array of dependencies
 * @param {*} unMount runs when the component is unmounted
 */
const useMountEffect = ({ effect = null, deps = [], unMount = null }) => {
  if (import.meta.env.PROD) {
    useEffect(() => {
      effect && effect();
      return () => {
        unMount && unMount();
      };
    }, deps);

    return;
  }

  const isInitialMount = useRef(true);
  useEffect(() => {
    if (!isInitialMount.current) {
      effect && effect();

      return () => {
        unMount && unMount();
      };
    } else {
      isInitialMount.current = false;
    }
  }, deps);
};

export default useMountEffect;
