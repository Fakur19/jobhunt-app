import React from 'react';
import { useJob } from '../context/JobContext';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { 
  Briefcase, 
  CheckCircle2, 
  XCircle, 
  Clock,
  TrendingUp
} from 'lucide-react';
import { 
  LineChart, 
  Line, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Legend
} from 'recharts';
import { format, subDays, startOfDay, isAfter, parseISO } from 'date-fns';

const Dashboard = () => {
  const { applications, offers } = useJob();

  const stats = [
    {
      title: 'Total Applications',
      value: applications.length,
      icon: Briefcase,
      color: 'text-blue-600',
      bg: 'bg-blue-50',
    },
    {
      title: 'Active Interviews',
      value: applications.filter(a => a.status === 'Interviewing').length,
      icon: Clock,
      color: 'text-amber-600',
      bg: 'bg-amber-50',
    },
    {
      title: 'Success Rate',
      value: applications.length > 0 
        ? `${Math.round((applications.filter(a => a.status === 'Hired' || a.status === 'Offer').length / applications.length) * 100)}%`
        : '0%',
      icon: TrendingUp,
      color: 'text-emerald-600',
      bg: 'bg-emerald-50',
    },
    {
      title: 'Offers Received',
      value: offers.filter(o => o.type === 'Offer').length,
      icon: CheckCircle2,
      color: 'text-indigo-600',
      bg: 'bg-indigo-50',
    },
  ];

  // Prepare status distribution data
  const statusCounts = applications.reduce((acc: Record<string, number>, app) => {
    acc[app.status] = (acc[app.status] || 0) + 1;
    return acc;
  }, {});

  const pieData = Object.entries(statusCounts).map(([name, value]) => ({ name, value }));
  
  const COLORS = {
    'Applied': '#94a3b8',
    'Interviewing': '#2563eb',
    'Offer': '#10b981',
    'Rejected': '#ef4444',
    'Withdrawn': '#64748b',
    'Hired': '#059669',
    'Offer Declined': '#f43f5e'
  };

  // Prepare chart data (last 14 days)
  const chartData = Array.from({ length: 14 }).map((_, i) => {
    const date = subDays(new Date(), 13 - i);
    const dateStr = format(date, 'MMM dd');
    const count = applications.filter(a => {
      try {
        return startOfDay(parseISO(a.date)).getTime() === startOfDay(date).getTime();
      } catch (e) {
        return false;
      }
    }).length;
    return { date: dateStr, count };
  });

  const recentApps = [...applications]
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
    .slice(0, 5);

  return (
    <div className="space-y-8">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat) => (
          <Card key={stat.title}>
            <CardContent className="p-6 flex items-center gap-4">
              <div className={`p-3 rounded-xl ${stat.bg}`}>
                <stat.icon className={`w-6 h-6 ${stat.color}`} />
              </div>
              <div>
                <p className="text-sm font-medium text-slate-500">{stat.title}</p>
                <h3 className="text-2xl font-bold text-slate-900">{stat.value}</h3>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle className="text-lg font-semibold flex items-center gap-2">
              <TrendingUp className="w-5 h-5 text-blue-600" />
              Application Velocity
            </CardTitle>
          </CardHeader>
          <CardContent className="h-[350px]">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                <XAxis 
                  dataKey="date" 
                  axisLine={false} 
                  tickLine={false} 
                  tick={{ fontSize: 12, fill: '#64748b' }}
                  dy={10}
                />
                <YAxis 
                  axisLine={false} 
                  tickLine={false} 
                  tick={{ fontSize: 12, fill: '#64748b' }}
                />
                <Tooltip 
                  contentStyle={{ 
                    backgroundColor: '#fff', 
                    border: '1px solid #e2e8f0',
                    borderRadius: '8px',
                    boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)'
                  }}
                />
                <Line 
                  type="monotone" 
                  dataKey="count" 
                  stroke="#2563eb" 
                  strokeWidth={3} 
                  dot={{ r: 4, fill: '#2563eb', strokeWidth: 2, stroke: '#fff' }}
                  activeDot={{ r: 6, strokeWidth: 0 }}
                />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-lg font-semibold">Status Distribution</CardTitle>
          </CardHeader>
          <CardContent className="h-[350px]">
            {applications.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={pieData}
                    cx="50%"
                    cy="45%"
                    innerRadius={60}
                    outerRadius={80}
                    paddingAngle={5}
                    dataKey="value"
                  >
                    {pieData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[entry.name as keyof typeof COLORS] || '#cbd5e1'} />
                    ))}
                  </Pie>
                  <Tooltip />
                  <Legend verticalAlign="bottom" height={36}/>
                </PieChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-full flex items-center justify-center text-slate-400 text-sm italic">
                No data to display
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <Card>
          <CardHeader>
            <CardTitle className="text-lg font-semibold">Recent Activity</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {recentApps.map((app) => (
                <div key={app.id} className="flex items-center justify-between p-4 rounded-xl border border-slate-100 hover:border-blue-100 hover:bg-blue-50/30 transition-all group">
                  <div className="flex items-center gap-4">
                    <div className={`w-10 h-10 rounded-lg flex items-center justify-center font-bold text-lg ${
                      app.status === 'Hired' ? 'bg-emerald-100 text-emerald-600' :
                      app.status === 'Offer' ? 'bg-indigo-100 text-indigo-600' :
                      app.status === 'Interviewing' ? 'bg-blue-100 text-blue-600' :
                      'bg-slate-100 text-slate-600'
                    }`}>
                      {app.company.charAt(0)}
                    </div>
                    <div>
                      <p className="font-semibold text-slate-900 group-hover:text-blue-700 transition-colors">{app.jobTitle}</p>
                      <p className="text-sm text-slate-500">{app.company} • {format(parseISO(app.date), 'MMM dd, yyyy')}</p>
                    </div>
                  </div>
                  <div className={`px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider ${
                    app.status === 'Hired' ? 'bg-emerald-100 text-emerald-700' :
                    app.status === 'Offer' ? 'bg-indigo-100 text-indigo-700' :
                    app.status === 'Interviewing' ? 'bg-blue-100 text-blue-700' :
                    app.status === 'Rejected' ? 'bg-red-100 text-red-700' :
                    'bg-slate-100 text-slate-700'
                  }`}>
                    {app.status}
                  </div>
                </div>
              ))}
              {applications.length === 0 && (
                <div className="text-center py-12 bg-slate-50 rounded-xl border border-dashed">
                  <p className="text-sm text-slate-500 italic">No applications recorded yet.</p>
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-lg font-semibold">Interview Funnel</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-6 py-4">
              {[
                { label: 'Total Applications', count: applications.length, color: 'bg-slate-200' },
                { label: 'Interviews Landed', count: applications.filter(a => ['Interviewing', 'Offer', 'Hired', 'Offer Declined'].includes(a.status)).length, color: 'bg-blue-400' },
                { label: 'Offers Received', count: applications.filter(a => ['Offer', 'Hired', 'Offer Declined'].includes(a.status)).length, color: 'bg-emerald-500' }
              ].map((step, i, arr) => (
                <div key={step.label} className="space-y-2">
                  <div className="flex justify-between text-sm font-medium">
                    <span className="text-slate-600">{step.label}</span>
                    <span className="text-slate-900">{step.count}</span>
                  </div>
                  <div className="h-3 w-full bg-slate-100 rounded-full overflow-hidden">
                    <div 
                      className={`h-full ${step.color} transition-all duration-1000`} 
                      style={{ width: `${applications.length > 0 ? (step.count / applications.length) * 100 : 0}%` }}
                    />
                  </div>
                  {i < arr.length - 1 && (
                    <div className="text-[10px] font-bold text-slate-400 text-center uppercase tracking-widest">
                      {step.count > 0 ? `${Math.round((arr[i+1].count / step.count) * 100)}% Conversion` : '0% Conversion'}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Dashboard;
