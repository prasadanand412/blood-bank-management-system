import { useState, useEffect } from "react"
import axios from "axios"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { Modal } from "@/components/ui/modal"
import { Select } from "@/components/ui/select"
import { Search, Edit } from "lucide-react"

export default function Inventory() {
  const [searchTerm, setSearchTerm] = useState("")
  const [isUpdateModalOpen, setIsUpdateModalOpen] = useState(false)
  const [selectedUnit, setSelectedUnit] = useState<any>(null)
  const [newStatus, setNewStatus] = useState("")
  
  const [statusFilter, setStatusFilter] = useState("All")
  const [bloodGroupFilter, setBloodGroupFilter] = useState("All")
  const [sortBy, setSortBy] = useState("Expiry Date (Soonest)")

  const [units, setUnits] = useState<any[]>([])

  const fetchUnits = async () => {
    try {
      const response = await axios.get("http://127.0.0.1:8000/api/v1/inventory/units")
      const formatted = response.data.map((u: any) => ({
        id: u.id,
        unitNumber: u.unit_number,
        bloodGroup: u.blood_group,
        quantity: u.quantity_ml,
        collectionDate: u.collection_date,
        expiryDate: u.expiry_date,
        status: u.status
      }))
      setUnits(formatted)
    } catch (error) {
      console.error("Error fetching inventory units:", error)
    }
  }

  useEffect(() => {
    fetchUnits()
  }, [])

  let filteredUnits = units.filter(u => 
    u.unitNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
    u.bloodGroup.toLowerCase().includes(searchTerm.toLowerCase())
  )

  if (statusFilter !== "All") {
    filteredUnits = filteredUnits.filter(u => u.status === statusFilter)
  }
  if (bloodGroupFilter !== "All") {
    filteredUnits = filteredUnits.filter(u => u.bloodGroup === bloodGroupFilter)
  }

  filteredUnits.sort((a, b) => {
    const expiryDiff = new Date(a.expiryDate).getTime() - new Date(b.expiryDate).getTime()
    const collectionDiff = new Date(b.collectionDate).getTime() - new Date(a.collectionDate).getTime()
    const quantityDiff = b.quantity - a.quantity

    if (sortBy === "Expiry Date (Soonest)") return expiryDiff !== 0 ? expiryDiff : a.id - b.id
    if (sortBy === "Expiry Date (Latest)") return expiryDiff !== 0 ? -expiryDiff : b.id - a.id
    if (sortBy === "Collection Date (Newest)") return collectionDiff !== 0 ? collectionDiff : b.id - a.id
    if (sortBy === "Collection Date (Oldest)") return collectionDiff !== 0 ? -collectionDiff : a.id - b.id
    if (sortBy === "Quantity (High-Low)") return quantityDiff !== 0 ? quantityDiff : b.id - a.id
    if (sortBy === "Quantity (Low-High)") return quantityDiff !== 0 ? -quantityDiff : a.id - b.id
    return 0
  })

  const handleUpdateClick = (unit: any) => {
    setSelectedUnit(unit)
    setNewStatus(unit.status)
    setIsUpdateModalOpen(true)
  }

  const handleUpdateSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!selectedUnit) return

    try {
      await axios.patch(`http://127.0.0.1:8000/api/v1/inventory/units/${selectedUnit.id}`, { status: newStatus })
      await fetchUnits()
      setIsUpdateModalOpen(false)
      setSelectedUnit(null)
    } catch (error) {
      console.error("Error updating unit status:", error)
      alert("Failed to update unit status.")
    }
  }

  const getStatusBadgeVariant = (status: string) => {
    switch (status) {
      case "AVAILABLE": return "success"
      case "RESERVED": return "warning"
      case "DISCARDED":
      case "EXPIRED": return "destructive"
      default: return "outline"
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Blood Inventory</h2>
          <p className="text-muted-foreground">Manage and track blood units in stock.</p>
        </div>
      </div>

      <div className="flex flex-col md:flex-row items-center gap-4">
        <div className="flex items-center gap-2 w-full max-w-sm relative">
          <Search className="h-4 w-4 text-muted-foreground absolute left-3" />
          <Input 
            placeholder="Search by unit number..." 
            className="pl-9 w-full"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        <div className="flex items-center gap-2 w-full md:w-auto overflow-x-auto pb-1 md:pb-0">
          <Select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)} className="min-w-[140px]">
            <option value="All">All Statuses</option>
            <option value="AVAILABLE">AVAILABLE</option>
            <option value="RESERVED">RESERVED</option>
            <option value="EXPIRED">EXPIRED</option>
            <option value="DISCARDED">DISCARDED</option>
          </Select>
          <Select value={bloodGroupFilter} onChange={(e) => setBloodGroupFilter(e.target.value)} className="min-w-[180px]">
            <option value="All">All Blood Groups</option>
            {['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'].map(bg => (
              <option key={bg} value={bg}>{bg}</option>
            ))}
          </Select>
          <Select value={sortBy} onChange={(e) => setSortBy(e.target.value)} className="min-w-[200px]">
            <option value="Expiry Date (Soonest)">Expiry Date (Soonest)</option>
            <option value="Expiry Date (Latest)">Expiry Date (Latest)</option>
            <option value="Collection Date (Newest)">Collection Date (Newest)</option>
            <option value="Collection Date (Oldest)">Collection Date (Oldest)</option>
            <option value="Quantity (High-Low)">Quantity (High-Low)</option>
            <option value="Quantity (Low-High)">Quantity (Low-High)</option>
          </Select>
        </div>
      </div>

      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Unit Number</TableHead>
            <TableHead>Blood Group</TableHead>
            <TableHead>Quantity (ml)</TableHead>
            <TableHead>Collection Date</TableHead>
            <TableHead>Expiry Date</TableHead>
            <TableHead>Status</TableHead>
            <TableHead className="text-right">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {filteredUnits.map((unit) => (
            <TableRow key={unit.id}>
              <TableCell className="font-medium">{unit.unitNumber}</TableCell>
              <TableCell>
                <Badge variant="outline" className="bg-destructive/10 text-destructive">{unit.bloodGroup}</Badge>
              </TableCell>
              <TableCell>{unit.quantity}</TableCell>
              <TableCell>{unit.collectionDate}</TableCell>
              <TableCell>{unit.expiryDate}</TableCell>
              <TableCell>
                <Badge variant={getStatusBadgeVariant(unit.status) as any}>
                  {unit.status}
                </Badge>
              </TableCell>
              <TableCell className="text-right">
                <Button variant="ghost" size="sm" onClick={() => handleUpdateClick(unit)}>
                  <Edit className="h-4 w-4 mr-1" />
                  Update Status
                </Button>
              </TableCell>
            </TableRow>
          ))}
          {filteredUnits.length === 0 && (
            <TableRow>
              <TableCell colSpan={7} className="text-center h-24 text-muted-foreground">
                No inventory units found.
              </TableCell>
            </TableRow>
          )}
        </TableBody>
      </Table>

      <Modal 
        isOpen={isUpdateModalOpen} 
        onClose={() => setIsUpdateModalOpen(false)}
        title="Update Unit Status"
        description="Change the status of the selected blood unit."
      >
        {selectedUnit && (
          <form onSubmit={handleUpdateSubmit} className="space-y-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">Unit Number</label>
              <Input disabled value={selectedUnit.unitNumber} />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">New Status</label>
              <Select value={newStatus} onChange={e => setNewStatus(e.target.value)}>
                <option value="AVAILABLE">AVAILABLE</option>
                <option value="RESERVED">RESERVED</option>
                <option value="DISCARDED">DISCARDED</option>
                <option value="EXPIRED">EXPIRED</option>
              </Select>
            </div>
            <div className="flex justify-end gap-3 pt-4 border-t">
              <Button type="button" variant="outline" onClick={() => setIsUpdateModalOpen(false)}>Cancel</Button>
              <Button type="submit">Save Changes</Button>
            </div>
          </form>
        )}
      </Modal>
    </div>
  )
}
