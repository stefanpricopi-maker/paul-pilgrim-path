import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { AlertCircle } from "lucide-react";

// SECURITY NOTICE: Audit Trail Access Restricted
//
// The audit trail functionality has been restricted to service roles only
// for security reasons. The audit_log table contains sensitive information
// including IP addresses, user agents, and detailed system activity that
// should not be accessible to regular admin users.
//
// If you need to review audit logs, please contact your system administrator
// who can access this data through direct database queries with service role
// credentials.

export default function AuditTrail() {
  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <AlertCircle className="w-5 h-5 text-destructive" />
            Audit Trail - Access Restricted
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center min-h-[400px]">
            <div className="text-center space-y-4 max-w-md">
              <div className="w-16 h-16 mx-auto bg-destructive/10 rounded-full flex items-center justify-center">
                <span className="text-destructive text-2xl">🔒</span>
              </div>
              <h3 className="text-lg font-semibold">Access Restricted</h3>
              <p className="text-muted-foreground text-sm">
                Audit trail access has been restricted for security reasons. 
                This data contains sensitive information and is only accessible 
                to system administrators through service role credentials.
              </p>
              <p className="text-xs text-muted-foreground">
                Contact your system administrator if you need to review audit logs.
              </p>
              <div className="mt-6 p-4 bg-muted/50 rounded-lg text-left">
                <h4 className="text-sm font-medium mb-2">What changed?</h4>
                <ul className="text-xs text-muted-foreground space-y-1">
                  <li>• IP addresses and user agents are no longer visible to admins</li>
                  <li>• Detailed system activity logs require service role access</li>
                  <li>• Data retention policy of 90 days has been implemented</li>
                  <li>• This improves user privacy and system security</li>
                </ul>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}