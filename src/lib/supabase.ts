import { createClient } from '@supabase/supabase-js';

// Guarded init, if VITE_SUPABASE_URL or VITE_SUPABASE_ANON_KEY are
// missing (e.g. dev server started without .env.local populated), we
// used to throw synchronously here, which nuked the entire app before
// React could render even a loading screen. Marc hit this 24 Apr 2026.
// Now we log a warning, return a stub client that fails all calls
// gracefully, and let AuthProvider's 5-second safety-net timer fall
// through to an anonymous boot.
const url = import.meta.env.VITE_SUPABASE_URL as string | undefined;
const key = import.meta.env.VITE_SUPABASE_ANON_KEY as string | undefined;

function makeStub() {
  // eslint-disable-next-line no-console
  console.warn(
    '[supabase] Missing VITE_SUPABASE_URL or VITE_SUPABASE_ANON_KEY. ' +
    'Running in local-only mode (no auth, no cloud sync). ' +
    'Add them to .env.local to restore full functionality.'
  );
  const rejected = () =>
    Promise.resolve({ data: null, error: new Error('supabase-not-configured') });
  const authStub = {
    getSession: () => Promise.resolve({ data: { session: null }, error: null }),
    onAuthStateChange: () => ({ data: { subscription: { unsubscribe() {} } } }),
    signInWithPassword: rejected,
    signUp: rejected,
    signInWithOAuth: rejected,
    signInWithOtp: rejected,
    signOut: () => Promise.resolve({ error: null }),
  };
  const queryStub = {
    select: () => queryStub,
    eq: () => queryStub,
    single: () => Promise.resolve({ data: null, error: new Error('supabase-not-configured') }),
    upsert: () => Promise.resolve({ data: null, error: new Error('supabase-not-configured') }),
  };
  return {
    auth: authStub,
    from: () => queryStub,
    rpc: rejected,
  };
}

export const supabase = (url && key)
  ? createClient(url, key)
  : (makeStub() as unknown as ReturnType<typeof createClient>);
