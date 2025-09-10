import { useEffect } from "react";
import { useAuditLog } from "./useAuditLog";
import { useAuth } from "./useAuth";

export function useAdminAccess(sectionName: string) {
  const { logAdminAction } = useAuditLog();
  const { user } = useAuth();

  useEffect(() => {
    if (user) {
      // Log admin panel access
      logAdminAction(
        "access_admin_section",
        `Accessed admin section: ${sectionName}`,
        "admin_panel",
        sectionName
      );
    }
  }, [sectionName, user, logAdminAction]);

  return null;
}