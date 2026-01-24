import React, { createContext, useContext, useEffect, useState } from 'react';
import { supabase } from '../lib/supabase';
import { Session, User } from '@supabase/supabase-js';

type AuthContextType = {
    session: Session | null;
    user: User | null;
    role: string | null;
    authRole: string | null; // Explicit JWT Source (Maps to DB Role now)
    authUserId: string | null;
    loading: boolean;
    login: (email: string, password: string) => Promise<{ error: any }>;
    logout: () => Promise<void>;
};

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const [session, setSession] = useState<Session | null>(null);
    const [user, setUser] = useState<User | null>(null);
    const [role, setRole] = useState<string | null>(null);
    const [loading, setLoading] = useState(true);

    // Database-Driven Role Resolution
    const fetchUserRole = async (userId: string) => {
        try {
            const { data, error } = await supabase
                .from('iers_user_roles')
                .select('iers_roles(name)')
                .eq('user_id', userId)
                .single();

            if (error || !data) return 'NO_ROLE';
            // @ts-ignore
            return data.iers_roles?.name || 'NO_ROLE';
        } catch (e) {
            console.error(e);
            return 'NO_ROLE';
        }
    };

    const initializeAuth = async (session: Session | null) => {
        setLoading(true);
        setSession(session);
        const usr = session?.user ?? null;
        setUser(usr); // Set user immediately

        if (usr) {
            const dbRole = await fetchUserRole(usr.id);
            setRole(dbRole);
        } else {
            setRole(null);
        }
        setLoading(false);
    };

    useEffect(() => {
        // Initial Check
        supabase.auth.getSession().then(({ data: { session } }) => {
            initializeAuth(session);
        });

        // Subscription
        const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
            // Re-resolve on every auth change to stay fresh
            initializeAuth(session);
        });

        return () => subscription.unsubscribe();
    }, []);

    const login = async (email: string, password: string) => {
        const { error } = await supabase.auth.signInWithPassword({
            email,
            password,
        });
        return { error };
    };

    const logout = async () => {
        setRole(null);
        await supabase.auth.signOut();
    };

    return (
        <AuthContext.Provider value={{
            session,
            user,
            role,
            authRole: role,
            authUserId: user?.id ?? null,
            loading,
            login,
            logout
        }}>
            {!loading && children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => {
    const context = useContext(AuthContext);
    if (context === undefined) {
        throw new Error('useAuth must be used within an AuthProvider');
    }
    return context;
};
