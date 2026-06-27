// ESM shim for "react/jsx-runtime" + "react/jsx-dev-runtime". Compiled npm
// packages (like @chainlit/react-client) import the automatic JSX runtime; route
// it through our single React.createElement. React reads `children` from the
// config object when no explicit children args are passed, so this is faithful.
const R = window.React;
export const Fragment = R.Fragment;
export function jsx(type, props, key) {
  const cfg = key === undefined ? props : Object.assign({}, props, { key });
  return R.createElement(type, cfg);
}
export const jsxs = jsx;
export function jsxDEV(type, props, key) { return jsx(type, props, key); }
export default { jsx, jsxs, jsxDEV, Fragment };
