import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useRef,
  type Dispatch,
  type ReactNode,
  type SetStateAction,
} from 'react';

type CrmLayoutContextValue = {
  sidebarCollapsed: boolean;
  collapseSidebarForFilter: () => void;
  expandSidebar: () => void;
  toggleSidebar: () => void;
  registerCloseLeadsFilter: (close: () => void) => () => void;
};

const CrmLayoutContext = createContext<CrmLayoutContextValue | null>(null);

export function CrmLayoutProvider({
  sidebarCollapsed,
  setSidebarCollapsed,
  children,
}: {
  sidebarCollapsed: boolean;
  setSidebarCollapsed: Dispatch<SetStateAction<boolean>>;
  children: ReactNode;
}) {
  const closeLeadsFilterRef = useRef<(() => void) | null>(null);

  const registerCloseLeadsFilter = useCallback((close: () => void) => {
    closeLeadsFilterRef.current = close;
    return () => {
      if (closeLeadsFilterRef.current === close) closeLeadsFilterRef.current = null;
    };
  }, []);

  const collapseSidebarForFilter = useCallback(() => {
    setSidebarCollapsed(true);
  }, [setSidebarCollapsed]);

  const expandSidebar = useCallback(() => {
    closeLeadsFilterRef.current?.();
    setSidebarCollapsed(false);
  }, [setSidebarCollapsed]);

  const toggleSidebar = useCallback(() => {
    setSidebarCollapsed((collapsed) => {
      if (collapsed) {
        closeLeadsFilterRef.current?.();
        return false;
      }
      return true;
    });
  }, [setSidebarCollapsed]);

  const value = useMemo(
    () => ({
      sidebarCollapsed,
      collapseSidebarForFilter,
      expandSidebar,
      toggleSidebar,
      registerCloseLeadsFilter,
    }),
    [
      sidebarCollapsed,
      collapseSidebarForFilter,
      expandSidebar,
      toggleSidebar,
      registerCloseLeadsFilter,
    ],
  );

  return <CrmLayoutContext.Provider value={value}>{children}</CrmLayoutContext.Provider>;
}

export function useCrmLayout() {
  const ctx = useContext(CrmLayoutContext);
  if (!ctx) {
    throw new Error('useCrmLayout must be used within CrmLayoutProvider');
  }
  return ctx;
}
