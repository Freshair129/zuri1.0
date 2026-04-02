'use client';

import { createContext, useContext, useState, useEffect } from 'react';

const TenantContext = createContext({
  tenant: null,
  loading: true,
  error: null,
});

export function TenantProvider({ children }) {
  const [tenant, setTenant] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    async function fetchConfig() {
      try {
        const res = await fetch('/api/tenant/config');
        const json = await res.json();
        if (json.data) {
          setTenant(json.data);
        } else {
          setError(json.error || 'Failed to load tenant config');
        }
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    }
    fetchConfig();
  }, []);

  return (
    <TenantContext.Provider value={{ tenant, loading, error }}>
      {children}
    </TenantContext.Provider>
  );
}

export const useTenant = () => useContext(TenantContext);
