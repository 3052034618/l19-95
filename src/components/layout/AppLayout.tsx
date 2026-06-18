import { Outlet } from 'react-router-dom';
import Sidebar from './Sidebar';
import TopBar from './TopBar';

export default function AppLayout() {
  return (
    <div className="h-full w-full flex bg-monitor-bg text-slate-100">
      <Sidebar />
      <div className="flex-1 flex flex-col min-w-0 h-full">
        <TopBar />
        <main className="flex-1 overflow-auto">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
