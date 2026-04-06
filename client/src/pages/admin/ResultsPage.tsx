import { useState } from 'react';
import { useLocation } from 'wouter';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { LogOut, ArrowLeft } from 'lucide-react';
import ResultsManagement from '@/components/admin/ResultsManagement';

export default function ResultsPage() {
  const [, setLocation] = useLocation();

  const handleLogout = () => {
    localStorage.removeItem('adminToken');
    setLocation('/');
  };

  const handleBack = () => {
    setLocation('/admin/dashboard');
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-white">
      {/* Header */}
      <header className="bg-white shadow-sm border-b border-border sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Button
              onClick={handleBack}
              variant="ghost"
              size="sm"
              className="gap-2"
            >
              <ArrowLeft className="w-4 h-4" />
              Back
            </Button>
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-accent rounded-lg flex items-center justify-center">
                <span className="text-white font-bold text-sm">SMIT</span>
              </div>
              <div>
                <h1 className="text-xl font-bold text-foreground">Results Management</h1>
                <p className="text-xs text-muted-foreground">Manage exam results</p>
              </div>
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
        <Card className="border border-border shadow-sm p-6">
          <ResultsManagement />
        </Card>
      </main>
    </div>
  );
}
