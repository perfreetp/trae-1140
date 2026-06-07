import { create } from 'zustand'
import { persist } from 'zustand/middleware'
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
  approveRequisition: (id: string, approver: string) => void
  rejectRequisition: (id: string, approver: string, reason: string) => void
  shipRequisition: (id: string, shipWarehouseId: string, courier: string, trackingNo: string, operator: string) => void
  receiveRequisition: (id: string, operator: string) => void
  updateRequisitionStatus: (id: string, status: Requisition['status']) => void

  addTransfer: (tf: Transfer) => void
  updateTransfer: (id: string, updates: Partial<Transfer>) => void
  shipTransfer: (id: string, courier: string, trackingNo: string, operator: string) => void
  receiveTransfer: (id: string, operator: string) => void

  addRecovery: (rc: Recovery) => void
  updateRecovery: (id: string, updates: Partial<Recovery>) => void
  updateWorkOrderStatus: (id: string, status: WorkOrder['status']) => void

  deductInventory: (partId: string, warehouseId: string, quantity: number) => void
  addInventory: (partId: string, warehouseId: string, quantity: number) => void

  getPartById: (id: string) => SparePart | undefined
  getWarehouseById: (id: string) => Warehouse | undefined
  getWorkOrderById: (id: string) => WorkOrder | undefined
  getRequisitionById: (id: string) => Requisition | undefined
  getPartStock: (partId: string, warehouseId?: string) => number
  getPartTotalStock: (partId: string) => number
}

