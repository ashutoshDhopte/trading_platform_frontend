import Navbar from "@/components/Navbar";
import { LoadingProvider } from "@/components/LoadingContext";
import LoadingOverlay from "@/components/LoadingOverlay";
import { Suspense } from "react";

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <LoadingProvider>
      <div>
        <Suspense fallback={<div>Loading...</div>}>
          <Navbar />
          <main className="relative">
            {children}
            <LoadingOverlay />
          </main>
        </Suspense>
      </div>
    </LoadingProvider>
  );
}
