import { QueryClientProvider } from "@tanstack/react-query";
import { Outlet, Link, createRootRouteWithContext, useRouter, HeadContent, Scripts } from "@tanstack/react-router";
import { useEffect } from "react";
import { Toaster } from "sonner";
import appCss from "../styles.css?url";
import { reportLovableError } from "../lib/lovable-error-reporting";
import { ShopProvider } from "@/lib/shop";
import { Header, Footer } from "@/components/site";

function NotFoundComponent() {
  return (
    <div className="flex min-h-[60dvh] w-full items-center justify-center px-4 py-12 text-center">
      <div className="max-w-md">
        <h1 className="font-display text-5xl sm:text-7xl">404</h1>
        <p className="mt-2 text-sm text-muted-foreground sm:text-base">This page doesn't exist.</p>
        <Link 
          to="/" 
          className="mt-6 inline-flex items-center justify-center rounded-full bg-primary px-6 py-2.5 text-sm font-medium text-primary-foreground transition-opacity hover:opacity-90"
        >
          Go home
        </Link>
      </div>
    </div>
  );
}

function ErrorComponent({ error, reset }) {
  const router = useRouter();
  useEffect(() => { reportLovableError(error, { boundary: "tanstack_root_error_component" }); }, [error]);
  return (
    <div className="flex min-h-[60dvh] w-full items-center justify-center px-4 py-12 text-center">
      <div className="max-w-md">
        <h1 className="text-lg font-semibold sm:text-xl">This page didn't load</h1>
        <button 
          onClick={() => { router.invalidate(); reset(); }} 
          className="mt-4 inline-flex items-center justify-center rounded-full bg-primary px-6 py-2.5 text-sm font-medium text-primary-foreground transition-opacity hover:opacity-90"
        >
          Try again
        </button>
      </div>
    </div>
  );
}

export const Route = createRootRouteWithContext()({
  head: () => ({
    meta: [
      { charSet: "utf-8" },
      { name: "viewport", content: "width=device-width, initial-scale=1" },
      { title: "HANNAN SUPERMARKET-RCM PUDUKKAD" },
      { name: "description", content: "Shop wellness, personal care and home care products from HANNAN SUPERMARKET-RCM PUDUKKAD." },
    ],
    links: [
      { rel: "preconnect", href: "https://fonts.googleapis.com" },
      { rel: "stylesheet", href: "https://fonts.googleapis.com/css2?family=Fraunces:opsz,wght@9..144,500;9..144,600&family=Manrope:wght@400;500;600;700&display=swap" },
      { rel: "stylesheet", href: appCss },
      { rel: "icon", href: "/favicon.ico", type: "image/x-icon" },
    ],
  }),
  shellComponent: RootShell,
  component: RootComponent,
  notFoundComponent: NotFoundComponent,
  errorComponent: ErrorComponent,
});

function RootShell({ children }) {
  return (
    <html lang="en" className="scroll-smooth">
      <head><HeadContent /></head>
      <body className="flex min-h-dvh flex-col overflow-x-hidden antialiased">{children}<Scripts /></body>
    </html>
  );
}

function RootComponent() {
  const { queryClient } = Route.useRouteContext();
  return (
    <QueryClientProvider client={queryClient}>
      <ShopProvider>
        <Header />
        <main className="w-full flex-1"><Outlet /></main>
        <Footer />
        <Toaster position="top-center" richColors />
      </ShopProvider>
    </QueryClientProvider>
  );
}
