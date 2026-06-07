import { create } from 'zustand'
import type {
  WorkOrder,
  SparePart,
  Warehouse,
  InventoryItem,
  Requisition,
  Transfer,
  Recovery,
} from '@/types'
import {
  workOrders as initialWorkOrders,
  spareParts as initialSpareParts,
  warehouses as initialWarehouses,
  inventoryItems as initialInventory,
  requisitions as initialRequisitions,
  transfers as initialTransfers,
  recoveries as initialRecoveries,
} from '@/data/mockData'

interface AppState {
  workOrders: WorkOrder[]
  spareParts: SparePart[]
  warehouses: Warehouse[]
  inventoryItems: InventoryItem[]
  requisitions: Requisition[]
  transfers: Transfer[]
  recoveries: Recovery[]

  addRequisition: (req: Requisition) => void
  updateRequisitionStatus: (id: string, status: Requisition['status']) => void
  addTransfer: (tf: Transfer) => void
  updateTransfer: (id: string, updates: Partial<Transfer>) => void
  addRecovery: (rc: Recovery) => void
  updateRecovery: (id: string, updates: Partial<Recovery>) => void
  updateWorkOrderStatus: (id: string, status: WorkOrder['status']) => void

  getPartById: (id: string) => SparePart | undefined
  getWarehouseById: (id: string) => Warehouse | undefined
  getWorkOrderById: (id: string) => WorkOrder | undefined
  getPartStock: (partId: string, warehouseId?: string) => number
  getPartTotalStock: (partId: string) => number
}

export const useStore = create<AppState>((set, get) => ({
  workOrders: initialWorkOrders,
  spareParts: initialSpareParts,
  warehouses: initialWarehouses,
  inventoryItems: initialInventory,
  requisitions: initialRequisitions,
  transfers: initialTransfers,
  recoveries: initialRecoveries,

  addRequisition: (req) =>
    set((s) => ({ requisitions: [req, ...s.requisitions] })),

  updateRequisitionStatus: (id, status) =>
    set((s) => ({
      requisitions: s.requisitions.map((r) =>
        r.id === id ? { ...r, status } : r
      ),
    })),

  addTransfer: (tf) =>
    set((s) => ({ transfers: [tf, ...s.transfers] })),

  updateTransfer: (id, updates) =>
    set((s) => ({
      transfers: s.transfers.map((t) =>
        t.id === id ? { ...t, ...updates } : t
      ),
    })),

  addRecovery: (rc) =>
    set((s) => ({ recoveries: [rc, ...s.recoveries] })),

  updateRecovery: (id, updates) =>
    set((s) => ({
      recoveries: s.recoveries.map((r) =>
        r.id === id ? { ...r, ...updates } : r
      ),
    })),

  updateWorkOrderStatus: (id, status) =>
    set((s) => ({
      workOrders: s.workOrders.map((w) =>
        w.id === id ? { ...w, status, urgent: status === 'urgent' } : w
      ),
    })),

  getPartById: (id) => get().spareParts.find((p) => p.id === id),
  getWarehouseById: (id) => get().warehouses.find((w) => w.id === id),
  getWorkOrderById: (id) => get().workOrders.find((w) => w.id === id),

  getPartStock: (partId, warehouseId) =>
    get().inventoryItems
      .filter((i) => i.partId === partId && (!warehouseId || i.warehouseId === warehouseId))
      .reduce((sum, i) => sum + i.quantity, 0),

  getPartTotalStock: (partId) =>
    get().inventoryItems
      .filter((i) => i.partId === partId)
      .reduce((sum, i) => sum + i.quantity, 0),
}))
