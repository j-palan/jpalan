import { Analytics } from "@vercel/analytics/react";
import Index from "./pages/Index";
import NotFound from "./pages/NotFound";

/* One page. Vercel rewrites every path to index.html, so the only routing
   decision left is "is this the home page or not" — a router would be 20 kB
   spent on a single boolean. /work is redirected at the edge in vercel.json. */
const isHome = () => {
  const path = window.location.pathname.replace(/\/+$/, "");
  return path === "" || path === "/index.html";
};

const App = () => (
  <>
    {isHome() ? <Index /> : <NotFound />}
    <Analytics />
  </>
);

export default App;
