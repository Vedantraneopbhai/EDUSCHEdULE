import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Calendar, Clock, MapPin, Users, Plus, Filter } from "lucide-react";
import { useClasses } from "@/hooks/useClasses";
import { CreateClassDialog } from "@/components/classes/CreateClassDialog";
import { useState } from "react";

const timeSlots = [
  "08:00", "09:00", "10:00", "11:00", "12:00", "13:00", "14:00", "15:00", "16:00", "17:00"
];

const days = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday"];

// Sample items for UI preview; real data will come from backend integration
const classes = [
  {
    id: 1,
    subject: "Advanced Mathematics",
    room: "A-101",
    time: "09:00-10:30",
    day: "Monday",
    instructor: "Dr. Smith",
    students: 28,
    color: "bg-primary"
  },
  {
    id: 2,
    subject: "Computer Science",
    room: "B-205",
    time: "11:00-12:30",
    day: "Monday",
    instructor: "Prof. Johnson",
    students: 24,
    color: "bg-accent"
  },
  {
    id: 3,
    subject: "Physics Lab",
    room: "C-301",
    time: "14:00-16:00",
    day: "Tuesday",
    instructor: "Dr. Brown",
    students: 18,
    color: "bg-secondary"
  },
  {
    id: 4,
    subject: "Literature",
    room: "A-203",
    time: "10:00-11:30",
    day: "Wednesday",
    instructor: "Prof. Davis",
    students: 32,
    color: "bg-primary"
  },
  {
    id: 5,
    subject: "Chemistry",
    room: "C-102",
    time: "13:00-14:30",
    day: "Thursday",
    instructor: "Dr. Wilson",
    students: 26,
    color: "bg-accent"
  }
];

export default function Timetable() {
  // Map background token to readable foreground token
  const getTextForBg = (bg: string) => {
    switch (bg) {
      case "bg-primary":
        return "text-primary-foreground";
      case "bg-secondary":
        return "text-secondary-foreground";
      case "bg-accent":
        return "text-accent-foreground";
      default:
        return "text-foreground";
    }
  };

  const getClassForSlot = (day: string, time: string) => {
    return classes.find(cls => 
      cls.day === day && cls.time.startsWith(time.substring(0, 2))
    );
  };

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Timetable</h1>
          <p className="text-muted-foreground">
            Manage your weekly class schedule
          </p>
        </div>
        <div className="flex items-center space-x-2 mt-4 sm:mt-0">
          <Button variant="outline" className="backdrop-blur supports-[backdrop-filter]:bg-background/60">
            <Filter className="mr-2 h-4 w-4" />
            Filter
          </Button>
          <CreateClassDialog />
        </div>
      </div>

      {/* Timetable Grid */}
      <Card className="shadow-soft">
        <CardHeader>
          <CardTitle className="flex items-center">
            <Calendar className="mr-2 h-5 w-5" />
            Weekly Schedule
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <div className="min-w-full">
              {/* Header Row */}
              <div className="grid grid-cols-6 gap-2 mb-4">
                <div className="p-2 text-sm font-medium text-muted-foreground">Time</div>
                {days.map(day => (
                  <div key={day} className="p-2 text-sm font-medium text-center bg-secondary/60 dark:bg-secondary/40 rounded-lg border border-border">
                    {day}
                  </div>
                ))}
              </div>

              {/* Time Slots */}
              <div className="space-y-2">
                {timeSlots.map(time => (
                  <div key={time} className="grid grid-cols-6 gap-2">
                    <div className="p-3 text-sm font-medium text-muted-foreground flex items-center">
                      <Clock className="mr-2 h-4 w-4" />
                      {time}
                    </div>
                    {days.map(day => {
                      const classItem = getClassForSlot(day, time);
                      return (
                        <div key={`${day}-${time}`} className="min-h-[80px] p-1">
                          {classItem ? (
                            <div className={`${classItem.color} ${getTextForBg(classItem.color)} p-3 rounded-lg shadow-soft h-full cursor-pointer hover:shadow-elegant transition-smooth border border-border/50`}> 
                              <div className="text-sm font-medium truncate">
                                {classItem.subject}
                              </div>
                              <div className="text-xs opacity-90 mt-1">
                                <div className="flex items-center">
                                  <MapPin className="mr-1 h-3 w-3" />
                                  {classItem.room}
                                </div>
                                <div className="flex items-center mt-1">
                                  <Users className="mr-1 h-3 w-3" />
                                  {classItem.students}
                                </div>
                              </div>
                            </div>
                          ) : (
                            <div className="h-full border-2 border-dashed border-border/70 rounded-lg flex items-center justify-center opacity-60 hover:opacity-90 cursor-pointer transition-smooth bg-secondary/20 dark:bg-secondary/10">
                              <Plus className="h-4 w-4 text-muted-foreground" />
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </div>
                ))}
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Today's Classes Summary */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {classes.slice(0, 3).map(classItem => (
          <Card key={classItem.id} className="shadow-soft hover:shadow-elegant transition-smooth">
            <CardContent className="p-4">
              <div className="flex items-start justify-between">
                <div className="space-y-2">
                  <h3 className="font-medium">{classItem.subject}</h3>
                  <div className="space-y-1 text-sm text-muted-foreground">
                    <div className="flex items-center">
                      <Clock className="mr-2 h-4 w-4" />
                      {classItem.time}
                    </div>
                    <div className="flex items-center">
                      <MapPin className="mr-2 h-4 w-4" />
                      {classItem.room}
                    </div>
                    <div className="flex items-center">
                      <Users className="mr-2 h-4 w-4" />
                      {classItem.students} students
                    </div>
                  </div>
                </div>
                <Badge variant="outline">{classItem.day}</Badge>
              </div>
              <div className="mt-3 text-xs text-muted-foreground">
                Instructor: {classItem.instructor}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}