import { Header } from "./Header";
import { Footer } from "./Footer";

export function Layout({ children }) {
  return (
    <>
      <Header />
      <main className="page-main">{children}</main>
      <Footer />
    </>
  );
}
