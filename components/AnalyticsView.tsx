
import React from 'react';
import { Ticket, ServiceType, TicketStatus } from '../types';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, LineChart, Line } from 'recharts';

interface AnalyticsViewProps {
  tickets: Ticket[];
}

const COLORS = ['#6366f1', '#10b981', '#f59e0b', '#ec4899'];

const AnalyticsView: React.FC<AnalyticsViewProps> = ({ tickets }) => {
  const serviceData = Object.values(ServiceType).map(type => ({
    name: type,
    total: tickets.filter(t => t.serviceType === type).length,
    completed: tickets.filter(t => t.serviceType === type && t.status === TicketStatus.COMPLETED).length
  }));

  const statusData = [
    { name: 'Menunggu', value: tickets.filter(t => t.status === TicketStatus.WAITING).length },
    { name: 'Selesai', value: tickets.filter(t => t.status === TicketStatus.COMPLETED).length },
    { name: 'Dilewati', value: tickets.filter(t => t.status === TicketStatus.SKIPPED).length },
  ].filter(d => d.value > 0);

  // Hourly trend (mocked for demo if not enough real data)
  const hourlyTrend = Array.from({ length: 9 }, (_, i) => {
    const hour = i + 8; // 08:00 to 16:00
    const count = tickets.filter(t => new Date(t.timestamp).getHours() === hour).length;
    return { hour: `${hour}:00`, count };
  });

  return (
    <div className="space-y-8 animate-fadeIn">
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm">
          <p className="text-slate-500 text-sm font-medium mb-1">Total Pendaftar</p>
          <div className="text-3xl font-black text-slate-800">{tickets.length}</div>
        </div>
        <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm">
          <p className="text-slate-500 text-sm font-medium mb-1">Selesai Terlayani</p>
          <div className="text-3xl font-black text-emerald-600">
            {tickets.filter(t => t.status === TicketStatus.COMPLETED).length}
          </div>
        </div>
        <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm">
          <p className="text-slate-500 text-sm font-medium mb-1">Sedang Menunggu</p>
          <div className="text-3xl font-black text-amber-500">
            {tickets.filter(t => t.status === TicketStatus.WAITING).length}
          </div>
        </div>
        <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm">
          <p className="text-slate-500 text-sm font-medium mb-1">Tingkat Penyelesaian</p>
          <div className="text-3xl font-black text-indigo-600">
            {tickets.length > 0 ? Math.round((tickets.filter(t => t.status === TicketStatus.COMPLETED).length / tickets.length) * 100) : 0}%
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Service Type Distribution */}
        <div className="bg-white p-8 rounded-3xl border border-slate-100 shadow-sm">
          <h3 className="text-lg font-bold text-slate-800 mb-8">Distribusi Layanan</h3>
          <div className="h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={serviceData}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} />
                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fontSize: 12 }} />
                <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 12 }} />
                <Tooltip 
                  cursor={{ fill: '#f8fafc' }}
                  contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)' }}
                />
                <Bar dataKey="total" fill="#6366f1" radius={[4, 4, 0, 0]} name="Total Pendaftar" />
                <Bar dataKey="completed" fill="#10b981" radius={[4, 4, 0, 0]} name="Selesai" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Hourly Trend */}
        <div className="bg-white p-8 rounded-3xl border border-slate-100 shadow-sm">
          <h3 className="text-lg font-bold text-slate-800 mb-8">Tren Kunjungan (Jam)</h3>
          <div className="h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={hourlyTrend}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} />
                <XAxis dataKey="hour" axisLine={false} tickLine={false} tick={{ fontSize: 12 }} />
                <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 12 }} />
                <Tooltip 
                  contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)' }}
                />
                <Line type="monotone" dataKey="count" stroke="#6366f1" strokeWidth={3} dot={{ r: 4, fill: '#6366f1' }} name="Jumlah Antrian" />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Ticket Status Pie Chart */}
        <div className="bg-white p-8 rounded-3xl border border-slate-100 shadow-sm">
          <h3 className="text-lg font-bold text-slate-800 mb-8">Komposisi Status</h3>
          <div className="h-[300px] flex items-center justify-center">
            {statusData.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={statusData}
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={100}
                    paddingAngle={5}
                    dataKey="value"
                  >
                    {statusData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip 
                    contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)' }}
                  />
                </PieChart>
              </ResponsiveContainer>
            ) : (
              <p className="text-slate-400">Belum ada data status</p>
            )}
          </div>
          <div className="flex justify-center space-x-6 mt-4">
            {statusData.map((d, i) => (
              <div key={d.name} className="flex items-center space-x-2">
                <div className="w-3 h-3 rounded-full" style={{ backgroundColor: COLORS[i % COLORS.length] }}></div>
                <span className="text-xs text-slate-600 font-medium">{d.name}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Service Comparison */}
        <div className="bg-white p-8 rounded-3xl border border-slate-100 shadow-sm">
          <h3 className="text-lg font-bold text-slate-800 mb-8">Detail Per Layanan</h3>
          <div className="space-y-4">
            {serviceData.map((item, idx) => (
              <div key={item.name} className="space-y-1">
                <div className="flex justify-between text-sm">
                  <span className="font-semibold text-slate-700">{item.name}</span>
                  <span className="text-slate-500">{item.completed}/{item.total}</span>
                </div>
                <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden">
                  <div 
                    className="h-full bg-indigo-600 rounded-full transition-all duration-1000"
                    style={{ width: `${item.total > 0 ? (item.completed / item.total) * 100 : 0}%` }}
                  ></div>
                </div>
              </div>
            ))}
          </div>
          <div className="mt-8 p-4 bg-indigo-50 rounded-2xl border border-indigo-100 text-sm text-indigo-700">
            <i className="fas fa-info-circle mr-2"></i>
            Data diperbarui secara real-time berdasarkan aktivitas admin dan pelanggan.
          </div>
        </div>
      </div>
    </div>
  );
};

export default AnalyticsView;
