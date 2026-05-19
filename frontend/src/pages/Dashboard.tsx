import { useEffect, useState } from "react"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Users, Droplet, Activity, AlertTriangle } from "lucide-react"
import { Bar, BarChart, ResponsiveContainer, XAxis, YAxis, Tooltip, CartesianGrid } from "recharts"

const initialData = [
  { name: "A+", amount: 120 },
  { name: "A-", amount: 45 },
  { name: "B+", amount: 150 },
  { name: "B-", amount: 30 },
  { name: "AB+", amount: 80 },
  { name: "AB-", amount: 20 },
  { name: "O+", amount: 200 },
  { name: "O-", amount: 60 },
]

export default function Dashboard() {
  const [stats, setStats] = useState({
    total_donors: 0,
    available_blood_units: 0,
    pending_requests: 0,
    expiring_soon: 0
  })

  // Mock fetching from our FastAPI backend
  useEffect(() => {
    // In reality, this would be: axios.get('/api/v1/dashboard/stats')
    // Simulating response for demonstration
    setTimeout(() => {
      setStats({
        total_donors: 1245,
        available_blood_units: 705,
        pending_requests: 12,
        expiring_soon: 34
      })
    }, 500)
  }, [])

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-3xl font-bold tracking-tight">Dashboard Overview</h2>
        <p className="text-muted-foreground">Monitor real-time blood inventory and activities.</p>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Active Donors</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.total_donors.toLocaleString()}</div>
            <p className="text-xs text-muted-foreground">+4% from last month</p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Available Units (ml)</CardTitle>
            <Droplet className="h-4 w-4 text-destructive" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.available_blood_units.toLocaleString()}</div>
            <p className="text-xs text-muted-foreground">Safe stock level maintained</p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Pending Requests</CardTitle>
            <Activity className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.pending_requests}</div>
            <p className="text-xs text-muted-foreground">3 emergency priorities</p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Expiring Soon</CardTitle>
            <AlertTriangle className="h-4 w-4 text-amber-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-amber-600">{stats.expiring_soon}</div>
            <p className="text-xs text-muted-foreground">Units expiring in next 7 days</p>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-4 md:grid-cols-7 lg:grid-cols-7">
        <Card className="col-span-4">
          <CardHeader>
            <CardTitle>Blood Inventory Status</CardTitle>
            <CardDescription>Available units grouped by blood type.</CardDescription>
          </CardHeader>
          <CardContent className="pl-2">
            <div className="h-[300px]">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={initialData}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="hsl(var(--border))" />
                  <XAxis 
                    dataKey="name" 
                    stroke="hsl(var(--muted-foreground))" 
                    fontSize={12} 
                    tickLine={false} 
                    axisLine={false} 
                  />
                  <YAxis 
                    stroke="hsl(var(--muted-foreground))" 
                    fontSize={12} 
                    tickLine={false} 
                    axisLine={false} 
                    tickFormatter={(value) => `${value}`} 
                  />
                  <Tooltip 
                    cursor={{ fill: 'hsl(var(--muted))' }}
                    contentStyle={{ borderRadius: '8px', border: '1px solid hsl(var(--border))', backgroundColor: 'hsl(var(--background))' }}
                  />
                  <Bar dataKey="amount" fill="hsl(var(--primary))" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        <Card className="col-span-3">
          <CardHeader>
            <CardTitle>Recent Emergency Requests</CardTitle>
            <CardDescription>Urgent blood requirements from hospitals.</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-8">
              {[
                { hospital: "Apollo City Hospital", blood: "O-", units: 3, time: "10 mins ago" },
                { hospital: "St. Mary's General", blood: "AB+", units: 2, time: "1 hour ago" },
                { hospital: "City Care Clinic", blood: "A-", units: 1, time: "3 hours ago" }
              ].map((req, i) => (
                <div key={i} className="flex items-center">
                  <div className="flex h-9 w-9 items-center justify-center rounded-full bg-destructive/10 text-destructive font-bold">
                    {req.blood}
                  </div>
                  <div className="ml-4 space-y-1">
                    <p className="text-sm font-medium leading-none">{req.hospital}</p>
                    <p className="text-sm text-muted-foreground">
                      Requested {req.units} units
                    </p>
                  </div>
                  <div className="ml-auto font-medium text-xs text-muted-foreground">
                    {req.time}
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
