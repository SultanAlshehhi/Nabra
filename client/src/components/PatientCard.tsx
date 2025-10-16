import { User, Calendar, FileText } from 'lucide-react';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Link } from 'wouter';

interface PatientCardProps {
  name: string;
  age: number;
  lastSession: string;
  totalSessions: number;
  latestClassification?: string;
}

export default function PatientCard({ name, age, lastSession, totalSessions, latestClassification }: PatientCardProps) {
  const initials = name.split(' ').map(n => n[0]).join('').toUpperCase();

  return (
    <Card className="hover-elevate">
      <CardHeader className="flex flex-row items-center gap-4 space-y-0">
        <Avatar className="h-12 w-12">
          <AvatarFallback className="bg-primary text-primary-foreground font-semibold">
            {initials}
          </AvatarFallback>
        </Avatar>
        <div className="flex-1 space-y-1">
          <h3 className="font-semibold text-foreground">{name}</h3>
          <p className="text-sm text-muted-foreground">Age {age}</p>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-2 gap-4 text-sm">
          <div className="flex items-center gap-2">
            <Calendar className="w-4 h-4 text-muted-foreground" />
            <div>
              <p className="text-xs text-muted-foreground">Last Session</p>
              <p className="font-medium text-foreground">{lastSession}</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <FileText className="w-4 h-4 text-muted-foreground" />
            <div>
              <p className="text-xs text-muted-foreground">Total</p>
              <p className="font-medium text-foreground">{totalSessions} sessions</p>
            </div>
          </div>
        </div>
        {latestClassification && (
          <div className="p-3 bg-muted rounded-lg">
            <p className="text-xs text-muted-foreground mb-1">Latest Result</p>
            <p className="text-sm font-medium text-foreground">{latestClassification}</p>
          </div>
        )}
        <Link href="/patient-profile/therapist">
          <Button
            size="sm"
            className="w-full"
            data-testid={`button-view-profile-${name.replace(/\s+/g, '-').toLowerCase()}`}
          >
            <User className="w-4 h-4 mr-2" />
            View Profile
          </Button>
        </Link>
      </CardContent>
    </Card>
  );
}
