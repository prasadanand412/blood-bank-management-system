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

export default function Donors() {
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [searchTerm, setSearchTerm] = useState("")
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isViewModalOpen, setIsViewModalOpen] = useState(false)
  const [selectedDonor, setSelectedDonor] = useState<any>(null)
  const [statusFilter, setStatusFilter] = useState("All")
  const [sortBy, setSortBy] = useState("Newest")
  
  // Fetch Donors from API
  const [donors, setDonors] = useState<any[]>([])

  const fetchDonors = async () => {
    try {
      const response = await axios.get("http://127.0.0.1:8000/api/v1/donors")
      setDonors(response.data)
    } catch (error) {
      console.error("Error fetching donors:", error)
    }
  }

  useEffect(() => {
    fetchDonors()
  }, [])

  // Form State
  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    dob: "",
    gender: "Male",
    bloodGroup: "A+",
    contact: "",
    address: "",
    bloodPressure: "",
    hemoglobin: "",
    quantity: 450,
    donationDateTime: "",
  })

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)
    
    try {
      await axios.post("http://127.0.0.1:8000/api/v1/donors", formData)
      await fetchDonors()
      setIsSubmitting(false)
      setIsModalOpen(false)
      
      // Reset Form
      setFormData({
        firstName: "", lastName: "", dob: "", gender: "Male", bloodGroup: "A+",
        contact: "", address: "", bloodPressure: "", hemoglobin: "", quantity: 450, donationDateTime: "",
      })
    } catch (error) {
      console.error("Error registering donor:", error)
      setIsSubmitting(false)
    }
  }

  const handleDelete = async (id: number) => {
    try {
      await axios.delete(`http://127.0.0.1:8000/api/v1/donors/${id}`)
      setDonors(donors.filter(d => d.id !== id))
    } catch (error) {
      console.error("Error deleting donor:", error)
      alert("Cannot delete this donor because they have existing donations or appointments tied to them.")
    }
  }

  let filteredDonors = donors.filter(d => d.name.toLowerCase().includes(searchTerm.toLowerCase()))
  
  if (statusFilter !== "All") {
    filteredDonors = filteredDonors.filter(d => d.status === statusFilter)
  }

  filteredDonors.sort((a, b) => {
    if (sortBy === "Newest") return b.id - a.id
    if (sortBy === "Oldest") return a.id - b.id
    if (sortBy === "Total Donations (High-Low)") return b.total - a.total
    return 0
  })

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Donor Management</h2>
          <p className="text-muted-foreground">Manage blood donors and register new donations.</p>
        </div>
        <Button onClick={() => setIsModalOpen(true)} className="flex items-center gap-2">
          <PlusCircle className="h-4 w-4" />
          Register Donation
        </Button>
      </div>

      <div className="flex flex-col sm:flex-row items-center gap-4">
        <div className="flex items-center gap-2 w-full max-w-sm relative">
          <Search className="h-4 w-4 text-muted-foreground absolute left-3" />
          <Input 
            placeholder="Search donors..." 
            className="pl-9 w-full"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        <div className="flex items-center gap-2 w-full sm:w-auto">
          <Select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)}>
            <option value="All">All Statuses</option>
            <option value="Eligible">Eligible</option>
            <option value="Deferred">Deferred</option>
          </Select>
          <Select value={sortBy} onChange={(e) => setSortBy(e.target.value)}>
            <option value="Newest">Newest</option>
            <option value="Oldest">Oldest</option>
            <option value="Total Donations (High-Low)">Most Donations</option>
          </Select>
        </div>
      </div>

      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>ID</TableHead>
            <TableHead>Donor Name</TableHead>
            <TableHead>Blood Group</TableHead>
            <TableHead>Last Donation</TableHead>
            <TableHead>Total Donations</TableHead>
            <TableHead>Status</TableHead>
            <TableHead className="text-right">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {filteredDonors.map((donor) => (
            <TableRow key={donor.id}>
              <TableCell className="font-medium">#{donor.id}</TableCell>
              <TableCell>{donor.name}</TableCell>
              <TableCell>
                <Badge variant="outline" className="bg-destructive/10 text-destructive">{donor.bloodGroup}</Badge>
              </TableCell>
              <TableCell>{donor.lastDonation}</TableCell>
              <TableCell>{donor.total}</TableCell>
              <TableCell>
                <Badge variant={donor.status === "Eligible" ? "success" : "warning"}>
                  {donor.status}
                </Badge>
              </TableCell>
              <TableCell className="text-right">
                <Button variant="ghost" size="sm" onClick={() => { setSelectedDonor(donor); setIsViewModalOpen(true); }}>View</Button>
                <Button variant="ghost" size="sm" className="text-destructive hover:text-destructive hover:bg-destructive/10" onClick={() => handleDelete(donor.id)}>Delete</Button>
              </TableCell>
            </TableRow>
          ))}
          {filteredDonors.length === 0 && (
            <TableRow>
              <TableCell colSpan={7} className="text-center h-24 text-muted-foreground">
                No donors found.
              </TableCell>
            </TableRow>
          )}
        </TableBody>
      </Table>

      <Modal 
        isOpen={isModalOpen} 
        onClose={() => setIsModalOpen(false)}
        title="Register New Donation"
        description="Enter the donor's personal and medical information."
        className="max-w-2xl"
      >
        <form onSubmit={handleRegister} className="space-y-6">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">First Name</label>
              <Input required value={formData.firstName} onChange={e => setFormData({...formData, firstName: e.target.value})} />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">Last Name</label>
              <Input required value={formData.lastName} onChange={e => setFormData({...formData, lastName: e.target.value})} />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">Date of Birth</label>
              <Input type="date" required value={formData.dob} onChange={e => setFormData({...formData, dob: e.target.value})} />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">Gender</label>
              <Select value={formData.gender} onChange={e => setFormData({...formData, gender: e.target.value})}>
                <option value="Male">Male</option>
                <option value="Female">Female</option>
                <option value="Other">Other</option>
              </Select>
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">Blood Group</label>
              <Select value={formData.bloodGroup} onChange={e => setFormData({...formData, bloodGroup: e.target.value})}>
                {['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-', 'Unknown'].map(bg => (
                  <option key={bg} value={bg}>{bg}</option>
                ))}
              </Select>
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">Contact Number</label>
              <Input required value={formData.contact} onChange={e => setFormData({...formData, contact: e.target.value})} />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">Donation Date & Time</label>
              <Input type="datetime-local" required value={formData.donationDateTime} onChange={e => setFormData({...formData, donationDateTime: e.target.value})} />
            </div>
          </div>
          
          <div className="space-y-2">
            <label className="text-sm font-medium">Address (Optional)</label>
            <Textarea rows={2} value={formData.address} onChange={e => setFormData({...formData, address: e.target.value})} placeholder="Optional address..." />
          </div>

          <div className="grid grid-cols-3 gap-4 border-t pt-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">Blood Pressure</label>
              <Input placeholder="120/80" required value={formData.bloodPressure} onChange={e => setFormData({...formData, bloodPressure: e.target.value})} />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">Hemoglobin (g/dL)</label>
              <Input type="number" step="0.1" required value={formData.hemoglobin} onChange={e => setFormData({...formData, hemoglobin: e.target.value})} />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">Quantity (ml)</label>
              <Input type="number" required value={formData.quantity} onChange={e => setFormData({...formData, quantity: parseInt(e.target.value)})} />
            </div>
          </div>

          <div className="flex justify-end gap-3 pt-4">
            <Button type="button" variant="outline" onClick={() => setIsModalOpen(false)}>Cancel</Button>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? "Processing..." : "Complete Registration"}
            </Button>
          </div>
        </form>
      </Modal>
      <Modal 
        isOpen={isViewModalOpen} 
        onClose={() => setIsViewModalOpen(false)}
        title="Donor Details"
        description="Detailed information about the selected donor."
      >
        {selectedDonor && (
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Name</p>
                <p className="font-medium">{selectedDonor.name}</p>
              </div>
              <div>
                <p className="text-sm font-medium text-muted-foreground">Blood Group</p>
                <Badge variant="outline" className="bg-destructive/10 text-destructive">{selectedDonor.bloodGroup}</Badge>
              </div>
              <div>
                <p className="text-sm font-medium text-muted-foreground">Total Donations</p>
                <p className="font-medium">{selectedDonor.total}</p>
              </div>
              <div>
                <p className="text-sm font-medium text-muted-foreground">Last Donation</p>
                <p className="font-medium">{selectedDonor.lastDonation}</p>
              </div>
              <div>
                <p className="text-sm font-medium text-muted-foreground">Status</p>
                <Badge variant={selectedDonor.status === "Eligible" ? "success" : "warning"}>{selectedDonor.status}</Badge>
              </div>
            </div>
            <div className="flex justify-end pt-4 border-t">
              <Button onClick={() => setIsViewModalOpen(false)}>Close</Button>
            </div>
          </div>
        )}
      </Modal>
    </div>
  )
}
