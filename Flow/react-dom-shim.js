// ESM shim for "react-dom" and "react-dom/client" — see react-shim.js.
const RD = window.ReactDOM;
export default RD;
export const {
  createPortal, flushSync, render, hydrate, unmountComponentAtNode,
  findDOMNode, createRoot, hydrateRoot, version,
} = RD;
