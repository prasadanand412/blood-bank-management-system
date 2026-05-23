import { useEffect, useState } from "react"
import axios from "axios"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Select } from "@/components/ui/select"
import { Users, Droplet, Activity, AlertTriangle } from "lucide-react"
import { Bar, BarChart, ResponsiveContainer, XAxis, YAxis, Tooltip, CartesianGrid } from "recharts"

const initialData = [
  { name: "A+", amount: 120, volume: 54000 },
  { name: "A-", amount: 45, volume: 20250 },
  { name: "B+", amount: 150, volume: 67500 },
  { name: "B-", amount: 30, volume: 13500 },
  { name: "AB+", amount: 80, volume: 36000 },
  { name: "AB-", amount: 20, volume: 9000 },
  { name: "O+", amount: 200, volume: 90000 },
  { name: "O-", amount: 60, volume: 27000 },
]

export default function Dashboard() {
  const [stats, setStats] = useState({
    total_donors: 0,
    available_blood_units: 0,
    available_blood_ml: 0,
    pending_requests: 0,
    expiring_soon: 0,
    accepted_requests: 0,
    fulfilled_requests: 0
  })
  const [chartData, setChartData] = useState<any[]>([])
  const [recentRequests, setRecentRequests] = useState<any[]>([])
  const [chartMetric, setChartMetric] = useState<"units" | "ml">("units")

  useEffect(() => {
    const fetchData = async () => {
      try {
        const statsRes = await axios.get("http://127.0.0.1:8000/api/v1/dashboard/stats")
        setStats(statsRes.data)
        
        const stockRes = await axios.get("http://127.0.0.1:8000/api/v1/inventory/stock")
        const formattedStock = stockRes.data.map((item: any) => ({
          name: item.blood_group,
          amount: item.total_units,
          volume: item.total_ml
        }))
        setChartData(formattedStock.length > 0 ? formattedStock : initialData)
        
        const requestsRes = await axios.get("http://127.0.0.1:8000/api/v1/dashboard/recent-requests")
        setRecentRequests(requestsRes.data)
      } catch (error) {
        console.error("Error fetching dashboard data:", error)
        // If it fails, keep the old data instead of replacing with initialData so it doesn't flicker
      }
    }
    
    // Fetch immediately on mount
    fetchData()
    
    // Set up polling interval (every 3 seconds)
    const intervalId = setInterval(fetchData, 3000)
    
    // Cleanup interval on unmount
    return () => clearInterval(intervalId)
  }, [])

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-3xl font-bold tracking-tight">Dashboard Overview</h2>
        <p className="text-muted-foreground">Monitor real-time blood inventory and activities.</p>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
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
            <CardTitle className="text-sm font-medium">Available Inventory</CardTitle>
            <Droplet className="h-4 w-4 text-destructive" />
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 gap-4 mt-2">
              <div>
                <div className="text-2xl font-bold text-destructive">{stats.available_blood_units.toLocaleString()}</div>
                <p className="text-xs text-muted-foreground">Units available</p>
              </div>
              <div>
                <div className="text-2xl font-bold text-destructive">{stats.available_blood_ml.toLocaleString()}</div>
                <p className="text-xs text-muted-foreground">mL available</p>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Pending Requests</CardTitle>
            <Activity className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.pending_requests}</div>
            <p className="text-xs text-muted-foreground">Awaiting approval</p>
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
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Accepted Requests</CardTitle>
            <Activity className="h-4 w-4 text-primary" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.accepted_requests}</div>
            <p className="text-xs text-muted-foreground">Awaiting fulfillment</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Fulfilled Requests</CardTitle>
            <Activity className="h-4 w-4 text-success" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.fulfilled_requests}</div>
            <p className="text-xs text-muted-foreground">Successfully delivered</p>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-4 md:grid-cols-7 lg:grid-cols-7">
        <Card className="col-span-4">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <div>
              <CardTitle>Blood Inventory Status</CardTitle>
              <CardDescription>Available stock grouped by blood type.</CardDescription>
            </div>
            <select 
              className="flex h-9 rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
              value={chartMetric} 
              onChange={(e) => setChartMetric(e.target.value as "units" | "ml")}
            >
              <option value="units">In Units</option>
              <option value="ml">In mL</option>
            </select>
          </CardHeader>
          <CardContent className="pl-2">
            <div className="h-[300px]">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={chartData}>
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
                    formatter={(value: any, name: any, props: any) => {
                      if (chartMetric === "units") {
                        return [`${value} units (${props.payload.volume.toLocaleString()} mL)`, "Available"];
                      } else {
                        return [`${value.toLocaleString()} mL (${props.payload.amount} units)`, "Available"];
                      }
                    }}
                  />
                  <Bar dataKey={chartMetric === "units" ? "amount" : "volume"} fill="hsl(var(--primary))" radius={[4, 4, 0, 0]} />
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
              {recentRequests.length > 0 ? recentRequests.map((req, i) => (
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
                  <div className="ml-auto font-medium text-xs text-muted-foreground text-right">
                    {new Date(req.time).toLocaleDateString()}<br/>
                    {new Date(req.time).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
                  </div>
                </div>
              )) : (
                <div className="text-center text-muted-foreground py-8">
                  No recent emergency requests.
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
