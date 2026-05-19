import { useState } from "react"
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
  
  // Dummy State for Requests
  const [requests, setRequests] = useState([
    { id: 101, hospital: "Apollo City Hospital", bloodGroup: "O-", units: 3, priority: "Emergency", status: "Pending", date: "2026-05-18" },
    { id: 102, hospital: "St. Mary's General", bloodGroup: "AB+", units: 2, priority: "High", status: "Approved", date: "2026-05-19" },
    { id: 103, hospital: "City Care Clinic", bloodGroup: "A-", units: 1, priority: "Medium", status: "Completed", date: "2026-05-15" },
  ])

  // Form State
  const [formData, setFormData] = useState({
    hospitalName: "",
    bloodGroup: "A+",
    units: 1,
    priority: "Medium",
    requiredDate: "",
    reason: "",
  })

  const handleSubmitRequest = (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)
    
    // Simulate API Call
    setTimeout(() => {
      const newRequest = {
        id: 100 + requests.length + 1,
        hospital: formData.hospitalName,
        bloodGroup: formData.bloodGroup,
        units: formData.units,
        priority: formData.priority,
        status: "Pending",
        date: formData.requiredDate,
      }
      setRequests([newRequest, ...requests])
      setIsSubmitting(false)
      setIsModalOpen(false)
      
      // Reset Form
      setFormData({
        hospitalName: "", bloodGroup: "A+", units: 1, priority: "Medium", requiredDate: "", reason: ""
      })
    }, 1000)
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
      default: return 'outline'
    }
  }

  const filteredRequests = requests.filter(r => r.hospital.toLowerCase().includes(searchTerm.toLowerCase()))

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

      <div className="flex items-center gap-2 max-w-sm">
        <Search className="h-4 w-4 text-muted-foreground absolute ml-3" />
        <Input 
          placeholder="Search hospitals..." 
          className="pl-9"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
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
                <Button variant="ghost" size="sm">Manage</Button>
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
    </div>
  )
}
