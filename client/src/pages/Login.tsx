import { useState } from 'react';
import { useLocation } from 'wouter';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { AlertCircle, Eye, EyeOff } from 'lucide-react';
import { trpc } from '@/lib/trpc';

export default function Login() {
  const [, setLocation] = useLocation();
  const navigate = (path: string) => setLocation(path);
  const [studentId, setStudentId] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const studentLoginMutation = trpc.portal.login.useMutation({
    onSuccess: (data) => {
      if (data.success) {
        // Store student info in localStorage for now
        localStorage.setItem('studentId', data.student.id.toString());
        localStorage.setItem('studentName', `${data.student.firstName} ${data.student.lastName}`);
        navigate('/student/dashboard');
      }
    },
    onError: (error) => {
      setError(error.message || 'Login failed. Please try again.');
      setLoading(false);
    },
  });

  const handleStudentLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    if (!studentId.trim() || !password.trim()) {
      setError('Please enter both Student ID and Password');
      setLoading(false);
      return;
    }

    // Check for admin credentials
    if (studentId === 'admin@gmail.com' && password === 'admin12345') {
      localStorage.setItem('adminToken', 'admin-session');
      localStorage.setItem('isAdmin', 'true');
      localStorage.setItem('adminSession', 'active');
      navigate('/admin/home');
      return;
    }

    studentLoginMutation.mutate({ studentId, password });
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-white to-gray-50 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        {/* Header with Logo */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-accent rounded-lg mb-4">
            <span className="text-2xl font-bold text-white">SSCC</span>
          </div>
          <h1 className="text-3xl font-bold text-foreground mb-2">Student Portal</h1>
          <p className="text-muted-foreground">Sir Syed Coaching Centre</p>
        </div>

        {/* Login Card */}
        <Card className="p-6 shadow-lg">
          <Tabs defaultValue="login" className="w-full">
            <TabsList className="grid w-full grid-cols-2 mb-6">
              <TabsTrigger value="login">Login</TabsTrigger>
              <TabsTrigger value="password" disabled>
                Create Password
              </TabsTrigger>
            </TabsList>

            <TabsContent value="login" className="space-y-4">
              <div>
                <h2 className="text-xl font-semibold text-foreground mb-2">Login</h2>
                <p className="text-sm text-muted-foreground mb-6">
                  Kindly provide the Student ID and password used during SSCC class registration.
                </p>
              </div>

              {error && (
                <div className="bg-destructive/10 border border-destructive/20 rounded-md p-3 flex items-start gap-3">
                  <AlertCircle className="w-5 h-5 text-destructive flex-shrink-0 mt-0.5" />
                  <p className="text-sm text-destructive">{error}</p>
                </div>
              )}

              <form onSubmit={handleStudentLogin} className="space-y-4">
                <div>
                  <label htmlFor="studentId" className="form-label">
                    Student ID <span className="text-destructive">*</span>
                  </label>
                  <Input
                    id="studentId"
                    type="text"
                    placeholder="Enter your Student ID"
                    value={studentId}
                    onChange={(e) => setStudentId(e.target.value)}
                    disabled={loading}
                    className="input-field"
                  />
                </div>

                <div>
                  <label htmlFor="password" className="form-label">
                    Password <span className="text-destructive">*</span>
                  </label>
                  <div className="relative">
                    <Input
                      id="password"
                      type={showPassword ? 'text' : 'password'}
                      placeholder="Enter your password"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      disabled={loading}
                      className="input-field pr-10"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                      disabled={loading}
                    >
                      {showPassword ? (
                        <EyeOff className="w-4 h-4" />
                      ) : (
                        <Eye className="w-4 h-4" />
                      )}
                    </button>
                  </div>
                </div>

                <Button
                  type="submit"
                  disabled={loading}
                  className="w-full bg-accent hover:bg-accent/90 text-white font-semibold py-2"
                >
                  {loading ? 'Logging in...' : 'LOGIN'}
                </Button>
              </form>


            </TabsContent>
          </Tabs>
        </Card>

        {/* Footer */}
        <p className="text-center text-xs text-muted-foreground mt-6">
          © 2026 SIR SYED COACHING CENTRE. All rights reserved.
        </p>
      </div>
    </div>
  );
}
