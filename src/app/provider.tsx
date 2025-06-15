// app/providers.tsx
'use client';
import { UserProvider } from '@/components/UserContext';
import { SessionProvider } from 'next-auth/react';

import { ReactNode } from 'react';

export function Providers({ children }: { children: ReactNode }) {
    return (
        <SessionProvider>
            <UserProvider>
                {children}
            </UserProvider>
        </SessionProvider>
    );
}