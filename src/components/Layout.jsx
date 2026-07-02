import { Suspense } from "react";
import { Outlet } from "react-router-dom";
import { Header } from "./Header";
import { Footer } from "./Footer";
import { PageLoader } from "./PageLoader";

export function Layout() {
  return (
    <>
      <Header />
      <main className="page-main">
        <Suspense fallback={<PageLoader />}>
          <Outlet />
        </Suspense>
      </main>
      <Footer />
    </>
  );
}
