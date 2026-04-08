import { useLocation } from "wouter";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { Users, BookOpen, DollarSign, BarChart3, Home, LogOut, MessageCircle, LogIn } from "lucide-react";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip as ChartTooltip, ResponsiveContainer } from "recharts";
import { useState } from "react";

const weeklyData = [
  { day: "Sun", students: 30, classes: 25 },
  { day: "Sun", students: 60, classes: 45 },
  { day: "Mon", students: 80, classes: 60 },
  { day: "Tul", students: 120, classes: 90 },
  { day: "Wed", students: 100, classes: 80 },
  { day: "Thu", students: 90, classes: 70 },
  { day: "Fri", students: 140, classes: 110 },
];

export default function AdminHome() {
  const [, navigate] = useLocation();
  const [activeTab, setActiveTab] = useState("home");

  const handleLogout = () => {
    localStorage.removeItem("adminSession");
    navigate("/");
  };

  const handleNavigation = (tab: string, path: string) => {
    setActiveTab(tab);
    navigate(path);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
      {/* Header */}
      <div className="bg-white border-b border-border shadow-sm">
        <div className="max-w-7xl mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 bg-gradient-to-br from-green-100 to-green-50 rounded-full flex items-center justify-center">
              <span className="text-2xl">👤</span>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <Button variant="ghost" size="icon">
              <MessageCircle className="w-5 h-5" />
            </Button>
            <Button variant="ghost" size="icon" onClick={handleLogout}>
              <LogIn className="w-5 h-5" />
            </Button>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* System Overview */}
        <div className="mb-8">
          <h2 className="text-3xl font-bold text-foreground mb-6">System Overview</h2>
          
          {/* Weekly Activity Chart */}
          <div className="bg-white rounded-lg border border-border shadow-sm p-6 mb-6">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              <div className="lg:col-span-2">
                <h3 className="text-xl font-bold text-foreground mb-4">Weekly Activity</h3>
                <ResponsiveContainer width="100%" height={300}>
                  <LineChart data={weeklyData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                    <XAxis dataKey="day" stroke="#6b7280" />
                    <YAxis stroke="#6b7280" />
                    <ChartTooltip 
                      contentStyle={{ backgroundColor: "#fff", border: "1px solid #e5e7eb" }}
                      formatter={(value) => [value, "Count"]}
                    />
                    <Line 
                      type="monotone" 
                      dataKey="students" 
                      stroke="#16a34a" 
                      strokeWidth={2}
                      dot={{ fill: "#16a34a", r: 4 }}
                      activeDot={{ r: 6 }}
                    />
                    <Line 
                      type="monotone" 
                      dataKey="classes" 
                      stroke="#22c55e" 
                      strokeWidth={2}
                      dot={{ fill: "#22c55e", r: 4 }}
                      activeDot={{ r: 6 }}
                    />
                  </LineChart>
                </ResponsiveContainer>
              </div>
              
              {/* Critical Alerts */}
              <div className="bg-gradient-to-br from-red-50 to-red-100/50 rounded-lg p-6">
                <h3 className="text-lg font-bold text-foreground mb-4">Critical Alerts</h3>
                <div className="space-y-3">
                  <div className="text-sm">
                    <p className="font-semibold text-foreground">System status status</p>
                    <p className="text-muted-foreground">connected at status</p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Stat Cards Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Students Card */}
            <Card className="p-6 border border-border shadow-sm bg-white hover:shadow-md transition-shadow">
              <div className="flex items-start gap-4 mb-4">
                <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                  <Users className="w-6 h-6 text-blue-600" />
                </div>
                <h3 className="text-xl font-bold text-foreground">Students Card</h3>
              </div>
              <div className="space-y-3">
                <div className="flex justify-between items-baseline">
                  <span className="text-muted-foreground">Total Students</span>
                  <span className="text-2xl font-bold text-foreground">2,500</span>
                </div>
                <div className="text-xs text-muted-foreground">Fe.g. T1</div>
                <div className="flex justify-between items-baseline">
                  <span className="text-muted-foreground">Active Students</span>
                  <span className="text-2xl font-bold text-foreground">1,800</span>
                </div>
                <div className="flex justify-between items-baseline">
                  <span className="text-muted-foreground">Dropout Rate</span>
                  <span className="text-2xl font-bold text-foreground">3%</span>
                </div>
              </div>
            </Card>

            {/* Classes Card */}
            <Card className="p-6 border border-border shadow-sm bg-white hover:shadow-md transition-shadow">
              <div className="flex items-start gap-4 mb-4">
                <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center">
                  <BookOpen className="w-6 h-6 text-purple-600" />
                </div>
                <h3 className="text-xl font-bold text-foreground">Classes Card</h3>
              </div>
              <div className="space-y-3">
                <div className="flex justify-between items-baseline">
                  <span className="text-muted-foreground">Active Classes</span>
                  <span className="text-2xl font-bold text-foreground">120</span>
                </div>
                <div className="flex justify-between items-baseline">
                  <span className="text-muted-foreground">Ongoing Sessions</span>
                  <span className="text-2xl font-bold text-foreground">15</span>
                </div>
              </div>
            </Card>

            {/* Finance Card */}
            <Card className="p-6 border border-border shadow-sm bg-white hover:shadow-md transition-shadow">
              <div className="flex items-start gap-4 mb-4">
                <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
                  <DollarSign className="w-6 h-6 text-green-600" />
                </div>
                <h3 className="text-xl font-bold text-foreground">Finance Card</h3>
              </div>
              <div className="space-y-3">
                <div className="flex justify-between items-baseline">
                  <span className="text-muted-foreground">Total Fee Collection</span>
                  <span className="text-2xl font-bold text-foreground">Rs. 2,500,000 /-</span>
                </div>
                <div className="flex justify-between items-baseline">
                  <span className="text-muted-foreground">Pending Payments</span>
                  <span className="text-2xl font-bold text-foreground">Rs. 150,000 /-</span>
                </div>
              </div>
            </Card>

            {/* Results Card */}
            <Card className="p-6 border border-border shadow-sm bg-white hover:shadow-md transition-shadow">
              <div className="flex items-start gap-4 mb-4">
                <div className="w-12 h-12 bg-orange-100 rounded-lg flex items-center justify-center">
                  <BarChart3 className="w-6 h-6 text-orange-600" />
                </div>
                <h3 className="text-xl font-bold text-foreground">Results Card</h3>
              </div>
              <div className="space-y-3">
                <div className="flex justify-between items-baseline">
                  <span className="text-muted-foreground">Grades Processed</span>
                  <span className="text-2xl font-bold text-foreground">1,200</span>
                </div>
                <div className="flex justify-between items-baseline">
                  <span className="text-muted-foreground">System Performance</span>
                  <span className="text-2xl font-bold text-foreground">99.9% uptime</span>
                </div>
              </div>
            </Card>
          </div>
        </div>
      </div>

      {/* Bottom Navigation */}
      <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-border shadow-lg">
        <div className="max-w-7xl mx-auto px-4 flex items-center justify-around py-4">
          <Tooltip>
            <TooltipTrigger asChild>
              <button
                onClick={() => handleNavigation("home", "/admin/home")}
                className={`flex flex-col items-center gap-1 p-3 rounded-lg transition-colors ${
                  activeTab === "home"
                    ? "text-green-600 bg-green-50"
                    : "text-muted-foreground hover:text-foreground"
                }`}
              >
                <Home className="w-6 h-6" />
                <span className="text-xs font-medium">Home</span>
              </button>
            </TooltipTrigger>
            <TooltipContent>Home</TooltipContent>
          </Tooltip>

          <Tooltip>
            <TooltipTrigger asChild>
              <button
                onClick={() => handleNavigation("class", "/admin/classes")}
                className={`flex flex-col items-center gap-1 p-3 rounded-lg transition-colors ${
                  activeTab === "class"
                    ? "text-green-600 bg-green-50"
                    : "text-muted-foreground hover:text-foreground"
                }`}
              >
                <BookOpen className="w-6 h-6" />
                <span className="text-xs font-medium">Class</span>
              </button>
            </TooltipTrigger>
            <TooltipContent>Class</TooltipContent>
          </Tooltip>

          <Tooltip>
            <TooltipTrigger asChild>
              <button
                onClick={() => handleNavigation("payments", "/admin/payments")}
                className={`flex flex-col items-center gap-1 p-3 rounded-lg transition-colors ${
                  activeTab === "payments"
                    ? "text-green-600 bg-green-50"
                    : "text-muted-foreground hover:text-foreground"
                }`}
              >
                <DollarSign className="w-6 h-6" />
                <span className="text-xs font-medium">Payments</span>
              </button>
            </TooltipTrigger>
            <TooltipContent>Payments</TooltipContent>
          </Tooltip>

          <Tooltip>
            <TooltipTrigger asChild>
              <button
                onClick={() => handleNavigation("results", "/admin/results")}
                className={`flex flex-col items-center gap-1 p-3 rounded-lg transition-colors ${
                  activeTab === "results"
                    ? "text-green-600 bg-green-50"
                    : "text-muted-foreground hover:text-foreground"
                }`}
              >
                <BarChart3 className="w-6 h-6" />
                <span className="text-xs font-medium">Results</span>
              </button>
            </TooltipTrigger>
            <TooltipContent>Results</TooltipContent>
          </Tooltip>

          <Tooltip>
            <TooltipTrigger asChild>
              <button
                onClick={() => handleNavigation("announcements", "/admin/announcements")}
                className={`flex flex-col items-center gap-1 p-3 rounded-lg transition-colors ${
                  activeTab === "announcements"
                    ? "text-green-600 bg-green-50"
                    : "text-muted-foreground hover:text-foreground"
                }`}
              >
                <MessageCircle className="w-6 h-6" />
                <span className="text-xs font-medium">Announcements</span>
              </button>
            </TooltipTrigger>
            <TooltipContent>Announcements</TooltipContent>
          </Tooltip>
        </div>
      </div>

      {/* Padding for bottom nav */}
      <div className="h-24" />
    </div>
  );
}
