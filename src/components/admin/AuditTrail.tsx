import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { 
  ScrollText, 
  Search, 
  Filter, 
  User, 
  Calendar, 
  AlertCircle,
  Loader2,
  Download,
  Eye
} from "lucide-react";
import { toast } from "sonner";

interface AuditLogEntry {
  id: number;
  user_id: string;
  action_type: string;
  action_category: string;
  target_type: string | null;
  target_id: string | null;
  description: string;
  details: any;
  ip_address: string | null;
  user_agent: string | null;
  created_at: string;
  user_profile?: {
    username: string;
  };
}

export default function AuditTrail() {
  const [logs, setLogs] = useState<AuditLogEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("all");
  const [dateFilter, setDateFilter] = useState("7"); // days
  const [page, setPage] = useState(0);
  const [hasMore, setHasMore] = useState(true);

  const PAGE_SIZE = 50;

  useEffect(() => {
    fetchAuditLogs(true);
  }, [categoryFilter, dateFilter]);

  useEffect(() => {
    const delayedSearch = setTimeout(() => {
      if (searchTerm || searchTerm === "") {
        fetchAuditLogs(true);
      }
    }, 300);

    return () => clearTimeout(delayedSearch);
  }, [searchTerm]);

  const fetchAuditLogs = async (reset = false) => {
    try {
      setLoading(true);
      
      const currentPage = reset ? 0 : page;
      const from = currentPage * PAGE_SIZE;
      const to = from + PAGE_SIZE - 1;

      let query = supabase
        .from("audit_log")
        .select(`
          *,
          user_profile:profiles(username)
        `)
        .order("created_at", { ascending: false })
        .range(from, to);

      // Apply filters
      if (categoryFilter !== "all") {
        query = query.eq("action_category", categoryFilter);
      }

      if (dateFilter !== "all") {
        const daysAgo = new Date();
        daysAgo.setDate(daysAgo.getDate() - parseInt(dateFilter));
        query = query.gte("created_at", daysAgo.toISOString());
      }

      if (searchTerm) {
        query = query.or(`description.ilike.%${searchTerm}%,action_type.ilike.%${searchTerm}%`);
      }

      const { data, error } = await query;

      if (error) throw error;

      if (reset) {
        setLogs(data || []);
        setPage(1);
      } else {
        setLogs(prev => [...prev, ...(data || [])]);
        setPage(prev => prev + 1);
      }

      setHasMore((data || []).length === PAGE_SIZE);
    } catch (error) {
      console.error("Error fetching audit logs:", error);
      toast.error("Failed to fetch audit logs");
    } finally {
      setLoading(false);
    }
  };

  const getCategoryColor = (category: string) => {
    switch (category) {
      case "admin": return "bg-red-500";
      case "player": return "bg-blue-500";
      case "system": return "bg-green-500";
      case "game": return "bg-purple-500";
      default: return "bg-gray-500";
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleString();
  };

  const exportLogs = async () => {
    try {
      // For demo purposes - in a real app, you'd want to implement server-side export
      toast.info("Export functionality would be implemented here");
    } catch (error) {
      toast.error("Failed to export logs");
    }
  };

  if (loading && logs.length === 0) {
    return (
      <div className="flex justify-center items-center min-h-[400px]">
        <div className="text-center space-y-4">
          <Loader2 className="w-8 h-8 animate-spin text-primary mx-auto" />
          <p className="text-muted-foreground">Loading audit trail...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <ScrollText className="w-5 h-5" />
            Audit Trail
          </CardTitle>
        </CardHeader>
        <CardContent>
          {/* Filters */}
          <div className="flex flex-wrap gap-4 mb-6">
            <div className="flex-1 min-w-[200px]">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
                <Input
                  placeholder="Search actions..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-9"
                />
              </div>
            </div>
            
            <Select value={categoryFilter} onValueChange={setCategoryFilter}>
              <SelectTrigger className="w-[150px]">
                <SelectValue placeholder="Category" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Categories</SelectItem>
                <SelectItem value="admin">Admin Actions</SelectItem>
                <SelectItem value="player">Player Actions</SelectItem>
                <SelectItem value="system">System Events</SelectItem>
                <SelectItem value="game">Game Events</SelectItem>
              </SelectContent>
            </Select>

            <Select value={dateFilter} onValueChange={setDateFilter}>
              <SelectTrigger className="w-[120px]">
                <SelectValue placeholder="Time" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="1">Last Day</SelectItem>
                <SelectItem value="7">Last Week</SelectItem>
                <SelectItem value="30">Last Month</SelectItem>
                <SelectItem value="90">Last 3 Months</SelectItem>
                <SelectItem value="all">All Time</SelectItem>
              </SelectContent>
            </Select>

            <Button onClick={exportLogs} variant="outline" size="sm">
              <Download className="w-4 h-4 mr-1" />
              Export
            </Button>
          </div>

          {/* Audit Log Entries */}
          <div className="space-y-3">
            {logs.length === 0 ? (
              <div className="text-center py-12">
                <AlertCircle className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                <h3 className="text-lg font-semibold mb-2">No Audit Logs Found</h3>
                <p className="text-muted-foreground">No activities match your current filters.</p>
              </div>
            ) : (
              <>
                {logs.map((log) => (
                  <Card key={log.id} className="p-4 hover:bg-accent/50 transition-colors">
                    <div className="flex items-start justify-between">
                      <div className="flex-1 space-y-2">
                        <div className="flex items-center gap-2 flex-wrap">
                          <Badge className={getCategoryColor(log.action_category)}>
                            {log.action_category.toUpperCase()}
                          </Badge>
                          <span className="font-medium">{log.action_type}</span>
                          {log.target_type && (
                            <Badge variant="outline" className="text-xs">
                              {log.target_type}
                            </Badge>
                          )}
                        </div>
                        
                        <p className="text-sm text-muted-foreground">
                          {log.description}
                        </p>
                        
                        <div className="flex items-center gap-4 text-xs text-muted-foreground">
                          <span className="flex items-center gap-1">
                            <User className="w-3 h-3" />
                            {log.user_profile?.username || 'System'}
                          </span>
                          <span className="flex items-center gap-1">
                            <Calendar className="w-3 h-3" />
                            {formatDate(log.created_at)}
                          </span>
                          {log.target_id && (
                            <span>ID: {log.target_id.slice(0, 8)}...</span>
                          )}
                        </div>
                      </div>
                      
                      {log.details && (
                        <Button 
                          variant="ghost" 
                          size="sm"
                          onClick={() => {
                            toast.info("Details: " + JSON.stringify(log.details, null, 2));
                          }}
                        >
                          <Eye className="w-4 h-4" />
                        </Button>
                      )}
                    </div>
                  </Card>
                ))}

                {hasMore && (
                  <div className="text-center pt-4">
                    <Button 
                      onClick={() => fetchAuditLogs(false)}
                      variant="outline"
                      disabled={loading}
                    >
                      {loading ? (
                        <Loader2 className="w-4 h-4 animate-spin mr-2" />
                      ) : null}
                      Load More
                    </Button>
                  </div>
                )}
              </>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}