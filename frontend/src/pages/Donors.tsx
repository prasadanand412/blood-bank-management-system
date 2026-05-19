import { useState } from "react"
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
  
  // Dummy State for Donors
  const [donors, setDonors] = useState([
    { id: 1, name: "John Doe", bloodGroup: "O+", lastDonation: "2023-12-01", total: 5, status: "Eligible" },
    { id: 2, name: "Jane Smith", bloodGroup: "A-", lastDonation: "Never", total: 0, status: "Eligible" },
    { id: 3, name: "Michael Johnson", bloodGroup: "B+", lastDonation: "2024-04-15", total: 12, status: "Deferred" },
  ])

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

  const handleRegister = (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)
    
    // Simulate API Call
    setTimeout(() => {
      const newDonor = {
        id: donors.length + 1,
        name: `${formData.firstName} ${formData.lastName}`,
        bloodGroup: formData.bloodGroup,
        lastDonation: formData.donationDateTime ? formData.donationDateTime.replace('T', ' ') : new Date().toISOString().replace('T', ' ').substring(0, 16),
        total: 1,
        status: "Eligible",
      }
      setDonors([newDonor, ...donors])
      setIsSubmitting(false)
      setIsModalOpen(false)
      
      // Reset Form
      setFormData({
        firstName: "", lastName: "", dob: "", gender: "Male", bloodGroup: "A+",
        contact: "", address: "", bloodPressure: "", hemoglobin: "", quantity: 450, donationDateTime: "",
      })
    }, 1000)
  }

  const handleDelete = (id: number) => {
    setDonors(donors.filter(d => d.id !== id))
  }

  const filteredDonors = donors.filter(d => d.name.toLowerCase().includes(searchTerm.toLowerCase()))

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

      <div className="flex items-center gap-2 max-w-sm">
        <Search className="h-4 w-4 text-muted-foreground absolute ml-3" />
        <Input 
          placeholder="Search donors..." 
          className="pl-9"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
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
