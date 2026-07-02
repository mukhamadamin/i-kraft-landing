import { lazy, Suspense, useEffect } from "react";
import { Navigate, Route, Routes, useLocation } from "react-router-dom";
import { Layout } from "./components/Layout";
import { PageLoader } from "./components/PageLoader";

const lazyPage = (loader, name) => lazy(() => loader().then((mod) => ({ default: mod[name] })));

const HomePage = lazyPage(() => import("./pages/HomePage"), "HomePage");
const ProductsPage = lazyPage(() => import("./pages/ProductsPage"), "ProductsPage");
const CatalogPage = lazyPage(() => import("./pages/CatalogPage"), "CatalogPage");
const CategoriesPage = lazyPage(() => import("./pages/CategoriesPage"), "CategoriesPage");
const NewsPage = lazyPage(() => import("./pages/NewsPage"), "NewsPage");
const PostsPage = lazyPage(() => import("./pages/PostsPage"), "PostsPage");
const ClientsPage = lazyPage(() => import("./pages/ClientsPage"), "ClientsPage");
const WorksPage = lazyPage(() => import("./pages/WorksPage"), "WorksPage");
const ProductDetailPage = lazyPage(() => import("./pages/ProductDetailPage"), "ProductDetailPage");
const ArticleDetailPage = lazyPage(() => import("./pages/ArticleDetailPage"), "ArticleDetailPage");
const WorkDetailPage = lazyPage(() => import("./pages/WorkDetailPage"), "WorkDetailPage");
const ConstructorPage = lazyPage(() => import("./pages/ConstructorPage"), "ConstructorPage");
const NotFoundPage = lazyPage(() => import("./pages/NotFoundPage"), "NotFoundPage");

/* Админка загружается отдельным чанком и не попадает в публичный бандл */
const AdminPage = lazyPage(() => import("./pages/AdminPage"), "AdminPage");

function ScrollToTop() {
  const location = useLocation();

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: "instant" });
  }, [location.pathname, location.search]);

  return null;
}

export default function App() {
  return (
    <>
      <ScrollToTop />
      <Routes>
        {/* Панель управления: отдельный интерфейс, доступ только по прямому URL */}
        <Route
          path="/admin"
          element={
            <Suspense fallback={<PageLoader />}>
              <AdminPage />
            </Suspense>
          }
        />

        <Route element={<Layout />}>
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
          <Route path="/home" element={<Navigate to="/" replace />} />
          <Route path="*" element={<NotFoundPage />} />
        </Route>
      </Routes>
    </>
  );
}
