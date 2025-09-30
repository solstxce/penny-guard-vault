import { NavLink, useLocation } from "react-router-dom";
import { Home, Receipt, Calendar, Settings, LogOut } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/contexts/AuthContext";
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarProvider,
  SidebarTrigger,
  useSidebar,
} from "@/components/ui/sidebar";

const navItems = [
  { path: "/", icon: Home, label: "Dashboard" },
  { path: "/expenses", icon: Receipt, label: "Expenses" },
  { path: "/recurring", icon: Calendar, label: "Recurring" },
  { path: "/settings", icon: Settings, label: "Settings" },
];

function AppSidebar() {
  const { state } = useSidebar();
  const location = useLocation();
  const { logout } = useAuth();
  const collapsed = state === "collapsed";

  return (
    <Sidebar className={collapsed ? "w-14" : "w-60"} collapsible="icon">
      <SidebarContent>
        <div className="p-4 border-b">
          <h1 className={`font-bold text-primary ${collapsed ? "text-sm text-center" : "text-xl"}`}>
            {collapsed ? "ET" : "ExpenseTracker"}
          </h1>
        </div>

        <SidebarGroup>
          <SidebarGroupLabel>Navigation</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {navItems.map((item) => {
                const Icon = item.icon;
                const isActive = location.pathname === item.path;
                return (
                  <SidebarMenuItem key={item.path}>
                    <SidebarMenuButton asChild>
                      <NavLink
                        to={item.path}
                        end
                        className={({ isActive }) =>
                          isActive
                            ? "bg-accent text-accent-foreground font-medium"
                            : "hover:bg-muted/50"
                        }
                      >
                        <Icon className="h-4 w-4" />
                        {!collapsed && <span>{item.label}</span>}
                      </NavLink>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                );
              })}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

        <div className="mt-auto p-4 border-t">
          <Button
            variant="ghost"
            size={collapsed ? "icon" : "default"}
            className="w-full justify-start"
            onClick={logout}
          >
            <LogOut className={collapsed ? "h-5 w-5" : "h-4 w-4 mr-2"} />
            {!collapsed && <span>Logout</span>}
          </Button>
        </div>
      </SidebarContent>
    </Sidebar>
  );
}

export default function Layout({ children }: { children: React.ReactNode }) {
  return (
    <SidebarProvider>
      <div className="min-h-screen flex w-full bg-background">
        <AppSidebar />
        <main className="flex-1 flex flex-col">
          <header className="sticky top-0 z-50 border-b bg-card/95 backdrop-blur supports-[backdrop-filter]:bg-card/60">
            <div className="flex h-16 items-center px-6">
              <SidebarTrigger />
            </div>
          </header>
          <div className="flex-1 p-6">{children}</div>
        </main>
      </div>
    </SidebarProvider>
  );
}
