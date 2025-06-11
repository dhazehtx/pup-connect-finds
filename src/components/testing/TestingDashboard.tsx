
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { 
  CheckCircle, 
  XCircle, 
  Clock, 
  Play, 
  Bug,
  Shield,
  Zap,
  Target
} from 'lucide-react';

interface TestSuite {
  id: string;
  name: string;
  type: 'unit' | 'integration' | 'e2e' | 'performance';
  status: 'passed' | 'failed' | 'running' | 'pending';
  tests: number;
  passed: number;
  failed: number;
  duration: number;
  lastRun: string;
}

interface TestResult {
  suite: string;
  test: string;
  status: 'passed' | 'failed';
  duration: number;
  error?: string;
}

const TestingDashboard = () => {
  const [testSuites, setTestSuites] = useState<TestSuite[]>([]);
  const [recentResults, setRecentResults] = useState<TestResult[]>([]);
  const [running, setRunning] = useState(false);
  const [coverage, setCoverage] = useState({
    statements: 78,
    branches: 65,
    functions: 82,
    lines: 76
  });

  useEffect(() => {
    // Mock test data
    const mockSuites: TestSuite[] = [
      {
        id: '1',
        name: 'Authentication Tests',
        type: 'unit',
        status: 'passed',
        tests: 24,
        passed: 24,
        failed: 0,
        duration: 1200,
        lastRun: '2024-01-20T10:30:00Z'
      },
      {
        id: '2',
        name: 'Messaging Integration',
        type: 'integration',
        status: 'failed',
        tests: 18,
        passed: 15,
        failed: 3,
        duration: 3400,
        lastRun: '2024-01-20T10:25:00Z'
      },
      {
        id: '3',
        name: 'Payment Flow E2E',
        type: 'e2e',
        status: 'passed',
        tests: 12,
        passed: 12,
        failed: 0,
        duration: 45000,
        lastRun: '2024-01-20T09:45:00Z'
      },
      {
        id: '4',
        name: 'Search Performance',
        type: 'performance',
        status: 'pending',
        tests: 8,
        passed: 0,
        failed: 0,
        duration: 0,
        lastRun: '2024-01-19T16:20:00Z'
      }
    ];

    const mockResults: TestResult[] = [
      {
        suite: 'Authentication Tests',
        test: 'should login with valid credentials',
        status: 'passed',
        duration: 150
      },
      {
        suite: 'Messaging Integration',
        test: 'should send message between users',
        status: 'failed',
        duration: 2300,
        error: 'WebSocket connection timeout'
      },
      {
        suite: 'Payment Flow E2E',
        test: 'should complete payment successfully',
        status: 'passed',
        duration: 8500
      }
    ];

    setTestSuites(mockSuites);
    setRecentResults(mockResults);
  }, []);

  const runAllTests = async () => {
    setRunning(true);
    
    // Simulate test execution
    for (const suite of testSuites) {
      setTestSuites(prev => prev.map(s => 
        s.id === suite.id ? { ...s, status: 'running' as const } : s
      ));
      
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      const passed = Math.floor(Math.random() * suite.tests);
      const failed = suite.tests - passed;
      const status = failed === 0 ? 'passed' as const : 'failed' as const;
      
      setTestSuites(prev => prev.map(s => 
        s.id === suite.id ? { 
          ...s, 
          status, 
          passed, 
          failed,
          lastRun: new Date().toISOString()
        } : s
      ));
    }
    
    setRunning(false);
  };

  const runSuite = async (suiteId: string) => {
    setTestSuites(prev => prev.map(s => 
      s.id === suiteId ? { ...s, status: 'running' as const } : s
    ));
    
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    const suite = testSuites.find(s => s.id === suiteId);
    if (suite) {
      const passed = Math.floor(Math.random() * suite.tests);
      const failed = suite.tests - passed;
      const status = failed === 0 ? 'passed' as const : 'failed' as const;
      
      setTestSuites(prev => prev.map(s => 
        s.id === suiteId ? { 
          ...s, 
          status, 
          passed, 
          failed,
          lastRun: new Date().toISOString()
        } : s
      ));
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'passed': return <CheckCircle className="w-4 h-4 text-green-500" />;
      case 'failed': return <XCircle className="w-4 h-4 text-red-500" />;
      case 'running': return <Clock className="w-4 h-4 text-blue-500 animate-spin" />;
      case 'pending': return <Clock className="w-4 h-4 text-gray-500" />;
      default: return <Clock className="w-4 h-4 text-gray-500" />;
    }
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'unit': return <Target className="w-4 h-4 text-blue-500" />;
      case 'integration': return <Zap className="w-4 h-4 text-purple-500" />;
      case 'e2e': return <Shield className="w-4 h-4 text-green-500" />;
      case 'performance': return <Bug className="w-4 h-4 text-orange-500" />;
      default: return <Target className="w-4 h-4 text-gray-500" />;
    }
  };

  const formatDuration = (ms: number) => {
    if (ms < 1000) return `${ms}ms`;
    if (ms < 60000) return `${(ms / 1000).toFixed(1)}s`;
    return `${(ms / 60000).toFixed(1)}m`;
  };

  const totalTests = testSuites.reduce((sum, suite) => sum + suite.tests, 0);
  const totalPassed = testSuites.reduce((sum, suite) => sum + suite.passed, 0);
  const totalFailed = testSuites.reduce((sum, suite) => sum + suite.failed, 0);
  const successRate = totalTests > 0 ? (totalPassed / totalTests) * 100 : 0;

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold">Testing Dashboard</h2>
          <p className="text-gray-600">Monitor test results and code coverage</p>
        </div>
        <Button onClick={runAllTests} disabled={running}>
          <Play className="w-4 h-4 mr-2" />
          {running ? 'Running Tests...' : 'Run All Tests'}
        </Button>
      </div>

      {/* Overview Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Total Tests</p>
                <p className="text-2xl font-bold">{totalTests}</p>
              </div>
              <Target className="w-8 h-8 text-blue-600" />
            </div>
            <div className="mt-4">
              <Progress value={successRate} className="h-2" />
              <p className="text-xs text-gray-500 mt-1">
                {successRate.toFixed(1)}% passing
              </p>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Passed</p>
                <p className="text-2xl font-bold text-green-600">{totalPassed}</p>
              </div>
              <CheckCircle className="w-8 h-8 text-green-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Failed</p>
                <p className="text-2xl font-bold text-red-600">{totalFailed}</p>
              </div>
              <XCircle className="w-8 h-8 text-red-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Coverage</p>
                <p className="text-2xl font-bold">{coverage.statements}%</p>
              </div>
              <Shield className="w-8 h-8 text-purple-600" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Test Suites */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Test Suites</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {testSuites.map((suite) => (
                <div key={suite.id} className="flex items-center justify-between p-3 border rounded-lg">
                  <div className="flex items-center gap-3">
                    {getTypeIcon(suite.type)}
                    <div>
                      <h4 className="font-medium">{suite.name}</h4>
                      <div className="flex items-center gap-2 text-sm text-gray-600">
                        <Badge variant="outline" className="capitalize">
                          {suite.type}
                        </Badge>
                        <span>{suite.tests} tests</span>
                        {suite.duration > 0 && (
                          <span>• {formatDuration(suite.duration)}</span>
                        )}
                      </div>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-2">
                    <div className="flex items-center gap-1">
                      {getStatusIcon(suite.status)}
                      <span className="text-sm capitalize">{suite.status}</span>
                    </div>
                    <Button 
                      size="sm" 
                      variant="ghost"
                      onClick={() => runSuite(suite.id)}
                      disabled={suite.status === 'running'}
                    >
                      <Play className="w-3 h-3" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Code Coverage */}
        <Card>
          <CardHeader>
            <CardTitle>Code Coverage</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div>
                <div className="flex justify-between text-sm mb-1">
                  <span>Statements</span>
                  <span>{coverage.statements}%</span>
                </div>
                <Progress value={coverage.statements} className="h-2" />
              </div>
              
              <div>
                <div className="flex justify-between text-sm mb-1">
                  <span>Branches</span>
                  <span>{coverage.branches}%</span>
                </div>
                <Progress value={coverage.branches} className="h-2" />
              </div>
              
              <div>
                <div className="flex justify-between text-sm mb-1">
                  <span>Functions</span>
                  <span>{coverage.functions}%</span>
                </div>
                <Progress value={coverage.functions} className="h-2" />
              </div>
              
              <div>
                <div className="flex justify-between text-sm mb-1">
                  <span>Lines</span>
                  <span>{coverage.lines}%</span>
                </div>
                <Progress value={coverage.lines} className="h-2" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Recent Test Results */}
      <Card>
        <CardHeader>
          <CardTitle>Recent Test Results</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {recentResults.map((result, index) => (
              <div key={index} className="flex items-center justify-between p-3 border rounded-lg">
                <div className="flex items-center gap-3">
                  {getStatusIcon(result.status)}
                  <div>
                    <h4 className="font-medium">{result.test}</h4>
                    <p className="text-sm text-gray-600">{result.suite}</p>
                    {result.error && (
                      <p className="text-sm text-red-600 mt-1">{result.error}</p>
                    )}
                  </div>
                </div>
                <span className="text-sm text-gray-500">
                  {formatDuration(result.duration)}
                </span>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default TestingDashboard;
