import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

export interface AuditLogData {
  actionType: string;
  actionCategory: 'admin' | 'player' | 'system' | 'game';
  targetType?: string;
  targetId?: string;
  description: string;
  details?: Record<string, any>;
}

export function useAuditLog() {
  const logAction = async (data: AuditLogData) => {
    try {
      const { error } = await supabase.rpc('log_audit_event', {
        p_action_type: data.actionType,
        p_action_category: data.actionCategory,
        p_target_type: data.targetType || null,
        p_target_id: data.targetId || null,
        p_description: data.description,
        p_details: data.details || null
      });

      if (error) {
        console.error("Failed to log audit event:", error);
        // Don't show error to user for audit logging failures
        // as it shouldn't interrupt the main action
      }
    } catch (error) {
      console.error("Error logging audit event:", error);
    }
  };

  // Helper methods for common audit events
  const logAdminAction = async (actionType: string, description: string, targetType?: string, targetId?: string, details?: Record<string, any>) => {
    try {
      // Check rate limit before performing admin action
      const { data: rateLimitOk, error: rateLimitError } = await supabase.rpc('check_admin_rate_limit');
      
      if (rateLimitError) {
        console.error("Rate limit check failed:", rateLimitError);
        toast.error("Admin action rate limit check failed");
        return false;
      }
      
      if (!rateLimitOk) {
        toast.error("Admin action rate limit exceeded. Please wait before trying again.");
        return false;
      }

      await logAction({
        actionType,
        actionCategory: 'admin',
        targetType,
        targetId,
        description,
        details
      });
      
      return true;
    } catch (error) {
      console.error("Admin action logging failed:", error);
      toast.error("Admin action could not be logged");
      return false;
    }
  };

  const logGameAction = (actionType: string, description: string, gameId?: string, details?: Record<string, any>) => {
    return logAction({
      actionType,
      actionCategory: 'game',
      targetType: 'game',
      targetId: gameId,
      description,
      details
    });
  };

  const logPlayerAction = (actionType: string, description: string, playerId?: string, details?: Record<string, any>) => {
    return logAction({
      actionType,
      actionCategory: 'player',
      targetType: 'player',
      targetId: playerId,
      description,
      details
    });
  };

  const logSystemEvent = (actionType: string, description: string, details?: Record<string, any>) => {
    return logAction({
      actionType,
      actionCategory: 'system',
      description,
      details
    });
  };

  return {
    logAction,
    logAdminAction,
    logGameAction,
    logPlayerAction,
    logSystemEvent
  };
}