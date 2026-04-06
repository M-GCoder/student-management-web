import { useLocation } from 'wouter';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip';
import { LogOut, Users, BookOpen, DollarSign, BarChart3 } from 'lucide-react';
import { trpc } from '@/lib/trpc';

export default function AdminDashboard() {
  const [, setLocation] = useLocation();

  // Fetch statistics
  const { data: allStudents = [] } = trpc.students.list.useQuery();
  const { data: allClasses = [] } = trpc.classes.list.useQuery();

  const handleLogout = () => {
    localStorage.removeItem('adminToken');
    setLocation('/');
  };

  const navigationItems = [
    {
      icon: Users,
      label: 'Manage Students',
      path: '/admin/students',
      count: allStudents.length,
      activeCount: allStudents.filter((s) => s.status === 'active').length,
    },
    {
      icon: BookOpen,
      label: 'Manage Classes',
      path: '/admin/classes',
      count: allClasses.length,
      activeCount: allClasses.filter((c) => c.status === 'active').length,
    },
    {
      icon: DollarSign,
      label: 'Manage Payments',
      path: '/admin/payments',
      count: 0,
      activeCount: 0,
    },
    {
      icon: BarChart3,
      label: 'Manage Results',
      path: '/admin/results',
      count: 0,
      activeCount: 0,
    },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-white">
      {/* Header */}
      <header className="bg-white shadow-sm border-b border-border sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-accent rounded-lg flex items-center justify-center">
              <span className="text-white font-bold text-sm">SMIT</span>
            </div>
            <div>
              <h1 className="text-xl font-bold text-foreground">Admin Dashboard</h1>
              <p className="text-xs text-muted-foreground">Student Management System</p>
            </div>
          </div>
          <Button
            onClick={handleLogout}
            variant="outline"
            className="flex items-center gap-2"
          >
            <LogOut className="w-4 h-4" />
            Logout
          </Button>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Welcome Section */}
        <div className="mb-12">
          <h2 className="text-2xl font-bold text-foreground mb-2">Welcome to Admin Dashboard</h2>
          <p className="text-muted-foreground">Select a section below to manage your school's data</p>
        </div>

        {/* Navigation Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {navigationItems.map((item) => {
            const Icon = item.icon;
            return (
              <Card
                key={item.path}
                className="p-6 border border-border shadow-sm hover:shadow-lg hover:border-accent transition-all cursor-pointer group"
                onClick={() => setLocation(item.path)}
              >
                <div className="flex flex-col items-center text-center">
                  {/* Icon */}
                  <div className="w-16 h-16 bg-accent/10 rounded-lg flex items-center justify-center mb-4 group-hover:bg-accent/20 transition-colors">
                    <Icon className="w-8 h-8 text-accent" />
                  </div>

                  {/* Label */}
                  <h3 className="text-lg font-semibold text-foreground mb-3">
                    {item.label}
                  </h3>

                  {/* Stats */}
                  <div className="w-full space-y-2">
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-muted-foreground">Total:</span>
                      <span className="font-semibold text-foreground">{item.count}</span>
                    </div>
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-muted-foreground">Active:</span>
                      <span className="font-semibold text-green-600">{item.activeCount}</span>
                    </div>
                  </div>

                  {/* Arrow */}
                  <div className="mt-4 pt-4 border-t border-border w-full">
                    <div className="text-accent text-sm font-medium group-hover:translate-x-1 transition-transform">
                      Open →
                    </div>
                  </div>
                </div>
              </Card>
            );
          })}
        </div>

        {/* Quick Stats */}
        <div className="mt-12 grid grid-cols-1 md:grid-cols-3 gap-6">
          <Card className="p-6 border border-border shadow-sm bg-gradient-to-br from-blue-50 to-blue-100/50">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-sm text-muted-foreground font-medium">Total Students</p>
                <h3 className="text-3xl font-bold text-foreground mt-1">{allStudents.length}</h3>
              </div>
              <div className="w-12 h-12 bg-blue-200 rounded-lg flex items-center justify-center">
                <Users className="w-6 h-6 text-blue-600" />
              </div>
            </div>
          </Card>

          <Card className="p-6 border border-border shadow-sm bg-gradient-to-br from-green-50 to-green-100/50">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-sm text-muted-foreground font-medium">Total Classes</p>
                <h3 className="text-3xl font-bold text-foreground mt-1">{allClasses.length}</h3>
              </div>
              <div className="w-12 h-12 bg-green-200 rounded-lg flex items-center justify-center">
                <BookOpen className="w-6 h-6 text-green-600" />
              </div>
            </div>
          </Card>

          <Card className="p-6 border border-border shadow-sm bg-gradient-to-br from-purple-50 to-purple-100/50">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-sm text-muted-foreground font-medium">Active Enrollments</p>
                <h3 className="text-3xl font-bold text-foreground mt-1">
                  {allStudents.filter((s) => s.status === 'active').length}
                </h3>
              </div>
              <div className="w-12 h-12 bg-purple-200 rounded-lg flex items-center justify-center">
                <Users className="w-6 h-6 text-purple-600" />
              </div>
            </div>
          </Card>
        </div>
      </main>
    </div>
  );
}
