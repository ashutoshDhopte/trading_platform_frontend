import Navbar from "@/components/Navbar";
import { UserProvider } from "@/components/UserContext";

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <UserProvider>
      <div>
        <Navbar />
        <main>
          {children}
        </main>
      </div>
    </UserProvider>
  );
}
