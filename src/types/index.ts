export interface WorkOrder {
  id: string
  orderNo: string
  customerName: string
  machineModel: string
  brand: string
  faultDesc: string
  faultType: string
  status: 'pending' | 'in_progress' | 'completed' | 'urgent'
  urgent: boolean
  technician: string
  createdAt: string
  sparePartIds: string[]
}

export interface SparePart {
  id: string
  partNo: string
  name: string
  spec: string
  brand: string
  category: string
  compatibleModels: string[]
  unitPrice: number
  safetyStock: number
  highValue: boolean
  substituteIds: string[]
}

export interface Warehouse {
  id: string
  name: string
  region: string
  address: string
}

export interface InventoryItem {
  id: string
  partId: string
  warehouseId: string
  quantity: number
  inTransit: number
  safetyLine: number
}

export interface Requisition {
  id: string
  reqNo: string
  workOrderId: string
  applicant: string
  status: 'pending' | 'approved' | 'rejected' | 'shipped'
  urgent: boolean
  needsApproval: boolean
  approver: string
  createdAt: string
  items: RequisitionItem[]
}

export interface RequisitionItem {
  id: string
  partId: string
  quantity: number
  substituted: boolean
  originalPartId: string
}

export interface Transfer {
  id: string
  transferNo: string
  fromWarehouseId: string
  toWarehouseId: string
  status: 'pending' | 'shipping' | 'received'
  courier: string
  trackingNo: string
  createdAt: string
  items: TransferItem[]
}

export interface TransferItem {
  id: string
  partId: string
  quantity: number
}

export interface Recovery {
  id: string
  recoveryNo: string
  workOrderId: string
  partId: string
  status: 'pending' | 'registered' | 'shipping' | 'received' | 'abnormal'
  serialNo: string
  serialMismatch: boolean
  courier: string
  trackingNo: string
  returnDate: string
  disposal: 'stock_in' | 'scrap' | ''
  overdueDays: number
}

export interface MonthlyStat {
  month: string
  turnoverRate: number
  fixRate: number
  inventoryValue: number
  requisitionCount: number
  transferCount: number
  recoveryCount: number
}

export interface BrandStat {
  brand: string
  fixRate: number
  turnoverRate: number
  inventoryValue: number
}

export interface RegionStat {
  region: string
  fixRate: number
  turnoverRate: number
  inventoryValue: number
}

export interface FaultTypeStat {
  faultType: string
  count: number
  fixRate: number
}
