import React from 'react';
import { 
  CalendarCheck, 
  MessageSquare, 
  Eye,
  TrendingUp,
  Clock,
  CheckCircle2,
  AlertCircle,
  XCircle
} from 'lucide-react';
import { checkAuth } from '../../actions/auth';
import { getDashboardData } from '../../actions/bookings';

export default async function AdminDashboard() {
  const { fullname } = await checkAuth();
  const { activeCount, pendingCount, recentActivities } = await getDashboardData();

  const stats = [
    { title: 'Aktív foglalások', value: `${activeCount} db`, change: 'Aktív és jövőbeli', icon: CalendarCheck, color: 'text-emerald-600 bg-emerald-50 border-emerald-100' },
    { title: 'Ajánlatkérések', value: `${pendingCount} db`, change: 'Megválaszolásra vár', icon: MessageSquare, color: 'text-amber-600 bg-amber-50 border-amber-100' },
    { title: 'Havi látogatók', value: '1,240', change: '+12.4% vs előző hónap', icon: Eye, color: 'text-purple-600 bg-purple-50 border-purple-100' },
  ];

  return (
    <div className="space-y-8 animate-fade-in">
      {/* Header for mobile view */}
      <div className="md:hidden">
        <h1 className="text-2xl font-serif font-bold text-stone-800">Áttekintés</h1>
        <p className="text-sm text-stone-500">Üdvözöljük a Gadányi Vendégház adminisztrációs felületén!</p>
      </div>

      {/* Greeting Banner */}
      <div className="bg-emerald-950 text-white rounded-2xl p-6 md:p-8 shadow-sm flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h2 className="text-xl md:text-2xl font-serif font-semibold">Üdvözöljük, {fullname || 'Admin'}! 👋</h2>
          <p className="text-emerald-200 text-sm mt-1">Itt kezelheti a vendégház foglalásait és az oldal beállításait.</p>
        </div>
        <div className="flex gap-2">
          <span className="text-xs bg-emerald-800/80 text-emerald-100 px-3 py-1.5 rounded-full font-medium flex items-center gap-1.5">
            <Clock size={12} /> Rendszer státusz: Aktív
          </span>
        </div>
      </div>

      {/* Grid of stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {stats.map((stat, idx) => {
          const Icon = stat.icon;
          return (
            <div key={idx} className="bg-white p-6 rounded-2xl border border-stone-200 shadow-sm flex flex-col justify-between min-h-[140px] hover:shadow-md transition-shadow">
              <div className="flex justify-between items-start">
                <span className="text-sm font-medium text-stone-500">{stat.title}</span>
                <div className={`p-3 rounded-xl border ${stat.color}`}>
                  <Icon size={20} />
                </div>
              </div>
              <div className="mt-4">
                <span className="text-2xl md:text-3xl font-bold tracking-tight text-stone-800">{stat.value}</span>
                <div className="flex items-center gap-1 mt-1 text-xs text-stone-500">
                  <TrendingUp size={12} className="text-emerald-600" />
                  <span>{stat.change}</span>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Main dashboard content area */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left 2 columns - Activity stream */}
        <div className="lg:col-span-2 bg-white rounded-2xl border border-stone-200 shadow-sm p-6 md:p-8 space-y-6">
          <div className="flex justify-between items-center pb-4 border-b border-stone-100">
            <h3 className="text-lg font-semibold text-stone-800">Legutóbbi aktivitások</h3>
            <a href="/admin/bookings" className="text-xs font-medium text-emerald-600 hover:text-emerald-700 hover:underline">Összes megtekintése</a>
          </div>

          <div className="flow-root">
            {recentActivities.length === 0 ? (
              <p className="text-sm text-stone-400 py-8 text-center bg-stone-50 rounded-xl border border-dashed border-stone-200">Nincs legutóbbi aktivitás.</p>
            ) : (
              <ul className="-mb-8">
                {recentActivities.map((activity, activityIdx) => (
                  <li key={activity.id}>
                    <div className="relative pb-8">
                      {activityIdx !== recentActivities.length - 1 ? (
                        <span className="absolute top-5 left-5 -ml-px h-full w-0.5 bg-stone-200" aria-hidden="true" />
                      ) : null}
                      <div className="relative flex items-start space-x-3">
                        <div className="relative">
                          <div className={`
                            h-10 w-10 rounded-full flex items-center justify-center ring-8 ring-white
                            ${activity.status === 'new' ? 'bg-amber-100 text-amber-700' : ''}
                            ${activity.status === 'completed' ? 'bg-emerald-100 text-emerald-700' : ''}
                            ${activity.status === 'rejected' ? 'bg-red-100 text-red-700' : ''}
                            ${activity.status === 'info' ? 'bg-blue-100 text-blue-700' : ''}
                          `}>
                            {activity.status === 'new' && <AlertCircle size={18} />}
                            {activity.status === 'completed' && <CheckCircle2 size={18} />}
                            {activity.status === 'rejected' && <XCircle size={18} />}
                            {activity.status === 'info' && <Clock size={18} />}
                          </div>
                        </div>
                        <div className="min-w-0 flex-1 py-1.5">
                          <div className="text-sm font-medium text-stone-800">
                            {activity.title}
                          </div>
                          <p className="text-sm text-stone-500 mt-0.5">{activity.description}</p>
                          <span className="text-xs text-stone-400 mt-1 block">{activity.time}</span>
                        </div>
                      </div>
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </div>

        {/* Right column - Quick links / actions */}
        <div className="space-y-8">
          <div className="bg-white rounded-2xl border border-stone-200 shadow-sm p-6 space-y-4">
            <h3 className="text-base font-semibold text-stone-800 pb-2 border-b border-stone-100">Gyors műveletek</h3>
            <div className="grid grid-cols-1 gap-2">
              <a href="/admin/bookings" className="flex items-center justify-between p-3 rounded-xl hover:bg-stone-50 border border-transparent hover:border-stone-200 text-sm font-medium text-stone-700 transition">
                <span>Foglalási naptár ellenőrzése</span>
                <span className="text-stone-400">→</span>
              </a>
              <a href="/admin/settings" className="flex items-center justify-between p-3 rounded-xl hover:bg-stone-50 border border-transparent hover:border-stone-200 text-sm font-medium text-stone-700 transition">
                <span>Admin jelszó módosítása</span>
                <span className="text-stone-400">→</span>
              </a>
            </div>
          </div>

          <div className="bg-emerald-50/50 rounded-2xl border border-emerald-100 shadow-sm p-6 text-center space-y-3">
            <h4 className="text-sm font-semibold text-emerald-900">Segítségre van szüksége?</h4>
            <p className="text-xs text-emerald-800/80 leading-relaxed">Ha problémát tapasztal a foglalásokkal kapcsolatban, vegye fel a kapcsolatot a fejlesztővel.</p>
            <a href="mailto:support@example.com" className="inline-block text-xs font-semibold text-emerald-700 hover:text-emerald-800 bg-white border border-emerald-200 px-4 py-2 rounded-xl shadow-sm transition">
              Kapcsolatfelvétel
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}
