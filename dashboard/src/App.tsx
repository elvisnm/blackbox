import { lazy, Suspense } from "react";
import { createBrowserRouter, RouterProvider } from "react-router-dom";
import Layout from "@/Layout";
import { Skeleton } from "@/components/ui/skeleton";

const ListView = lazy(() => import("@/pages/ListView"));
const DetailView = lazy(() => import("@/pages/DetailView"));
const HistoryView = lazy(() => import("@/pages/HistoryView"));
const DiffView = lazy(() => import("@/pages/DiffView"));

function PageLoader() {
  return (
    <div className="container mx-auto py-8 space-y-4">
      <Skeleton className="h-8 w-[200px]" />
      <Skeleton className="h-4 w-full" />
      <Skeleton className="h-[300px] w-full rounded-lg" />
    </div>
  );
}

const router = createBrowserRouter([
  {
    element: <Layout />,
    children: [
      {
        path: "/",
        element: (
          <Suspense fallback={<PageLoader />}>
            <ListView />
          </Suspense>
        ),
      },
      {
        path: "/blueprint/:owner/:repo/:type/:name",
        element: (
          <Suspense fallback={<PageLoader />}>
            <DetailView />
          </Suspense>
        ),
      },
      {
        path: "/blueprint/:owner/:repo/:type/:name/history",
        element: (
          <Suspense fallback={<PageLoader />}>
            <HistoryView />
          </Suspense>
        ),
      },
      {
        path: "/blueprint/:owner/:repo/:type/:name/diff/:sha1..:sha2",
        element: (
          <Suspense fallback={<PageLoader />}>
            <DiffView />
          </Suspense>
        ),
      },
    ],
  },
]);

export default function App() {
  return <RouterProvider router={router} />;
}
