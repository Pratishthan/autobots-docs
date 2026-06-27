// ESM shim — re-exports the SINGLE React instance already on the page (loaded as
// a UMD global by Flow.html) so that esm.sh modules imported with `?external=react`
// resolve to OUR React. Without this you'd get a second React copy and hooks would
// throw "Invalid hook call". Mapped to the bare specifier "react" via the import map.
const R = window.React;
export default R;
export const {
  Children, Component, Fragment, Profiler, PureComponent, StrictMode, Suspense,
  cloneElement, createContext, createElement, createFactory, createRef,
  forwardRef, isValidElement, lazy, memo, startTransition,
  useCallback, useContext, useDebugValue, useDeferredValue, useEffect, useId,
  useImperativeHandle, useInsertionEffect, useLayoutEffect, useMemo,
  useReducer, useRef, useState, useSyncExternalStore, useTransition, version,
} = R;
