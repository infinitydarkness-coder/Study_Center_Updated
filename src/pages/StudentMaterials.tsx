import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import DashboardLayout from "@/components/DashboardLayout";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Download, FileText } from "lucide-react";

interface UploadItem {
  id: string;
  title: string;
  subject: string;
  file_url: string;
  created_at: string;
}

const StudentMaterials = () => {
  const [materials, setMaterials] = useState<UploadItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    supabase
      .from("uploads")
      .select("id, title, subject, file_url, created_at")
      .eq("status", "approved")
      .order("created_at", { ascending: false })
      .then(({ data }) => {
        setMaterials(data || []);
        setLoading(false);
      });
  }, []);

  return (
    <DashboardLayout>
      <div className="mb-8">
        <h1 className="font-display text-3xl font-bold text-foreground">Study Materials</h1>
        <p className="mt-1 text-muted-foreground">Browse and download approved study resources</p>
      </div>

      {loading ? (
        <div className="flex justify-center py-12">
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
        </div>
      ) : materials.length === 0 ? (
        <Card className="shadow-card">
          <CardContent className="flex flex-col items-center py-12 text-center">
            <FileText className="mb-4 h-12 w-12 text-muted-foreground/40" />
            <p className="text-lg font-medium text-muted-foreground">No materials available yet</p>
            <p className="text-sm text-muted-foreground/70">Check back later for approved study resources</p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {materials.map((m) => (
            <Card key={m.id} className="shadow-card transition-shadow hover:shadow-card-hover">
              <CardContent className="p-5">
                <div className="mb-3 flex items-start justify-between">
                  <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
                    <FileText className="h-5 w-5 text-primary" />
                  </div>
                </div>
                <h3 className="mb-1 font-display font-semibold text-foreground">{m.title}</h3>
                <p className="mb-1 text-sm text-muted-foreground">{m.subject}</p>
                <p className="mb-4 text-xs text-muted-foreground/60">
                  {new Date(m.created_at).toLocaleDateString()}
                </p>
                <Button variant="outline" size="sm" className="w-full" asChild>
                  <a href={m.file_url} target="_blank" rel="noopener noreferrer">
                    <Download className="mr-2 h-4 w-4" />
                    Download
                  </a>
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </DashboardLayout>
  );
};

export default StudentMaterials;