export const useStore = create<AppState>()(
  persist(
    (set, get) => ({
      workOrders: initialWorkOrders,
      spareParts: initialSpareParts,
      warehouses: initialWarehouses,
      inventoryItems: initialInventory,
      requisitions: initialRequisitions,
      transfers: initialTransfers,
      recoveries: initialRecoveries,

      addRequisition: (req) =>
        set((s) => ({ requisitions: [req, ...s.requisitions] })),

      approveRequisition: (id, approver) =>
        set((s) => ({
          requisitions: s.requisitions.map((r) =>
            r.id === id
              ? {
                  ...r,
                  status: 'approved' as const,
                  approver,
                  auditTrail: [
                    ...r.auditTrail,
                    { action: 'approved' as const, actor: approver, timestamp: new Date().toLocaleString('zh-CN'), detail: '审批通过' },
                  ],
                }
              : r
          ),
        })),

      rejectRequisition: (id, approver, reason) =>
        set((s) => ({
          requisitions: s.requisitions.map((r) =>
            r.id === id
              ? {
                  ...r,
                  status: 'rejected' as const,
                  approver,
                  auditTrail: [
                    ...r.auditTrail,
                    { action: 'rejected' as const, actor: approver, timestamp: new Date().toLocaleString('zh-CN'), detail: `驳回：${reason}` },
                  ],
                }
              : r
          ),
        })),

      shipRequisition: (id, shipWarehouseId, courier, trackingNo, operator) => {
        const req = get().requisitions.find((r) => r.id === id)
        if (!req) return
        const ts = new Date().toLocaleString('zh-CN')
        const today = new Date().toISOString().slice(0, 10)
        const transferNo = `TF-2026-${String(get().transfers.length + 1).padStart(4, '0')}`
        const newTransfer: Transfer = {
          id: `tf_from_req_${Date.now()}`,
          transferNo,
          fromWarehouseId: shipWarehouseId,
          toWarehouseId: req.warehouseId,
          sourceRequisitionId: id,
          status: 'shipping' as const,
          courier,
          trackingNo,
          createdAt: today,
          items: req.items.map((it, i) => ({ id: `tfi_${Date.now()}_${i}`, partId: it.partId, quantity: it.quantity })),
        }
        set((s) => {
          const newInventory = s.inventoryItems.map((inv) => {
            if (inv.warehouseId !== shipWarehouseId) return inv
            const reqItem = req.items.find((it) => it.partId === inv.partId)
            if (!reqItem) return inv
            return { ...inv, quantity: Math.max(0, inv.quantity - reqItem.quantity), inTransit: inv.inTransit + reqItem.quantity }
          })
          return {
            inventoryItems: newInventory,
            requisitions: s.requisitions.map((r) =>
              r.id === id
                ? {
                    ...r,
                    status: 'shipped' as const,
                    courier,
                    trackingNo,
                    auditTrail: [
                      ...r.auditTrail,
                      { action: 'shipped' as const, actor: operator, timestamp: ts, detail: `已出库，仓库：${get().warehouses.find(w => w.id === shipWarehouseId)?.name || shipWarehouseId}，${courier} ${trackingNo}` },
                    ],
                  }
                : r
            ),
            transfers: [newTransfer, ...s.transfers],
          }
        })
      },

      receiveRequisition: (id, operator) =>
        set((s) => ({
          requisitions: s.requisitions.map((r) =>
            r.id === id
              ? {
                  ...r,
                  status: 'received' as const,
                  auditTrail: [
                    ...r.auditTrail,
                    { action: 'received' as const, actor: operator, timestamp: new Date().toLocaleString('zh-CN'), detail: '已签收' },
                  ],
                }
              : r
          ),
        })),

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

      shipTransfer: (id, courier, trackingNo, operator) => {
        const tf = get().transfers.find((t) => t.id === id)
        if (!tf) return
        set((s) => {
          const newInventory = s.inventoryItems.map((inv) => {
            if (inv.warehouseId !== tf.fromWarehouseId) return inv
            const tfItem = tf.items.find((it) => it.partId === inv.partId)
            if (!tfItem) return inv
            return { ...inv, quantity: Math.max(0, inv.quantity - tfItem.quantity), inTransit: inv.inTransit + tfItem.quantity }
          })
          return {
            inventoryItems: newInventory,
            transfers: s.transfers.map((t) =>
              t.id === id
                ? { ...t, status: 'shipping' as const, courier, trackingNo }
                : t
            ),
          }
        })
      },

      receiveTransfer: (id, operator) => {
        const tf = get().transfers.find((t) => t.id === id)
        if (!tf) return
        const ts = new Date().toLocaleString('zh-CN')
        set((s) => {
          const newInventory = s.inventoryItems.map((inv) => {
            if (inv.warehouseId === tf.toWarehouseId) {
              const tfItem = tf.items.find((it) => it.partId === inv.partId)
              if (tfItem) return { ...inv, quantity: inv.quantity + tfItem.quantity }
            }
            if (inv.warehouseId === tf.fromWarehouseId) {
              const tfItem = tf.items.find((it) => it.partId === inv.partId)
              if (tfItem) return { ...inv, inTransit: Math.max(0, inv.inTransit - tfItem.quantity) }
            }
            return inv
          })
          let newRequisitions = s.requisitions
          if (tf.sourceRequisitionId) {
            newRequisitions = s.requisitions.map((r) =>
              r.id === tf.sourceRequisitionId
                ? {
                    ...r,
                    status: 'received' as const,
                    auditTrail: [
                      ...r.auditTrail,
                      { action: 'received' as const, actor: operator, timestamp: ts, detail: `签收完成，调拨单 ${tf.transferNo}` },
                    ],
                  }
                : r
            )
          }
          return {
            inventoryItems: newInventory,
            requisitions: newRequisitions,
            transfers: s.transfers.map((t) =>
              t.id === id ? { ...t, status: 'received' as const } : t
            ),
          }
        })
      },

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

      deductInventory: (partId, warehouseId, quantity) =>
        set((s) => ({
          inventoryItems: s.inventoryItems.map((inv) =>
            inv.partId === partId && inv.warehouseId === warehouseId
              ? { ...inv, quantity: Math.max(0, inv.quantity - quantity) }
              : inv
          ),
        })),

      addInventory: (partId, warehouseId, quantity) =>
        set((s) => ({
          inventoryItems: s.inventoryItems.map((inv) =>
            inv.partId === partId && inv.warehouseId === warehouseId
              ? { ...inv, quantity: inv.quantity + quantity }
              : inv
          ),
        })),

      getPartById: (id) => get().spareParts.find((p) => p.id === id),
      getWarehouseById: (id) => get().warehouses.find((w) => w.id === id),
      getWorkOrderById: (id) => get().workOrders.find((w) => w.id === id),
      getRequisitionById: (id) => get().requisitions.find((r) => r.id === id),

      getPartStock: (partId, warehouseId) =>
        get().inventoryItems
          .filter((i) => i.partId === partId && (!warehouseId || i.warehouseId === warehouseId))
          .reduce((sum, i) => sum + i.quantity, 0),

      getPartTotalStock: (partId) =>
        get().inventoryItems
          .filter((i) => i.partId === partId)
          .reduce((sum, i) => sum + i.quantity, 0),
    }),
    {
      name: 'spare-parts-scm-storage',
      partialize: (state) => ({
        requisitions: state.requisitions,
        transfers: state.transfers,
        recoveries: state.recoveries,
        inventoryItems: state.inventoryItems,
        workOrders: state.workOrders,
      }),
    }
  )
)
