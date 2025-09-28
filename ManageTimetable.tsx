import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useClasses } from "@/hooks/useClasses";
import { CreateClassDialog } from "@/components/classes/CreateClassDialog";
import { Clock, MapPin } from "lucide-react";

export default function ManageTimetable() {
  const { data: classes = [], isLoading, error } = useClasses();

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center py-12">
        <p className="text-muted-foreground">Error loading classes. Please try again.</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Manage Timetable</h1>
          <p className="text-muted-foreground">Create and manage scheduled classes</p>
        </div>
        <div className="mt-4 sm:mt-0">
          <CreateClassDialog />
        </div>
      </div>

      <Card className="shadow-soft">
        <CardHeader>
          <CardTitle>All Classes</CardTitle>
          <CardDescription>View and manage scheduled classes</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {classes.length === 0 ? (
              <div className="text-sm text-muted-foreground">No classes scheduled yet. Create your first class.</div>
            ) : (
              classes.map((c) => {
                const start = new Date(c.start_time);
                const end = new Date(c.end_time);
                const time = `${start.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })} - ${end.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`;
                const room = c.classrooms?.name || c.classroom_id || "TBD";
                return (
                  <div key={c.id} className="flex items-center justify-between p-4 border rounded-lg">
                    <div className="space-y-1">
                      <div className="text-sm font-medium">{c.title}</div>
                      <div className="flex items-center gap-3 text-xs text-muted-foreground">
                        <span className="flex items-center"><Clock className="h-3 w-3 mr-1" />{time}</span>
                        <span className="flex items-center"><MapPin className="h-3 w-3 mr-1" />{room}</span>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Button variant="outline" size="sm">Edit</Button>
                      <Button variant="outline" size="sm">Cancel</Button>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
