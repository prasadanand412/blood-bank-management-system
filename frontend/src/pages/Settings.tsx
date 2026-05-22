import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Moon, Sun, Download, Save, Bell, ShieldAlert, Clock } from "lucide-react"
import axios from "axios"

export default function Settings() {
  const [darkMode, setDarkMode] = useState(false)
  const [emailAlerts, setEmailAlerts] = useState(true)
  const [lowStockThreshold, setLowStockThreshold] = useState("10")
  const [expiryDays, setExpiryDays] = useState("35")
  const [isSaving, setIsSaving] = useState(false)

  // Load from local storage on mount
  useEffect(() => {
    const isDark = localStorage.getItem("theme") === "dark"
    setDarkMode(isDark)
    
    const savedEmail = localStorage.getItem("setting_email_alerts")
    if (savedEmail !== null) setEmailAlerts(savedEmail === "true")
    
    const savedStock = localStorage.getItem("setting_low_stock")
    if (savedStock !== null) setLowStockThreshold(savedStock)
    
    const savedExpiry = localStorage.getItem("setting_expiry_days")
    if (savedExpiry !== null) setExpiryDays(savedExpiry)
  }, [])

  // Handle Dark Mode toggle
  const toggleDarkMode = (checked: boolean) => {
    setDarkMode(checked)
    if (checked) {
      document.documentElement.classList.add("dark")
      localStorage.setItem("theme", "dark")
    } else {
      document.documentElement.classList.remove("dark")
      localStorage.setItem("theme", "light")
    }
  }

  // Handle Save Preferences
  const handleSave = () => {
    setIsSaving(true)
    localStorage.setItem("setting_email_alerts", emailAlerts.toString())
    localStorage.setItem("setting_low_stock", lowStockThreshold)
    localStorage.setItem("setting_expiry_days", expiryDays)
    
    setTimeout(() => {
      setIsSaving(false)
      alert("Settings saved successfully!")
    }, 600)
  }

  // Handle CSV Export
  const exportInventory = async () => {
    try {
      const response = await axios.get("http://127.0.0.1:8000/api/v1/inventory/units")
      const units = response.data
      
      if (units.length === 0) {
        alert("No inventory data to export.")
        return
      }

      // Convert JSON to CSV
      const headers = ["ID", "Unit Number", "Blood Group", "Quantity (ml)", "Collection Date", "Expiry Date", "Status"]
      const csvRows = []
      csvRows.push(headers.join(","))
      
      units.forEach((u: any) => {
        const row = [
          u.id, 
          u.unit_number, 
          u.blood_group, 
          u.quantity_ml, 
          u.collection_date, 
          u.expiry_date, 
          u.status
        ]
        csvRows.push(row.join(","))
      })

      const csvString = csvRows.join("\n")
      const blob = new Blob([csvString], { type: "text/csv" })
      const url = window.URL.createObjectURL(blob)
      const a = document.createElement("a")
      a.setAttribute("hidden", "")
      a.setAttribute("href", url)
      a.setAttribute("download", `blood_inventory_${new Date().toISOString().split('T')[0]}.csv`)
      document.body.appendChild(a)
      a.click()
      document.body.removeChild(a)
    } catch (error) {
      console.error("Export failed", error)
      alert("Failed to export data. Make sure backend is running.")
    }
  }

  return (
    <div className="space-y-6 max-w-4xl mx-auto pb-10">
      <div>
        <h2 className="text-3xl font-bold tracking-tight">Settings</h2>
        <p className="text-muted-foreground">Manage your dashboard preferences and system configurations.</p>
      </div>

      <div className="grid gap-6">
        {/* UI & Display */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              {darkMode ? <Moon className="h-5 w-5" /> : <Sun className="h-5 w-5" />}
              Appearance
            </CardTitle>
            <CardDescription>Customize how the dashboard looks on your device.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <label className="text-base font-medium">Dark Mode</label>
                <p className="text-sm text-muted-foreground">Switch to a darker, eye-friendly theme.</p>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input 
                  type="checkbox" 
                  checked={darkMode} 
                  onChange={(e) => toggleDarkMode(e.target.checked)} 
                  className="sr-only peer"
                />
                <div className="w-11 h-6 bg-muted peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary/80 dark:peer-checked:bg-primary/50"></div>
              </label>
            </div>
          </CardContent>
        </Card>

        {/* System Configurations */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <ShieldAlert className="h-5 w-5" />
              System Thresholds
            </CardTitle>
            <CardDescription>Configure global parameters for the blood bank (Saved Locally).</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="grid gap-2">
              <label htmlFor="low-stock" className="text-base font-medium flex items-center gap-2">
                <Activity className="h-4 w-4" /> Low Stock Warning Level (Units)
              </label>
              <p className="text-sm text-muted-foreground mb-1">Alerts will trigger if a blood group falls below this amount.</p>
              <Input 
                id="low-stock" 
                type="number" 
                className="max-w-xs" 
                value={lowStockThreshold} 
                onChange={(e) => setLowStockThreshold(e.target.value)} 
              />
            </div>
            
            <div className="grid gap-2 border-t pt-4">
              <label htmlFor="expiry-days" className="text-base font-medium flex items-center gap-2">
                <Clock className="h-4 w-4" /> Default Expiry Duration (Days)
              </label>
              <p className="text-sm text-muted-foreground mb-1">Standard shelf-life applied to newly registered donations.</p>
              <Input 
                id="expiry-days" 
                type="number" 
                className="max-w-xs" 
                value={expiryDays} 
                onChange={(e) => setExpiryDays(e.target.value)} 
              />
            </div>
          </CardContent>
        </Card>

        {/* Notifications */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Bell className="h-5 w-5" />
              Notifications
            </CardTitle>
            <CardDescription>Manage how you receive alerts.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <label className="text-base font-medium">Emergency Email Alerts</label>
                <p className="text-sm text-muted-foreground">Receive instant emails when a hospital requests emergency blood.</p>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input 
                  type="checkbox" 
                  checked={emailAlerts} 
                  onChange={(e) => setEmailAlerts(e.target.checked)} 
                  className="sr-only peer"
                />
                <div className="w-11 h-6 bg-muted peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary"></div>
              </label>
            </div>
          </CardContent>
        </Card>

        {/* Data Export */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Download className="h-5 w-5" />
              Data Export
            </CardTitle>
            <CardDescription>Download system data for offline backups or analysis.</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between">
              <div className="space-y-0.5 max-w-[60%]">
                <label className="text-base font-medium">Inventory Report (.CSV)</label>
                <p className="text-sm text-muted-foreground">Generates a complete spreadsheet of all current blood bags and their statuses.</p>
              </div>
              <Button onClick={exportInventory} variant="outline" className="gap-2">
                <Download className="h-4 w-4" /> Export CSV
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Sticky Save Button */}
      <div className="flex justify-end pt-4">
        <Button onClick={handleSave} disabled={isSaving} className="gap-2 px-8">
          <Save className="h-4 w-4" /> {isSaving ? "Saving..." : "Save Preferences"}
        </Button>
      </div>
    </div>
  )
}

function Activity(props: any) {
  return (
    <svg
      {...props}
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M22 12h-4l-3 9L9 3l-3 9H2" />
    </svg>
  )
}
