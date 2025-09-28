import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { BookOpen, Users, Clock, Calendar, Plus, GraduationCap, User } from "lucide-react";
import { useCourses } from "@/hooks/useCourses";
import { CreateCourseDialog } from "@/components/courses/CreateCourseDialog";

const baseStats = [
  {
    title: "Total Students",
    value: "342",
    description: "Enrolled students",
    icon: Users
  },
  {
    title: "Faculty",
    value: "18",
    description: "Teaching faculty",
    icon: GraduationCap
  },
  {
    title: "Avg Class Size",
    value: "23",
    description: "Students per class",
    icon: User
  }
];

const getStatusBadge = (status: string) => {
  switch (status) {
    case "active":
      return <Badge variant="secondary" className="bg-success/10 text-success">Active</Badge>;
    case "draft":
      return <Badge variant="outline" className="border-warning text-warning">Draft</Badge>;
    case "completed":
      return <Badge variant="outline">Completed</Badge>;
    default:
      return <Badge variant="outline">{status}</Badge>;
  }
};

const getDepartmentColor = (department: string) => {
  const colors: { [key: string]: string } = {
    "Mathematics": "bg-blue-100 text-blue-800",
    "Computer Science": "bg-green-100 text-green-800",
    "Physics": "bg-purple-100 text-purple-800",
    "English": "bg-orange-100 text-orange-800",
    "Chemistry": "bg-pink-100 text-pink-800",
    "Biology": "bg-teal-100 text-teal-800"
  };
  return colors[department] || "bg-gray-100 text-gray-800";
};

export default function Courses() {
  const { data: courses = [], isLoading, error } = useCourses();

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center py-12">
        <p className="text-muted-foreground">Error loading courses. Please try again.</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Courses</h1>
          <p className="text-muted-foreground">
            Manage academic courses and track enrollment
          </p>
        </div>
        <div className="mt-4 sm:mt-0">
          <CreateCourseDialog />
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {[{ title: "Active Courses", value: String(courses.length), description: "This semester", icon: BookOpen }, ...baseStats].map((stat) => (
          <Card key={stat.title} className="shadow-soft hover:shadow-elegant transition-smooth">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">{stat.title}</CardTitle>
              <stat.icon className="h-4 w-4 text-primary" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stat.value}</div>
              <p className="text-xs text-muted-foreground">{stat.description}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Courses Grid */}
      <div className="grid gap-6 lg:grid-cols-2">
        {courses.length === 0 ? (
          <div className="col-span-2 text-center py-12">
            <BookOpen className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
            <h3 className="text-lg font-medium mb-2">No courses yet</h3>
            <p className="text-muted-foreground mb-4">Get started by creating your first course.</p>
            <CreateCourseDialog />
          </div>
        ) : (
          courses.map((course) => (
            <Card key={course.id} className="shadow-soft hover:shadow-elegant transition-smooth">
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div className="space-y-1">
                    <CardTitle className="text-lg">{course.title}</CardTitle>
                    <div className="flex items-center gap-2">
                      <Badge variant="outline" className="text-xs">{course.id.slice(0, 8)}</Badge>
                      <Badge className={`text-xs ${getDepartmentColor(course.department)}`}>
                        {course.department}
                      </Badge>
                    </div>
                  </div>
                  {getStatusBadge(course.status)}
                </div>
                <CardDescription className="line-clamp-2">
                  {course.description}
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div className="flex items-center">
                    <GraduationCap className="mr-2 h-4 w-4 text-muted-foreground" />
                    <span>{course.instructor}</span>
                  </div>
                  <div className="flex items-center">
                    <Users className="mr-2 h-4 w-4 text-muted-foreground" />
                    <span>{course.students}/{course.maxStudents} students</span>
                  </div>
                  <div className="flex items-center">
                    <Clock className="mr-2 h-4 w-4 text-muted-foreground" />
                    <span>{course.credits} credits</span>
                  </div>
                  <div className="flex items-center">
                    <Calendar className="mr-2 h-4 w-4 text-muted-foreground" />
                    <span>{course.duration}</span>
                  </div>
                </div>

                {course.schedule !== "TBD" && (
                  <div className="p-3 bg-secondary/50 rounded-lg">
                    <p className="text-sm font-medium">Schedule</p>
                    <p className="text-xs text-muted-foreground">{course.schedule}</p>
                    <p className="text-xs text-muted-foreground">Room: {course.room}</p>
                  </div>
                )}

                <div className="flex items-center justify-between">
                  <div className="text-xs text-muted-foreground">
                    {course.semester}
                  </div>
                  <div className="flex gap-2">
                    <Button variant="outline" size="sm">
                      View Details
                    </Button>
                    <Button variant="outline" size="sm">
                      Manage
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>
    </div>
  );
}