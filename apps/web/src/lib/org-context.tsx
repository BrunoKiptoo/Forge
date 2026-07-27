"use client";

import {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
  type ReactNode,
} from "react";
import { apiFetch } from "./api";

export interface OrgInfo {
  _id: string;
  name: string;
  slug: string;
  ownerId?: string;
}

interface OrgState {
  organizations: OrgInfo[];
  activeOrg: OrgInfo | null;
  isLoading: boolean;
  switchOrg: (org: OrgInfo) => void;
  refreshOrgs: () => Promise<void>;
}

const OrgContext = createContext<OrgState | undefined>(undefined);

export function OrgProvider({ children }: { children: ReactNode }) {
  const [organizations, setOrganizations] = useState<OrgInfo[]>([]);
  const [activeOrg, setActiveOrg] = useState<OrgInfo | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const refreshOrgs = useCallback(async () => {
    try {
      const data = await apiFetch<{ data: { organizationId: OrgInfo }[] }>(
        "/organizations",
      );
      const orgs = data.data.map(
        (m: { organizationId: OrgInfo }) => m.organizationId,
      );
      setOrganizations(orgs);
      if (orgs.length > 0 && !activeOrg) {
        setActiveOrg(orgs[0]!);
      }
    } catch {
      // User may not be authenticated yet
    } finally {
      setIsLoading(false);
    }
  }, [activeOrg]);

  useEffect(() => {
    refreshOrgs();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const switchOrg = useCallback((org: OrgInfo) => {
    setActiveOrg(org);
  }, []);

  return (
    <OrgContext.Provider
      value={{ organizations, activeOrg, isLoading, switchOrg, refreshOrgs }}
    >
      {children}
    </OrgContext.Provider>
  );
}

export function useOrg() {
  const ctx = useContext(OrgContext);
  if (!ctx) {
    throw new Error("useOrg must be used within OrgProvider");
  }
  return ctx;
}
