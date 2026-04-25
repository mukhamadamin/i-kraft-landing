import { Navigate, Route, Routes, useLocation } from "react-router-dom";
import { useEffect } from "react";
import { Layout } from "./components/Layout";
import { HomePage } from "./pages/HomePage";
import { ProductsPage } from "./pages/ProductsPage";
import { CatalogPage } from "./pages/CatalogPage";
import { CategoriesPage } from "./pages/CategoriesPage";
import { NewsPage } from "./pages/NewsPage";
import { PostsPage } from "./pages/PostsPage";
import { ClientsPage } from "./pages/ClientsPage";
import { WorksPage } from "./pages/WorksPage";
import { ProductDetailPage } from "./pages/ProductDetailPage";
import { ArticleDetailPage } from "./pages/ArticleDetailPage";
import { WorkDetailPage } from "./pages/WorkDetailPage";
import { ConstructorPage } from "./pages/ConstructorPage";
import { AdminPage } from "./pages/AdminPage";
import { NotFoundPage } from "./pages/NotFoundPage";

function ScrollToTop() {
  const location = useLocation();

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: "instant" });
  }, [location.pathname, location.search]);

  return null;
}

export default function App() {
  return (
    <Layout>
      <ScrollToTop />
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/products" element={<ProductsPage />} />
        <Route path="/catalog" element={<CatalogPage />} />
        <Route path="/categories" element={<CategoriesPage />} />
        <Route path="/news" element={<NewsPage />} />
        <Route path="/posts" element={<PostsPage />} />
        <Route path="/clients" element={<ClientsPage />} />
        <Route path="/works" element={<WorksPage />} />
        <Route path="/product/:id" element={<ProductDetailPage />} />
        <Route path="/article/:type/:id" element={<ArticleDetailPage />} />
        <Route path="/work/:id" element={<WorkDetailPage />} />
        <Route path="/constructor" element={<ConstructorPage />} />
        <Route path="/admin" element={<AdminPage />} />
        <Route path="/home" element={<Navigate to="/" replace />} />
        <Route path="*" element={<NotFoundPage />} />
      </Routes>
    </Layout>
  );
}
