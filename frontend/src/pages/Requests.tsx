import { useState, useEffect } from "react"
import axios from "axios"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { Modal } from "@/components/ui/modal"
import { Select } from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"
import { PlusCircle, Search } from "lucide-react"

export default function Requests() {
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [searchTerm, setSearchTerm] = useState("")
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [notification, setNotification] = useState<{message: string, type: 'error' | 'success'} | null>(null)
  
  const [statusFilter, setStatusFilter] = useState("All")
  const [priorityFilter, setPriorityFilter] = useState("All")
  const [sortBy, setSortBy] = useState("Newest")
  
  const [requests, setRequests] = useState<any[]>([])

  const fetchRequests = async () => {
    try {
      const response = await axios.get("http://127.0.0.1:8000/api/v1/requests")
      setRequests(response.data)
    } catch (error) {
      console.error("Error fetching requests:", error)
    }
  }

  useEffect(() => {
    fetchRequests()
  }, [])

  // Form State
  const [formData, setFormData] = useState({
    hospitalName: "",
    bloodGroup: "A+",
    units: 1,
    priority: "Medium",
    requiredDate: "",
    reason: "",
  })

  const handleSubmitRequest = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)
    
    try {
      await axios.post("http://127.0.0.1:8000/api/v1/requests", formData)
      await fetchRequests()
      setIsSubmitting(false)
      setIsModalOpen(false)
      showNotification("Request created successfully!", "success")
      
      // Reset Form
      setFormData({
        hospitalName: "", bloodGroup: "A+", units: 1, priority: "Medium", requiredDate: "", reason: ""
      })
    } catch (error) {
      console.error("Error creating request:", error)
      setIsSubmitting(false)
      showNotification("Failed to create request. Please try again.", "error")
    }
  }

  const showNotification = (message: string, type: 'error' | 'success') => {
    setNotification({ message, type })
    setTimeout(() => setNotification(null), 4000)
  }

  const getPriorityBadge = (priority: string) => {
    switch(priority) {
      case 'Emergency': return 'destructive'
      case 'High': return 'warning'
      case 'Medium': return 'default'
      default: return 'secondary'
    }
  }
  
  const getStatusBadge = (status: string) => {
    switch(status) {
      case 'Completed': return 'success'
      case 'Approved': return 'default'
      case 'Pending': return 'warning'
      case 'Denied': return 'destructive'
      default: return 'outline'
    }
  }

  const handleAction = async (id: number, newStatus: string) => {
    try {
      await axios.patch(`http://127.0.0.1:8000/api/v1/requests/${id}/status`, { status: newStatus })
      await fetchRequests()
      if (newStatus === 'Approved') showNotification("Request successfully approved and units allocated!", "success")
    } catch (error: any) {
      console.error("Error updating request status:", error)
      const errorMsg = error.response?.data?.detail || "Failed to update status. If accepting, you might be out of inventory!"
      showNotification(errorMsg, "error")
    }
  }

  let filteredRequests = requests.filter(r => r.hospital.toLowerCase().includes(searchTerm.toLowerCase()))

  if (statusFilter !== "All") {
    filteredRequests = filteredRequests.filter(r => r.status === statusFilter)
  }
  if (priorityFilter !== "All") {
    filteredRequests = filteredRequests.filter(r => r.priority === priorityFilter)
  }

  filteredRequests.sort((a, b) => {
    if (sortBy === "Newest") return b.id - a.id
    if (sortBy === "Oldest") return a.id - b.id
    if (sortBy === "Required Date") return new Date(a.date).getTime() - new Date(b.date).getTime()
    return 0
  })

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Blood Requests</h2>
          <p className="text-muted-foreground">Manage incoming hospital requests and approvals.</p>
        </div>
        <Button onClick={() => setIsModalOpen(true)} className="flex items-center gap-2">
          <PlusCircle className="h-4 w-4" />
          Create Request
        </Button>
      </div>

      <div className="flex flex-col md:flex-row items-center gap-4">
        <div className="flex items-center gap-2 w-full max-w-sm relative">
          <Search className="h-4 w-4 text-muted-foreground absolute left-3" />
          <Input 
            placeholder="Search hospitals..." 
            className="pl-9 w-full"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        <div className="flex items-center gap-2 w-full md:w-auto overflow-x-auto pb-1 md:pb-0">
          <Select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)}>
            <option value="All">All Statuses</option>
            <option value="Pending">Pending</option>
            <option value="Approved">Approved</option>
            <option value="Completed">Completed</option>
            <option value="Denied">Denied</option>
          </Select>
          <Select value={priorityFilter} onChange={(e) => setPriorityFilter(e.target.value)}>
            <option value="All">All Priorities</option>
            <option value="Emergency">Emergency</option>
            <option value="High">High</option>
            <option value="Medium">Medium</option>
            <option value="Low">Low</option>
          </Select>
          <Select value={sortBy} onChange={(e) => setSortBy(e.target.value)}>
            <option value="Newest">Newest Request</option>
            <option value="Oldest">Oldest Request</option>
            <option value="Required Date">Urgency (Date)</option>
          </Select>
        </div>
      </div>

      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Req ID</TableHead>
            <TableHead>Hospital</TableHead>
            <TableHead>Blood Group</TableHead>
            <TableHead>Units</TableHead>
            <TableHead>Priority</TableHead>
            <TableHead>Required Date</TableHead>
            <TableHead>Status</TableHead>
            <TableHead className="text-right">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {filteredRequests.map((req) => (
            <TableRow key={req.id}>
              <TableCell className="font-medium">#{req.id}</TableCell>
              <TableCell>{req.hospital}</TableCell>
              <TableCell>
                <Badge variant="outline" className="bg-destructive/10 text-destructive">{req.bloodGroup}</Badge>
              </TableCell>
              <TableCell>{req.units}</TableCell>
              <TableCell>
                <Badge variant={getPriorityBadge(req.priority) as any}>{req.priority}</Badge>
              </TableCell>
              <TableCell>{req.date}</TableCell>
              <TableCell>
                <Badge variant={getStatusBadge(req.status) as any}>{req.status}</Badge>
              </TableCell>
              <TableCell className="text-right">
                <div className="flex justify-end gap-2">
                  {req.status === 'Pending' && (
                    <>
                      <Button variant="outline" size="sm" onClick={() => handleAction(req.id, 'Approved')}>Accept</Button>
                      <Button variant="ghost" size="sm" className="text-destructive hover:text-destructive hover:bg-destructive/10" onClick={() => handleAction(req.id, 'Denied')}>Deny</Button>
                    </>
                  )}
                  {req.status === 'Approved' && (
                    <Button variant="default" size="sm" onClick={() => handleAction(req.id, 'Completed')}>Fulfill</Button>
                  )}
                  {(req.status === 'Completed' || req.status === 'Denied') && (
                    <span className="text-sm text-muted-foreground px-2 py-1">Done</span>
                  )}
                </div>
              </TableCell>
            </TableRow>
          ))}
          {filteredRequests.length === 0 && (
            <TableRow>
              <TableCell colSpan={8} className="text-center h-24 text-muted-foreground">
                No requests found.
              </TableCell>
            </TableRow>
          )}
        </TableBody>
      </Table>

      <Modal 
        isOpen={isModalOpen} 
        onClose={() => setIsModalOpen(false)}
        title="Create Blood Request"
        description="Submit an urgent or scheduled blood requirement for a hospital."
      >
        <form onSubmit={handleSubmitRequest} className="space-y-6">
          <div className="space-y-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">Hospital Name</label>
              <Input required value={formData.hospitalName} onChange={e => setFormData({...formData, hospitalName: e.target.value})} />
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="text-sm font-medium">Blood Group</label>
                <Select value={formData.bloodGroup} onChange={e => setFormData({...formData, bloodGroup: e.target.value})}>
                  {['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'].map(bg => (
                    <option key={bg} value={bg}>{bg}</option>
                  ))}
                </Select>
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">Units Needed</label>
                <Input type="number" min="1" required value={formData.units} onChange={e => setFormData({...formData, units: parseInt(e.target.value)})} />
              </div>
              
              <div className="space-y-2">
                <label className="text-sm font-medium">Priority</label>
                <Select value={formData.priority} onChange={e => setFormData({...formData, priority: e.target.value})}>
                  <option value="Low">Low</option>
                  <option value="Medium">Medium</option>
                  <option value="High">High</option>
                  <option value="Emergency">Emergency</option>
                </Select>
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">Required Date</label>
                <Input type="date" required value={formData.requiredDate} onChange={e => setFormData({...formData, requiredDate: e.target.value})} />
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">Reason for Request</label>
              <Textarea rows={3} required value={formData.reason} onChange={e => setFormData({...formData, reason: e.target.value})} placeholder="e.g. Scheduled surgery, trauma case..." />
            </div>
          </div>

          <div className="flex justify-end gap-3 pt-4 border-t">
            <Button type="button" variant="outline" onClick={() => setIsModalOpen(false)}>Cancel</Button>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? "Submitting..." : "Submit Request"}
            </Button>
          </div>
        </form>
      </Modal>

      {/* Floating Toast Notification */}
      {notification && (
        <div className={`fixed bottom-6 right-6 z-50 flex items-center gap-3 px-6 py-4 rounded-xl shadow-2xl transition-all duration-300 animate-in slide-in-from-bottom-5 ${notification.type === 'error' ? 'bg-destructive text-destructive-foreground' : 'bg-green-600 text-white'}`}>
          <div className={`flex h-8 w-8 items-center justify-center rounded-full bg-white/20`}>
            {notification.type === 'error' ? (
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" /></svg>
            ) : (
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" /></svg>
            )}
          </div>
          <div>
            <h4 className="font-bold">{notification.type === 'error' ? 'Action Failed' : 'Success'}</h4>
            <p className="text-sm opacity-90">{notification.message}</p>
          </div>
        </div>
      )}
    </div>
  )
}
