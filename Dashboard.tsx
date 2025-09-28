import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Calendar, Users, BookOpen, Clock, Plus, TrendingUp } from "lucide-react";
import { useClasses } from "@/hooks/useClasses";
import { useUsers } from "@/hooks/useUsers";
import { useCourses } from "@/hooks/useCourses";
import { useMemo } from "react";
import { useCurrentUser } from "@/hooks/useUsers";

function formatDurationHours(start?: string, end?: string) {
  if (!start || !end) return 0;
  const s = new Date(start).getTime();
  const e = new Date(end).getTime();
  if (isNaN(s) || isNaN(e) || e <= s) return 0;
  return (e - s) / (1000 * 60 * 60);
}

export default function Dashboard() {
  const { data: classes = [], isLoading: classesLoading } = useClasses();
  const { data: users = [], isLoading: usersLoading } = useUsers();
  const { data: courses = [], isLoading: coursesLoading } = useCourses();
  const { data: currentProfile } = useCurrentUser();

  const today = new Date();
  const todayDow = today.getDay(); // 0 (Sun) - 6 (Sat)

  const avgClassDuration = useMemo(() => {
    if (!classes?.length) return 0;
    const durations = classes.map(c => formatDurationHours(c.start_time, c.end_time)).filter(d => d > 0);
    if (!durations.length) return 0;
    return durations.reduce((a, b) => a + b, 0) / durations.length;
  }, [classes]);

  const activeStudentsCount = useMemo(() => {
    if (!users?.length) return 0;
    const students = users.filter(u => (u.role || "").toLowerCase() === "student");
    return students.length || users.length; // fallback to total profiles if no explicit student role
  }, [users]);

  const isAdmin = (currentProfile?.role || '').toLowerCase() === 'admin';
  const stats = useMemo(() => ([
    {
      title: "Total Classes",
      value: classesLoading ? "…" : String(classes.length),
      description: "All scheduled",
      icon: Calendar,
      trend: "Updated now",
    },
    {
      title: isAdmin ? "Total Users" : "Active Students",
      value: usersLoading ? "…" : String(isAdmin ? users.length : activeStudentsCount),
      description: isAdmin ? "Profiles in system" : "From profiles",
      icon: Users,
      trend: "Updated now",
    },
    {
      title: "Courses",
      value: coursesLoading ? "…" : String(courses.length),
      description: "Active courses",
      icon: BookOpen,
      trend: "Updated now",
    },
    {
      title: "Avg Class Duration",
      value: classesLoading ? "…" : `${avgClassDuration.toFixed(1)}hrs`,
      description: "Per session",
      icon: Clock,
      trend: "Updated now",
    },
  ]), [classesLoading, usersLoading, coursesLoading, classes.length, courses.length, activeStudentsCount, avgClassDuration, isAdmin, users.length]);

  const upcomingToday = useMemo(() => {
    const now = new Date();
    const list = (classes || [])
      .filter(c => c.day_of_week === todayDow)
      .sort((a, b) => new Date(a.start_time).getTime() - new Date(b.start_time).getTime());
    // Only show classes whose start time is later than now (for today)
    const filtered = list.filter(c => new Date(c.start_time).getTime() >= now.getTime());
    return (filtered.length ? filtered : list).slice(0, 5);
  }, [classes, todayDow]);
  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Dashboard</h1>
          <p className="text-muted-foreground">
            Welcome back! Here's what's happening with your schedule today.
          </p>
        </div>
        <div className="mt-4 sm:mt-0">
          <Button className="bg-gradient-primary shadow-elegant">
            <Plus className="mr-2 h-4 w-4" />
            Add New Class
          </Button>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {stats.map((stat) => (
          <Card key={stat.title} className="shadow-soft hover:shadow-elegant transition-smooth">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">{stat.title}</CardTitle>
              <stat.icon className="h-4 w-4 text-primary" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stat.value}</div>
              <p className="text-xs text-muted-foreground">{stat.description}</p>
              <div className="flex items-center mt-2 text-xs text-success">
                <TrendingUp className="h-3 w-3 mr-1" />
                {stat.trend}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Main Content Grid */}
      <div className="grid gap-6 lg:grid-cols-3">
        {/* Upcoming Classes */}
        <div className="lg:col-span-2">
          <Card className="shadow-soft">
            <CardHeader>
              <CardTitle>Today's Schedule</CardTitle>
              <CardDescription>
                Your upcoming classes for today
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {classesLoading ? (
                  <div className="text-sm text-muted-foreground">Loading schedule…</div>
                ) : upcomingToday.length ? (
                  upcomingToday.map((c) => {
                    const start = new Date(c.start_time);
                    const end = new Date(c.end_time);
                    const time = `${start.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })} - ${end.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`;
                    const room = c.classrooms?.name || c.classroom_id || "TBD";
                    const students = typeof c.enrolled_students === 'number' ? c.enrolled_students : 0;
                    return (
                      <div
                        key={c.id}
                        className="flex items-center justify-between p-4 bg-secondary/50 rounded-lg border"
                      >
                        <div className="space-y-1">
                          <h4 className="text-sm font-medium">{c.title}</h4>
                          <div className="flex items-center text-xs text-muted-foreground">
                            <Clock className="mr-1 h-3 w-3" />
                            {time}
                            <span className="mx-2">•</span>
                            {room}
                          </div>
                        </div>
                        <div className="flex items-center text-sm text-muted-foreground">
                          <Users className="mr-1 h-4 w-4" />
                          {students}
                        </div>
                      </div>
                    );
                  })
                ) : (
                  <div className="text-sm text-muted-foreground">No classes scheduled for today.</div>
                )}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Quick Actions */}
        <div>
          <Card className="shadow-soft">
            <CardHeader>
              <CardTitle>Quick Actions</CardTitle>
              <CardDescription>
                Commonly used functions
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-2">
              <Button variant="outline" className="w-full justify-start">
                <Calendar className="mr-2 h-4 w-4" />
                View Full Timetable
              </Button>
              <Button variant="outline" className="w-full justify-start">
                <Users className="mr-2 h-4 w-4" />
                Manage Students
              </Button>
              <Button variant="outline" className="w-full justify-start">
                <BookOpen className="mr-2 h-4 w-4" />
                Add New Course
              </Button>
            </CardContent>
          </Card>

          {/* Recent Activity */}
          <Card className="mt-6 shadow-soft">
            <CardHeader>
              <CardTitle>Recent Activity</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <div className="text-sm">
                  <span className="font-medium">Mathematics</span> class scheduled for Room A-101
                  <div className="text-xs text-muted-foreground">2 hours ago</div>
                </div>
                <div className="text-sm">
                  <span className="font-medium">3 new students</span> enrolled in Computer Science
                  <div className="text-xs text-muted-foreground">4 hours ago</div>
                </div>
                <div className="text-sm">
                  <span className="font-medium">Lab B-205</span> maintenance scheduled
                  <div className="text-xs text-muted-foreground">Yesterday</div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}