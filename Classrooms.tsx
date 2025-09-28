import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Building, Users, MapPin, Search, Plus, Filter, Settings, Wrench } from "lucide-react";
import { useClassrooms, useUpdateClassroom, useDeleteClassroom } from "@/hooks/useClassrooms";
import { CreateClassroomDialog } from "@/components/classrooms/CreateClassroomDialog";
import { useState } from "react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

const stats = [
  {
    title: "Total Classrooms",
    value: "24",
    description: "Across all buildings",
    icon: MapPin
  },
  {
    title: "Available Now",
    value: "18", 
    description: "Ready for booking",
    icon: Building
  },
  {
    title: "Total Capacity",
    value: "680",
    description: "Students",
    icon: Users
  },
  {
    title: "Utilization Rate",
    value: "75%",
    description: "This week", 
    icon: Filter
  }
];

const getStatusBadge = (status: string) => {
  switch (status) {
    case 'available':
      return <Badge className="bg-success/20 text-success">Available</Badge>;
    case 'occupied':
      return <Badge className="bg-warning/20 text-warning">Occupied</Badge>;
    case 'maintenance':
      return <Badge className="bg-destructive/20 text-destructive">Maintenance</Badge>;
    default:
      return <Badge variant="outline">{status}</Badge>;
  }
};

export default function Classrooms() {
  const [searchTerm, setSearchTerm] = useState("");
  const { data: classrooms, isLoading } = useClassrooms();
  const updateMutation = useUpdateClassroom();
  const deleteMutation = useDeleteClassroom();

  const filteredClassrooms = classrooms?.filter(classroom => 
    classroom.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    classroom.building.toLowerCase().includes(searchTerm.toLowerCase())
  ) || [];

  const handleStatusChange = async (id: string, newStatus: 'available' | 'occupied' | 'maintenance') => {
    await updateMutation.mutateAsync({ id, status: newStatus });
  };

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
          <h1 className="text-3xl font-bold tracking-tight">Classrooms</h1>
          <p className="text-muted-foreground">
            Manage classroom resources and monitor availability
          </p>
        </div>
        <div className="flex flex-col sm:flex-row gap-4 mt-4 sm:mt-0">
          <div className="relative flex-1">
            <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input 
              placeholder="Search classrooms..." 
              className="pl-8" 
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <Button variant="outline">
            <Filter className="mr-2 h-4 w-4" />
            Filter
          </Button>
          <CreateClassroomDialog />
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

      {/* Classrooms Grid */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {filteredClassrooms.map((classroom) => (
          <Card key={classroom.id} className="shadow-soft hover:shadow-elegant transition-smooth">
            <CardHeader>
              <div className="flex items-start justify-between">
                <div>
                  <CardTitle className="text-lg">{classroom.name}</CardTitle>
                  <CardDescription className="flex items-center mt-1">
                    <Building className="mr-1 h-4 w-4" />
                    {classroom.building} - Floor {classroom.floor}
                  </CardDescription>
                </div>
                {getStatusBadge(classroom.status)}
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <div className="flex items-center justify-between text-sm">
                  <span className="flex items-center text-muted-foreground">
                    <Users className="mr-1 h-4 w-4" />
                    Capacity
                  </span>
                  <span className="font-medium">{classroom.capacity} students</span>
                </div>

                <div className="space-y-2">
                  <span className="text-sm text-muted-foreground">Equipment:</span>
                  <div className="flex flex-wrap gap-1">
                    {classroom.equipment.map((item, index) => (
                      <Badge key={index} variant="outline" className="text-xs">
                        {item}
                      </Badge>
                    ))}
                  </div>
                </div>

                <div className="flex gap-2 pt-2">
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="outline" size="sm" className="flex-1">
                        <Wrench className="mr-1 h-4 w-4" />
                        Actions
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent>
                      <DropdownMenuItem onClick={() => handleStatusChange(classroom.id, 'available')}>
                        Set Available
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={() => handleStatusChange(classroom.id, 'occupied')}>
                        Set Occupied
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={() => handleStatusChange(classroom.id, 'maintenance')}>
                        Set Maintenance
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                  <Button variant="outline" size="sm">
                    <MapPin className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}