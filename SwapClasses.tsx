import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useClasses, useUpdateClass } from "@/hooks/useClasses";
import { useToast } from "@/hooks/use-toast";

export default function SwapClasses() {
  const { data: classes = [], isLoading, error } = useClasses();
  const updateClass = useUpdateClass();
  const { toast } = useToast();
  const [a, setA] = useState<string>("");
  const [b, setB] = useState<string>("");
  const [submitting, setSubmitting] = useState(false);

  const classOptions = classes.map(c => ({ id: c.id, label: `${c.title} (${new Date(c.start_time).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })})` }));

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

  const handleSwap = async () => {
    const classA = classes.find(c => c.id === a);
    const classB = classes.find(c => c.id === b);
    if (!classA || !classB) return;

    // Prepare swapped values
    const aUpdates = {
      start_time: classB.start_time,
      end_time: classB.end_time,
      classroom_id: classB.classroom_id,
      day_of_week: classB.day_of_week,
    } as const;
    const bUpdates = {
      start_time: classA.start_time,
      end_time: classA.end_time,
      classroom_id: classA.classroom_id,
      day_of_week: classA.day_of_week,
    } as const;

    setSubmitting(true);
    try {
      // Update A -> then B; if B fails, rollback A
      await updateClass.mutateAsync({ id: classA.id, ...aUpdates });
      try {
        await updateClass.mutateAsync({ id: classB.id, ...bUpdates });
      } catch (err: any) {
        // rollback A
        try {
          await updateClass.mutateAsync({ id: classA.id, ...bUpdates });
        } catch {}
        throw err;
      }
      toast({ title: "Swap completed", description: "The two classes have swapped their schedule." });
    } catch (err: any) {
      const message = err?.message || "Failed to swap classes";
      toast({ variant: "destructive", title: "Swap failed", description: message });
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Swap Classes</h1>
          <p className="text-muted-foreground">Swap time slots or rooms between two classes</p>
        </div>
      </div>

      <Card className="shadow-soft">
        <CardHeader>
          <CardTitle>Select Classes to Swap</CardTitle>
          <CardDescription>Choose two classes to swap time/room</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm mb-2">Class A</label>
              <Select value={a} onValueChange={setA}>
                <SelectTrigger>
                  <SelectValue placeholder="Select class A" />
                </SelectTrigger>
                <SelectContent>
                  {classOptions.map(opt => (
                    <SelectItem key={opt.id} value={opt.id}>{opt.label}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <label className="block text-sm mb-2">Class B</label>
              <Select value={b} onValueChange={setB}>
                <SelectTrigger>
                  <SelectValue placeholder="Select class B" />
                </SelectTrigger>
                <SelectContent>
                  {classOptions.map(opt => (
                    <SelectItem key={opt.id} value={opt.id}>{opt.label}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
          <div className="mt-4">
            <Button className="bg-gradient-primary" disabled={!a || !b || a === b || submitting} onClick={handleSwap}>
              {submitting ? "Swapping…" : "Swap"}
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
