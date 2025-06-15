import Navbar from "@/components/Navbar";
import { Suspense } from "react";

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <div>
      <Suspense fallback={<div>Loading...</div>}>
        <Navbar />
        <main>
          {children}
        </main>
      </Suspense>
    </div>
  );
}
