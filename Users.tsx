import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Input } from "@/components/ui/input";
import { Users as UsersIcon, UserPlus, Shield, GraduationCap, User, Mail, Phone, Search, Filter } from "lucide-react";
import { useUsers } from "@/hooks/useUsers";
import { UserRoleDialog } from "@/components/users/UserRoleDialog";
import { useMemo, useState } from "react";

const getRoleBadge = (role: string) => {
  switch (role) {
    case "admin":
      return <Badge className="bg-destructive/20 text-destructive">Admin</Badge>;
    case "instructor":
      return <Badge className="bg-primary/20 text-primary">Instructor</Badge>;
    case "student":
      return <Badge variant="outline">Student</Badge>;
    default:
      return <Badge variant="outline">{role}</Badge>;
  }
};

const getInitials = (firstName?: string, lastName?: string) => {
  if (!firstName && !lastName) return "U";
  return `${firstName?.[0] || ""}${lastName?.[0] || ""}`.toUpperCase();
};

export default function Users() {
  const [searchTerm, setSearchTerm] = useState("");
  const { data: users, isLoading } = useUsers();

  const totalUsers = users?.length || 0;
  const instructorsCount = users?.filter(u => (u.role || "").toLowerCase() === "instructor").length || 0;
  const studentsCount = users?.filter(u => (u.role || "").toLowerCase() === "student").length || 0;
  const adminsCount = users?.filter(u => (u.role || "").toLowerCase() === "admin").length || 0;

  const stats = useMemo(() => ([
    {
      title: "Total Users",
      value: isLoading ? "…" : String(totalUsers),
      description: "Registered users",
      icon: UsersIcon
    },
    {
      title: "Instructors",
      value: isLoading ? "…" : String(instructorsCount),
      description: "Teaching staff",
      icon: GraduationCap
    },
    {
      title: "Students",
      value: isLoading ? "…" : String(studentsCount),
      description: "Enrolled students",
      icon: User
    },
    {
      title: "Administrators",
      value: isLoading ? "…" : String(adminsCount),
      description: "System admins",
      icon: Shield
    }
  ]), [isLoading, totalUsers, instructorsCount, studentsCount, adminsCount]);

  const filteredUsers = users?.filter(user => {
    const fullName = `${user.first_name || ""} ${user.last_name || ""}`.toLowerCase();
    return fullName.includes(searchTerm.toLowerCase()) ||
           user.role.toLowerCase().includes(searchTerm.toLowerCase());
  }) || [];

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Users</h1>
          <p className="text-muted-foreground">
            Manage system users and their permissions
          </p>
        </div>
        <div className="flex flex-col sm:flex-row gap-4 mt-4 sm:mt-0">
          <div className="relative flex-1">
            <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input 
              placeholder="Search users..." 
              className="pl-8" 
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <Button variant="outline">
            <Filter className="mr-2 h-4 w-4" />
            Filter
          </Button>
          <Button className="bg-gradient-primary shadow-elegant">
            <UserPlus className="mr-2 h-4 w-4" />
            Add User
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
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Users List */}
      <Card className="shadow-soft">
        <CardHeader>
          <CardTitle>All Users</CardTitle>
          <CardDescription>
            Manage user accounts and access permissions
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {filteredUsers.map((user) => (
              <div
                key={user.id}
                className="flex items-center justify-between p-4 border rounded-lg hover:bg-secondary/50 transition-smooth"
              >
                <div className="flex items-center space-x-4">
                  <Avatar className="h-10 w-10">
                    <AvatarFallback className="bg-primary/10 text-primary font-medium">
                      {getInitials(user.first_name, user.last_name)}
                    </AvatarFallback>
                  </Avatar>
                  
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <h4 className="text-sm font-medium">
                        {user.first_name || user.last_name ? 
                          `${user.first_name || ""} ${user.last_name || ""}`.trim() : 
                          "Unnamed User"
                        }
                      </h4>
                      {getRoleBadge(user.role)}
                    </div>
                    <div className="text-xs text-muted-foreground">
                      {user.phone && (
                        <div className="flex items-center">
                          <Phone className="mr-1 h-3 w-3" />
                          {user.phone}
                        </div>
                      )}
                    </div>
                    <div className="text-xs text-muted-foreground">
                      Joined {new Date(user.created_at).toLocaleDateString()}
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <UserRoleDialog user={user} />
                  <Button variant="outline" size="sm">
                    View Profile
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}