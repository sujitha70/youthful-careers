import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Loader2, Search, Users, Briefcase, FileText, TrendingUp } from "lucide-react";
import { formatDistanceToNow } from "date-fns";

interface FresherStats {
  user_id: string;
  full_name: string;
  email: string;
  application_count: number;
  last_applied_at: string | null;
}

const FresherApplicationsTab = () => {
  const [loading, setLoading] = useState(true);
  const [freshers, setFreshers] = useState<FresherStats[]>([]);
  const [totalApplications, setTotalApplications] = useState(0);
  const [totalFreshers, setTotalFreshers] = useState(0);
  const [activeAppliers, setActiveAppliers] = useState(0);
  const [searchQuery, setSearchQuery] = useState("");

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      // Get all freshers
      const { data: fresherRoles, error: rolesError } = await supabase
        .from("user_roles")
        .select("user_id")
        .eq("role", "fresher");

      if (rolesError) throw rolesError;

      const fresherIds = (fresherRoles || []).map((r) => r.user_id);
      setTotalFreshers(fresherIds.length);

      if (fresherIds.length === 0) {
        setLoading(false);
        return;
      }

      // Get profiles for those freshers
      const { data: profiles, error: profilesError } = await supabase
        .from("profiles")
        .select("user_id, full_name, email")
        .in("user_id", fresherIds);

      if (profilesError) throw profilesError;

      // Get all applications by freshers
      const { data: applications, error: appsError } = await supabase
        .from("applications")
        .select("user_id, applied_at")
        .in("user_id", fresherIds);

      if (appsError) throw appsError;

      setTotalApplications(applications?.length || 0);

      // Aggregate per fresher
      const statsMap = new Map<string, { count: number; last: string | null }>();
      (applications || []).forEach((app) => {
        const existing = statsMap.get(app.user_id) || { count: 0, last: null };
        existing.count += 1;
        if (!existing.last || new Date(app.applied_at) > new Date(existing.last)) {
          existing.last = app.applied_at;
        }
        statsMap.set(app.user_id, existing);
      });

      setActiveAppliers(statsMap.size);

      const stats: FresherStats[] = (profiles || []).map((p) => ({
        user_id: p.user_id,
        full_name: p.full_name,
        email: p.email,
        application_count: statsMap.get(p.user_id)?.count || 0,
        last_applied_at: statsMap.get(p.user_id)?.last || null,
      }));

      stats.sort((a, b) => b.application_count - a.application_count);
      setFreshers(stats);
    } catch (error) {
      console.error("Error fetching fresher applications:", error);
    } finally {
      setLoading(false);
    }
  };

  const filtered = freshers.filter(
    (f) =>
      f.full_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      f.email.toLowerCase().includes(searchQuery.toLowerCase())
  );

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="w-6 h-6 animate-spin text-primary" />
      </div>
    );
  }

  const avgPerFresher =
    totalFreshers > 0 ? (totalApplications / totalFreshers).toFixed(1) : "0";

  return (
    <div className="space-y-4">
      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Total Freshers</CardTitle>
            <Users className="w-4 h-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalFreshers}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Total Applications</CardTitle>
            <FileText className="w-4 h-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalApplications}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Active Appliers</CardTitle>
            <Briefcase className="w-4 h-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{activeAppliers}</div>
            <p className="text-xs text-muted-foreground">Freshers who applied at least once</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Avg / Fresher</CardTitle>
            <TrendingUp className="w-4 h-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{avgPerFresher}</div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Applications by Fresher</CardTitle>
          <CardDescription>
            Number of jobs each fresher has applied to, sorted by most active
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="relative mb-4">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input
              placeholder="Search by name or email..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
          </div>

          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Fresher</TableHead>
                  <TableHead>Email</TableHead>
                  <TableHead className="text-center">Jobs Applied</TableHead>
                  <TableHead>Last Applied</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filtered.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={4} className="text-center py-8 text-muted-foreground">
                      No freshers found
                    </TableCell>
                  </TableRow>
                ) : (
                  filtered.map((f) => (
                    <TableRow key={f.user_id}>
                      <TableCell className="font-medium">{f.full_name || "—"}</TableCell>
                      <TableCell className="text-muted-foreground">{f.email}</TableCell>
                      <TableCell className="text-center">
                        <Badge variant={f.application_count > 0 ? "default" : "secondary"}>
                          {f.application_count}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-muted-foreground">
                        {f.last_applied_at
                          ? formatDistanceToNow(new Date(f.last_applied_at), { addSuffix: true })
                          : "Never"}
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default FresherApplicationsTab;
