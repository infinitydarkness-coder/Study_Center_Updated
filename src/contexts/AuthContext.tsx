import { createContext, useContext, useEffect, useState, ReactNode } from "react";
import { Session, User } from "@supabase/supabase-js";
import { supabase } from "@/integrations/supabase/client";

interface Profile {
  id: string;
  name: string;
  role: string;
  course: string | null;
  created_at: string;
}

interface AuthContextType {
  session: Session | null;
  user: User | null;
  profile: Profile | null;
  loading: boolean;
  signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType>({
  session: null,
  user: null,
  profile: null,
  loading: true,
  signOut: async () => {},
});

export const useAuth = () => useContext(AuthContext);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [session, setSession] = useState<Session | null>(null);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);

  const getProfilePayloadFromUser = (user: User) => ({
    id: user.id,
    name: (user.user_metadata?.name as string | undefined)?.trim() || user.email?.split("@")[0] || "Student",
    role: (user.user_metadata?.role as string | undefined) === "admin" ? "admin" : "student",
    course: (user.user_metadata?.course as string | undefined) || null,
  });

  const fetchOrCreateProfile = async (user: User) => {
    const { data, error } = await supabase
      .from("profiles")
      .select("*")
      .eq("id", user.id)
      .maybeSingle();

    if (error) {
      console.error("Failed to fetch profile:", error);
      setProfile(null);
      return;
    }

    if (data) {
      setProfile(data);
      return;
    }

    const payload = getProfilePayloadFromUser(user);
    const { data: inserted, error: insertError } = await supabase
      .from("profiles")
      .insert(payload)
      .select("*")
      .single();

    if (insertError) {
      console.error("Failed to create profile:", insertError);
      setProfile(null);
      return;
    }

    setProfile(inserted);
  };

  useEffect(() => {
    let initialized = false;

    const handleAuthSession = async (nextSession: Session | null) => {
      setSession(nextSession);

      if (!nextSession?.user) {
        setProfile(null);
        setLoading(false);
        return;
      }

      await fetchOrCreateProfile(nextSession.user);
      setLoading(false);
    };

    supabase.auth.getSession().then(async ({ data: { session: currentSession } }) => {
      initialized = true;
      await handleAuthSession(currentSession);
    });

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(async (_event, nextSession) => {
      if (!initialized) return; // skip duplicate on init
      await handleAuthSession(nextSession);
    });

    return () => subscription.unsubscribe();
  }, []);

  const signOut = async () => {
    await supabase.auth.signOut();
    setSession(null);
    setProfile(null);
  };

  return (
    <AuthContext.Provider
      value={{
        session,
        user: session?.user ?? null,
        profile,
        loading,
        signOut,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};
