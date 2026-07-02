import { useState, useEffect } from 'react';
import { Outlet } from 'react-router-dom';
import { Sidebar } from './Sidebar.jsx';
import { Topbar } from './Topbar.jsx';
import { useUiStore } from '../../../core/store/uiStore.js';
import { useWorkspaceStore } from '../../../core/store/workspaceStore.js';
import { useWorkspaceSocket } from '../../../core/hooks/useWorkspaceSocket.js';

export function AppShell() {
  const { isSidebarOpen, toggleSidebar } = useUiStore();
  const { currentWorkspace } = useWorkspaceStore();
  const [isMobile, setIsMobile] = useState(false);

  useWorkspaceSocket(currentWorkspace?.id ?? currentWorkspace?._id);

  useEffect(() => {
    const check = () => setIsMobile(window.innerWidth < 768);
    check();
    window.addEventListener('resize', check);
    return () => window.removeEventListener('resize', check);
  }, []);

  return (
    <div className="flex h-screen overflow-hidden bg-background">
      <Sidebar isMobile={isMobile} />

      {isMobile && isSidebarOpen && (
        <div
          className="fixed inset-0 z-20 bg-black/50"
          onClick={toggleSidebar}
        />
      )}

      <div className="flex flex-col flex-1 overflow-hidden">
        <Topbar />
        <main className="flex-1 overflow-y-auto">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
