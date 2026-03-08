import { Outlet, Link, useLocation } from "react-router";
import { Input } from "./ui/input";
import { Avatar, AvatarFallback } from "./ui/avatar";
import {
  LayoutDashboard,
  Upload,
  Sparkles,
  Map,
  FileText,
  BarChart3,
  Settings,
  Search,
  Bell,
  Truck,
} from "lucide-react";

const navItems = [
  { path: "/", label: "Dashboard", icon: LayoutDashboard },
  { path: "/upload", label: "Data Upload", icon: Upload },
  { path: "/cleaning", label: "Data Cleaning", icon: Sparkles },
  { path: "/lanes", label: "Lane Clustering", icon: Map },
  { path: "/rfq", label: "RFQ Generator", icon: FileText },
  { path: "/quality", label: "Data Quality", icon: BarChart3 },
  { path: "/settings", label: "Settings", icon: Settings },
];

export function DashboardLayout() {
  const location = useLocation();

  return (
    <div className="min-h-screen flex bg-background">
      {/* Sidebar */}
      <aside className="w-64 bg-sidebar text-sidebar-foreground flex flex-col">
        <div className="p-6 border-b border-sidebar-border">
          <div className="flex items-center gap-2">
            <div className="bg-sidebar-primary p-2 rounded-lg">
              <Truck className="w-5 h-5 text-sidebar-primary-foreground" />
            </div>
            <div>
              <div className="text-sm">Lane Intelligence</div>
              <div className="text-xs opacity-80">Builder Agent</div>
            </div>
          </div>
        </div>

        <nav className="flex-1 p-4 space-y-1">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = location.pathname === item.path;
            return (
              <Link
                key={item.path}
                to={item.path}
                className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${
                  isActive
                    ? "bg-sidebar-accent text-sidebar-accent-foreground"
                    : "hover:bg-sidebar-accent/50"
                }`}
              >
                <Icon className="w-5 h-5" />
                <span className="text-sm">{item.label}</span>
              </Link>
            );
          })}
        </nav>

        <div className="p-6 border-t border-sidebar-border">
          <div className="text-xs opacity-70">
            © 2026 Lane Intelligence
          </div>
        </div>
      </aside>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col">
        {/* Header */}
        <header className="h-16 bg-card border-b border-border flex items-center justify-between px-6">
          <div className="flex-1 max-w-xl">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input
                placeholder="Search shipments, lanes, carriers..."
                className="pl-10 bg-input-background"
              />
            </div>
          </div>

          <div className="flex items-center gap-4">
            <button className="p-2 hover:bg-accent rounded-lg transition-colors relative">
              <Bell className="w-5 h-5 text-foreground" />
              <span className="absolute top-1 right-1 w-2 h-2 bg-secondary rounded-full"></span>
            </button>
            <Avatar>
              <AvatarFallback className="bg-primary text-primary-foreground">
                JD
              </AvatarFallback>
            </Avatar>
          </div>
        </header>

        {/* Page Content */}
        <main className="flex-1 overflow-auto">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
