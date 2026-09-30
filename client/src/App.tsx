import { Toaster } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import NotFound from "@/pages/NotFound";
import { Route, Switch } from "wouter";
import ErrorBoundary from "./components/ErrorBoundary";
import { ThemeProvider } from "./contexts/ThemeContext";
import { CartProvider } from "./contexts/CartContext";
import Home from "./pages/Home";
import Products from "./pages/Products";
import Favorites from "./pages/Favorites";
import ProductDetail from "./pages/ProductDetail";
import Cart from "./pages/Cart";
import Checkout from "./pages/Checkout";
import Admin from "./pages/Admin";
import AdminProducts from "./pages/AdminProducts";
import AdminOrders from "./pages/AdminOrders";
import AdminCategories from "./pages/AdminCategories";
import AdminSetup from "./pages/AdminSetup";
import AdminSettings from "./pages/AdminSettings";
import PwaInstallPrompt from "./components/PwaInstallPrompt";
import { useEffect, useState } from "react";
import { ArrowUp } from "lucide-react";
import { Button } from "@/components/ui/button";

function ScrollToTopButton() {
  const [visible, setVisible] = useState(false);
  useEffect(() => {
    const onScroll = () => setVisible(window.scrollY > 500);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);
  if (!visible) return null;
  return (
    <Button type="button" aria-label="العودة لأعلى الصفحة" title="العودة لأعلى الصفحة"
      onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
      className="fixed bottom-6 left-5 z-[70] h-11 w-11 rounded-full bg-blue-600 p-0 shadow-lg hover:bg-blue-700">
      <ArrowUp className="h-5 w-5" />
    </Button>
  );
}
import AdminRouteGuard from "./components/AdminRouteGuard";

function AdminProductsRoute() {
  return <AdminRouteGuard><AdminProducts /></AdminRouteGuard>;
}

function AdminOrdersRoute() {
  return <AdminRouteGuard><AdminOrders /></AdminRouteGuard>;
}

function AdminCategoriesRoute() {
  return <AdminRouteGuard><AdminCategories /></AdminRouteGuard>;
}

function AdminSetupRoute() {
  return <AdminRouteGuard><AdminSetup /></AdminRouteGuard>;
}

function AdminSettingsRoute() {
  return <AdminRouteGuard><AdminSettings /></AdminRouteGuard>;
}

function Router() {
  return (
    <Switch>
      <Route path="/" component={Home} />
      <Route path="/products" component={Products} />
      <Route path="/favorites" component={Favorites} />
      <Route path="/product/:id" component={ProductDetail} />
      <Route path="/cart" component={Cart} />
      <Route path="/checkout" component={Checkout} />
      <Route path="/admin" component={Admin} />
      <Route path="/admin/setup" component={AdminSetupRoute} />
      <Route path="/admin/settings" component={AdminSettingsRoute} />
      <Route path="/admin/categories" component={AdminCategoriesRoute} />
      <Route path="/admin/products" component={AdminProductsRoute} />
      <Route path="/admin/orders" component={AdminOrdersRoute} />
      <Route path="/404" component={NotFound} />
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  return (
    <ErrorBoundary>
      <ThemeProvider defaultTheme="light">
        <CartProvider>
          <TooltipProvider>
            <Toaster />
            <Router />
            <PwaInstallPrompt />
            <ScrollToTopButton />
          </TooltipProvider>
        </CartProvider>
      </ThemeProvider>
    </ErrorBoundary>
  );
}

export default App;
