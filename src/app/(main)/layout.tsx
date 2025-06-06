import Navbar from "@/components/Navbar";
import { UserProvider } from "@/components/UserContext";
import { Suspense } from "react";

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <UserProvider>
      <div>
        <Navbar />
       <Suspense fallback={<div>Loading...</div>}>
          <main>
            {children}
          </main>
        </Suspense>
      </div>
    </UserProvider>
  );
}
