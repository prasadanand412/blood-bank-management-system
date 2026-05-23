import { Outlet, Link, useLocation } from "react-router-dom"
import { Activity, LayoutDashboard, Users, Droplet, FileText, Settings, LogOut, Bell, AlertTriangle } from "lucide-react"
import { useState, useEffect } from "react"
import axios from "axios"

export default function DashboardLayout() {
  const location = useLocation()
  const [alertCount, setAlertCount] = useState(0)
  const [stats, setStats] = useState<any>(null)
  const [isNotificationsOpen, setIsNotificationsOpen] = useState(false)

  useEffect(() => {
    // Fetch live dashboard stats to populate the alert count (low stock + pending emergency requests)
    const fetchAlerts = async () => {
      try {
        const response = await axios.get("http://127.0.0.1:8000/api/v1/dashboard/stats")
        const newStats = response.data
        setStats(newStats)
        // Calculate alerts: pending requests + expiring soon units
        setAlertCount(newStats.pending_requests + newStats.expiring_soon)
      } catch (error) {
        console.error("Failed to fetch alerts", error)
      }
    }
    
    fetchAlerts()
    const interval = setInterval(fetchAlerts, 30000) // update every 30s
    return () => clearInterval(interval)
  }, [])
  
  const navItems = [
    { icon: LayoutDashboard, label: "Dashboard", path: "/dashboard" },
    { icon: Users, label: "Donors", path: "/dashboard/donors" },
    { icon: Droplet, label: "Inventory", path: "/dashboard/inventory" },
    { icon: FileText, label: "Requests", path: "/dashboard/requests" },
    { icon: Settings, label: "Settings", path: "/dashboard/settings" },
  ]

  return (
    <div className="flex min-h-screen w-full bg-muted/40">
      {/* Sidebar */}
      <aside className="fixed inset-y-0 left-0 z-10 hidden w-64 flex-col border-r bg-background sm:flex">
        <div className="flex h-14 items-center border-b px-6 lg:h-[60px]">
          <Link to="/" className="flex items-center gap-2 font-semibold text-primary">
            <Activity className="h-6 w-6" />
            <span className="text-lg">BloodBank Pro</span>
          </Link>
        </div>
        <div className="flex-1 overflow-auto py-4">
          <nav className="grid items-start px-4 text-sm font-medium gap-1">
            {navItems.map((item) => {
              const isActive = location.pathname === item.path
              return (
                <Link
                  key={item.path}
                  to={item.path}
                  className={`flex items-center gap-3 rounded-lg px-3 py-2 transition-all ${
                    isActive 
                      ? "bg-primary text-primary-foreground" 
                      : "text-muted-foreground hover:bg-muted hover:text-foreground"
                  }`}
                >
                  <item.icon className="h-4 w-4" />
                  {item.label}
                </Link>
              )
            })}
          </nav>
        </div>
        <div className="mt-auto p-4 border-t">
          <Link
            to="/"
            className="flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium text-muted-foreground transition-all hover:bg-destructive/10 hover:text-destructive"
          >
            <LogOut className="h-4 w-4" />
            Sign out
          </Link>
        </div>
      </aside>

      {/* Main Content */}
      <div className="flex flex-col sm:pl-64 w-full">
        <header className="sticky top-0 z-30 flex h-14 items-center gap-4 border-b bg-background px-6 lg:h-[60px]">
          <div className="flex-1 flex justify-end">
            <div className="flex items-center gap-4">
              <div className="relative">
                <button 
                  className="relative text-muted-foreground hover:text-foreground p-1"
                  onClick={() => setIsNotificationsOpen(!isNotificationsOpen)}
                >
                  <Bell className="h-5 w-5" />
                  {alertCount > 0 && (
                    <span className="absolute top-0 right-0 flex h-4 w-4 items-center justify-center rounded-full bg-destructive text-[10px] text-destructive-foreground font-bold">
                      {alertCount}
                    </span>
                  )}
                </button>
                
                {isNotificationsOpen && (
                  <div className="absolute right-0 mt-2 w-80 rounded-md border bg-background p-4 shadow-lg flex flex-col gap-3 z-50 animate-in slide-in-from-top-2">
                    <h4 className="font-semibold text-sm border-b pb-2">Notifications</h4>
                    {alertCount === 0 ? (
                      <p className="text-sm text-muted-foreground py-4 text-center">No new notifications</p>
                    ) : (
                      <div className="flex flex-col gap-2">
                        {stats?.pending_requests > 0 && (
                          <div className="flex items-start gap-3 rounded-lg border p-3 bg-muted/20">
                            <Activity className="h-5 w-5 text-primary mt-0.5" />
                            <div className="flex flex-col">
                              <span className="text-sm font-medium">Pending Requests</span>
                              <span className="text-xs text-muted-foreground">You have {stats.pending_requests} request(s) awaiting approval.</span>
                            </div>
                          </div>
                        )}
                        {stats?.expiring_soon > 0 && (
                          <div className="flex items-start gap-3 rounded-lg border p-3 bg-amber-500/10 border-amber-500/20">
                            <AlertTriangle className="h-5 w-5 text-amber-500 mt-0.5" />
                            <div className="flex flex-col">
                              <span className="text-sm font-medium text-amber-600">Expiring Soon</span>
                              <span className="text-xs text-muted-foreground">You have {stats.expiring_soon} unit(s) expiring within 7 days.</span>
                            </div>
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                )}
              </div>
              <div className="flex items-center gap-2">
                <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center text-primary font-bold text-sm">
                  AD
                </div>
                <div className="hidden md:block text-sm">
                  <p className="font-medium leading-none">Admin User</p>
                  <p className="text-xs text-muted-foreground">System Administrator</p>
                </div>
              </div>
            </div>
          </div>
        </header>
        
        <main className="flex-1 p-6">
          <Outlet />
        </main>
      </div>
    </div>
  )
}
