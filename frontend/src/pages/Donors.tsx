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
  const [notification, setNotification] = useState<{message: string, type: 'error' | 'success'} | null>(null)
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
  
  const [diseaseState, setDiseaseState] = useState("None")
  const [medicalNotes, setMedicalNotes] = useState("")

  const showNotification = (message: string, type: 'error' | 'success') => {
    setNotification({ message, type })
    setTimeout(() => setNotification(null), 4000)
  }

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)
    
    try {
      const submissionData = {
        ...formData,
        medicalNotes: diseaseState !== "None" 
          ? (diseaseState === "Other" ? medicalNotes : `${diseaseState}${medicalNotes ? ' - ' + medicalNotes : ''}`)
          : (medicalNotes || "None")
      }
      
      await axios.post("http://127.0.0.1:8000/api/v1/donors", submissionData)
      await fetchDonors()
      setIsSubmitting(false)
      setIsModalOpen(false)
      showNotification("Donor registered successfully!", "success")
      
      // Reset Form
      setFormData({
        firstName: "", lastName: "", dob: "", gender: "Male", bloodGroup: "A+",
        contact: "", address: "", bloodPressure: "", hemoglobin: "", quantity: 450, donationDateTime: "",
      })
      setDiseaseState("None")
      setMedicalNotes("")
    } catch (error) {
      console.error("Error registering donor:", error)
      setIsSubmitting(false)
      showNotification("Failed to register donor. Please check all fields.", "error")
    }
  }

  const handleDelete = async (id: number) => {
    try {
      await axios.delete(`http://127.0.0.1:8000/api/v1/donors/${id}`)
      setDonors(donors.filter(d => d.id !== id))
      showNotification("Donor deleted successfully!", "success")
    } catch (error) {
      console.error("Error deleting donor:", error)
      showNotification("Cannot delete this donor because they have existing donations or appointments tied to them.", "error")
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
          <Select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)} className="min-w-[140px]">
            <option value="All">All Statuses</option>
            <option value="Eligible">Eligible</option>
            <option value="Deferred">Deferred</option>
          </Select>
          <Select value={sortBy} onChange={(e) => setSortBy(e.target.value)} className="min-w-[160px]">
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
          
          <div className="space-y-4 border-t pt-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">Any Disease?</label>
              <Select value={diseaseState} onChange={e => setDiseaseState(e.target.value)}>
                <option value="None">None</option>
                <option value="Diabetes">Diabetes</option>
                <option value="Heart Disease">Heart Disease</option>
                <option value="Sickle Cell">Sickle Cell</option>
                <option value="Other">Other</option>
              </Select>
            </div>
            
            {(diseaseState === "Other" || diseaseState !== "None") && (
              <div className="space-y-2 animate-in fade-in slide-in-from-top-2">
                <label className="text-sm font-medium">Medical Notes</label>
                <Textarea 
                  rows={2} 
                  value={medicalNotes} 
                  onChange={e => setMedicalNotes(e.target.value)} 
                  placeholder={diseaseState === "Other" ? "Please specify..." : "Additional details (optional)..."} 
                  required={diseaseState === "Other"}
                />
              </div>
            )}
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
