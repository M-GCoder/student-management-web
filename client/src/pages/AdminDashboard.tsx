import { useState } from 'react';
import { useLocation } from 'wouter';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip';
import { LogOut, Users, BookOpen, DollarSign, BarChart3 } from 'lucide-react';
import { trpc } from '@/lib/trpc';
import StudentManagement from '@/components/admin/StudentManagement';
import ClassManagement from '@/components/admin/ClassManagement';
import PaymentManagement from '@/components/admin/PaymentManagement';
import ResultsManagement from '@/components/admin/ResultsManagement';

export default function AdminDashboard() {
  const [, setLocation] = useLocation();
  const [activeTab, setActiveTab] = useState('students');

  // Fetch statistics
  const { data: allStudents = [] } = trpc.students.list.useQuery();
  const { data: allClasses = [] } = trpc.classes.list.useQuery();

  const handleLogout = () => {
    localStorage.removeItem('adminToken');
    setLocation('/');
  };

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
        {/* Statistics Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <Card className="p-6 border border-border shadow-sm hover:shadow-md transition-shadow">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-sm text-muted-foreground font-medium">Total Students</p>
                <h3 className="text-2xl font-bold text-foreground mt-1">{allStudents.length}</h3>
              </div>
              <div className="w-12 h-12 bg-accent/10 rounded-lg flex items-center justify-center">
                <Users className="w-6 h-6 text-accent" />
              </div>
            </div>
          </Card>

          <Card className="p-6 border border-border shadow-sm hover:shadow-md transition-shadow">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-sm text-muted-foreground font-medium">Total Classes</p>
                <h3 className="text-2xl font-bold text-foreground mt-1">{allClasses.length}</h3>
              </div>
              <div className="w-12 h-12 bg-accent/10 rounded-lg flex items-center justify-center">
                <BookOpen className="w-6 h-6 text-accent" />
              </div>
            </div>
          </Card>

          <Card className="p-6 border border-border shadow-sm hover:shadow-md transition-shadow">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-sm text-muted-foreground font-medium">Active Students</p>
                <h3 className="text-2xl font-bold text-foreground mt-1">
                  {allStudents.filter((s) => s.status === 'active').length}
                </h3>
              </div>
              <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
                <Users className="w-6 h-6 text-green-600" />
              </div>
            </div>
          </Card>

          <Card className="p-6 border border-border shadow-sm hover:shadow-md transition-shadow">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-sm text-muted-foreground font-medium">Active Classes</p>
                <h3 className="text-2xl font-bold text-foreground mt-1">
                  {allClasses.filter((c) => c.status === 'active').length}
                </h3>
              </div>
              <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                <BookOpen className="w-6 h-6 text-blue-600" />
              </div>
            </div>
          </Card>
        </div>

        {/* Management Tabs */}
        <Card className="border border-border shadow-sm">
          <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
            <div className="border-b border-border">
              <TabsList className="w-full justify-start rounded-none bg-transparent p-0 h-auto">
                {/* Students Tab */}
                <Tooltip>
                  <TooltipTrigger asChild>
                    <TabsTrigger
                      value="students"
                      className="rounded-none border-b-2 border-transparent data-[state=active]:border-accent data-[state=active]:bg-transparent px-4 py-3 hover:bg-muted/50 transition-colors"
                    >
                      <Users className="w-5 h-5" />
                    </TabsTrigger>
                  </TooltipTrigger>
                  <TooltipContent>Manage Students</TooltipContent>
                </Tooltip>

                {/* Classes Tab */}
                <Tooltip>
                  <TooltipTrigger asChild>
                    <TabsTrigger
                      value="classes"
                      className="rounded-none border-b-2 border-transparent data-[state=active]:border-accent data-[state=active]:bg-transparent px-4 py-3 hover:bg-muted/50 transition-colors"
                    >
                      <BookOpen className="w-5 h-5" />
                    </TabsTrigger>
                  </TooltipTrigger>
                  <TooltipContent>Manage Classes</TooltipContent>
                </Tooltip>

                {/* Payments Tab */}
                <Tooltip>
                  <TooltipTrigger asChild>
                    <TabsTrigger
                      value="payments"
                      className="rounded-none border-b-2 border-transparent data-[state=active]:border-accent data-[state=active]:bg-transparent px-4 py-3 hover:bg-muted/50 transition-colors"
                    >
                      <DollarSign className="w-5 h-5" />
                    </TabsTrigger>
                  </TooltipTrigger>
                  <TooltipContent>Manage Payments</TooltipContent>
                </Tooltip>

                {/* Results Tab */}
                <Tooltip>
                  <TooltipTrigger asChild>
                    <TabsTrigger
                      value="results"
                      className="rounded-none border-b-2 border-transparent data-[state=active]:border-accent data-[state=active]:bg-transparent px-4 py-3 hover:bg-muted/50 transition-colors"
                    >
                      <BarChart3 className="w-5 h-5" />
                    </TabsTrigger>
                  </TooltipTrigger>
                  <TooltipContent>Manage Results</TooltipContent>
                </Tooltip>
              </TabsList>
            </div>

            <div className="p-6">
              <TabsContent value="students">
                <StudentManagement />
              </TabsContent>

              <TabsContent value="classes">
                <ClassManagement />
              </TabsContent>

              <TabsContent value="payments">
                <PaymentManagement />
              </TabsContent>

              <TabsContent value="results">
                <ResultsManagement />
              </TabsContent>
            </div>
          </Tabs>
        </Card>
      </main>
    </div>
  );
}
