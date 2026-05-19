import { useState } from "react"
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

  // Dummy State for Inventory Units
  const [units, setUnits] = useState([
    { id: 1, unitNumber: "U-1001", bloodGroup: "O+", quantity: 450, collectionDate: "2024-05-10", expiryDate: "2024-06-21", status: "AVAILABLE" },
    { id: 2, unitNumber: "U-1002", bloodGroup: "A-", quantity: 350, collectionDate: "2024-05-12", expiryDate: "2024-06-23", status: "RESERVED" },
    { id: 3, unitNumber: "U-1003", bloodGroup: "B+", quantity: 450, collectionDate: "2024-05-01", expiryDate: "2024-06-12", status: "AVAILABLE" },
    { id: 4, unitNumber: "U-1004", bloodGroup: "AB+", quantity: 450, collectionDate: "2024-04-01", expiryDate: "2024-05-13", status: "EXPIRED" },
  ])

  const filteredUnits = units.filter(u => 
    u.unitNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
    u.bloodGroup.toLowerCase().includes(searchTerm.toLowerCase())
  )

  const handleUpdateClick = (unit: any) => {
    setSelectedUnit(unit)
    setNewStatus(unit.status)
    setIsUpdateModalOpen(true)
  }

  const handleUpdateSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!selectedUnit) return

    // Simulate API Call
    setTimeout(() => {
      setUnits(units.map(u => u.id === selectedUnit.id ? { ...u, status: newStatus } : u))
      setIsUpdateModalOpen(false)
      setSelectedUnit(null)
    }, 500)
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

      <div className="flex items-center gap-2 max-w-sm">
        <Search className="h-4 w-4 text-muted-foreground absolute ml-3" />
        <Input 
          placeholder="Search by unit number or group..." 
          className="pl-9"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
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
