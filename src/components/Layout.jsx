import { Suspense } from "react";
import { Outlet, useLocation } from "react-router-dom";
import { Header } from "./Header";
import { Footer } from "./Footer";
import { PageLoader } from "./PageLoader";
import { Atmosphere, Cursor, ScrollProgress } from "./motion";

export function Layout() {
  const location = useLocation();

  return (
    <>
      <Atmosphere />
      <ScrollProgress />
      <Cursor />
      <Header />
      {/* key по маршруту перезапускает анимацию входа страницы */}
      <main className="page-main route-fade" key={location.pathname}>
        <Suspense fallback={<PageLoader />}>
          <Outlet />
        </Suspense>
      </main>
      <Footer />
    </>
  );
}
