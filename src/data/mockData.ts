import type {
  WorkOrder,
  SparePart,
  Warehouse,
  InventoryItem,
  Requisition,
  Transfer,
  Recovery,
  MonthlyStat,
  BrandStat,
  RegionStat,
  FaultTypeStat,
} from '@/types'

export const warehouses: Warehouse[] = [
  { id: 'wh1', name: '华东中心仓', region: '华东', address: '上海市松江区九亭镇涞寅路188号' },
  { id: 'wh2', name: '华南中心仓', region: '华南', address: '广州市白云区太和镇大沥村工业区' },
  { id: 'wh3', name: '华北中心仓', region: '华北', address: '北京市大兴区亦庄开发区科创十二街' },
  { id: 'wh4', name: '西南中心仓', region: '西南', address: '成都市双流区西航港经济开发区' },
  { id: 'wh5', name: '华中中心仓', region: '华中', address: '武汉市江夏区庙山开发区阳光大道' },
]

export const spareParts: SparePart[] = [
  { id: 'sp1', partNo: 'KT-YL-001', name: '压缩机', spec: '1.5P/220V/R410A', brand: '格力', category: '空调', compatibleModels: ['KFR-35GW', 'KFR-50LW', 'KFR-72LW'], unitPrice: 680, safetyStock: 20, highValue: true, substituteIds: ['sp2'] },
  { id: 'sp2', partNo: 'KT-YL-002', name: '压缩机', spec: '1.5P/220V/R32', brand: '美的', category: '空调', compatibleModels: ['KFR-35GW/BP3', 'KFR-51LW/BP3'], unitPrice: 720, safetyStock: 15, highValue: true, substituteIds: ['sp1'] },
  { id: 'sp3', partNo: 'KT-FB-001', name: '风机电容', spec: '2μF/450V', brand: '格力', category: '空调', compatibleModels: ['KFR-35GW', 'KFR-50LW', 'KFR-26GW'], unitPrice: 25, safetyStock: 50, highValue: false, substituteIds: [] },
  { id: 'sp4', partNo: 'KT-KZ-001', name: '主板', spec: 'V3.2/220V/WiFi', brand: '格力', category: '空调', compatibleModels: ['KFR-35GW', 'KFR-72LW'], unitPrice: 450, safetyStock: 10, highValue: true, substituteIds: [] },
  { id: 'sp5', partNo: 'KT-SI-001', name: '四通阀', spec: 'SHF-7/220V', brand: '三花', category: '空调', compatibleModels: ['KFR-35GW', 'KFR-50LW', 'KFR-72LW'], unitPrice: 120, safetyStock: 15, highValue: false, substituteIds: [] },
  { id: 'sp6', partNo: 'KT-GS-001', name: '过滤网', spec: '通用型/可水洗', brand: '通用', category: '空调', compatibleModels: ['KFR-35GW', 'KFR-26GW', 'KFR-50LW'], unitPrice: 15, safetyStock: 100, highValue: false, substituteIds: [] },
  { id: 'sp7', partNo: 'KT-EM-001', name: '膨胀阀', spec: 'TXV-03/R410A', brand: '三花', category: '空调', compatibleModels: ['KFR-50LW', 'KFR-72LW'], unitPrice: 95, safetyStock: 12, highValue: false, substituteIds: [] },
  { id: 'sp8', partNo: 'BX-YL-001', name: '压缩机', spec: '1/3HP/R600a', brand: '海尔', category: '冰箱', compatibleModels: ['BCD-215', 'BCD-251', 'BCD-335'], unitPrice: 520, safetyStock: 15, highValue: true, substituteIds: ['sp9'] },
  { id: 'sp9', partNo: 'BX-YL-002', name: '压缩机', spec: '1/4HP/R600a', brand: '美的', category: '冰箱', compatibleModels: ['BCD-180', 'BCD-215'], unitPrice: 480, safetyStock: 12, highValue: true, substituteIds: ['sp8'] },
  { id: 'sp10', partNo: 'BX-WK-001', name: '温控器', spec: 'WPF18L/220V', brand: '海尔', category: '冰箱', compatibleModels: ['BCD-215', 'BCD-251', 'BCD-335'], unitPrice: 65, safetyStock: 30, highValue: false, substituteIds: [] },
  { id: 'sp11', partNo: 'BX-MB-001', name: '主板', spec: 'V2.1/220V/LED显示', brand: '海尔', category: '冰箱', compatibleModels: ['BCD-335', 'BCD-510'], unitPrice: 380, safetyStock: 8, highValue: true, substituteIds: [] },
  { id: 'sp12', partNo: 'BX-FM-001', name: '风机', spec: '12V/0.25A/直流', brand: '海尔', category: '冰箱', compatibleModels: ['BCD-251', 'BCD-335', 'BCD-510'], unitPrice: 85, safetyStock: 20, highValue: false, substituteIds: [] },
  { id: 'sp13', partNo: 'BX-MS-001', name: '门封条', spec: '215L/磁性/软PVC', brand: '通用', category: '冰箱', compatibleModels: ['BCD-215', 'BCD-180'], unitPrice: 35, safetyStock: 40, highValue: false, substituteIds: [] },
  { id: 'sp14', partNo: 'XY-DJ-001', name: '电机', spec: '180W/220V/BLDC', brand: '海尔', category: '洗衣机', compatibleModels: ['XQG80', 'XQG100'], unitPrice: 420, safetyStock: 10, highValue: true, substituteIds: ['sp15'] },
  { id: 'sp15', partNo: 'XY-DJ-002', name: '电机', spec: '200W/220V/DD直驱', brand: '美的', category: '洗衣机', compatibleModels: ['XQG100', 'XQG120'], unitPrice: 560, safetyStock: 8, highValue: true, substituteIds: ['sp14'] },
  { id: 'sp16', partNo: 'XY-KZ-001', name: '电脑板', spec: 'V4.0/220V/变频', brand: '海尔', category: '洗衣机', compatibleModels: ['XQG80', 'XQG100'], unitPrice: 350, safetyStock: 8, highValue: true, substituteIds: [] },
  { id: 'sp17', partNo: 'XY-PQ-001', name: '排水泵', spec: '40W/220V', brand: '通用', category: '洗衣机', compatibleModels: ['XQG80', 'XQG100', 'XQG120'], unitPrice: 75, safetyStock: 25, highValue: false, substituteIds: [] },
  { id: 'sp18', partNo: 'XY-MS-001', name: '门密封圈', spec: '通用型/橡胶', brand: '通用', category: '洗衣机', compatibleModels: ['XQG80', 'XQG100'], unitPrice: 45, safetyStock: 30, highValue: false, substituteIds: [] },
  { id: 'sp19', partNo: 'RS-JR-001', name: '加热管', spec: '2000W/220V/不锈钢', brand: '海尔', category: '热水器', compatibleModels: ['ES60H', 'ES80H'], unitPrice: 95, safetyStock: 20, highValue: false, substituteIds: [] },
  { id: 'sp20', partNo: 'RS-WB-001', name: '温控器', spec: 'KSD301/70℃', brand: '通用', category: '热水器', compatibleModels: ['ES60H', 'ES80H', 'ES50H'], unitPrice: 30, safetyStock: 40, highValue: false, substituteIds: [] },
  { id: 'sp21', partNo: 'KT-LB-001', name: '冷凝器', spec: '2排/铜管/铝翅片', brand: '格力', category: '空调', compatibleModels: ['KFR-35GW', 'KFR-50LW'], unitPrice: 280, safetyStock: 8, highValue: false, substituteIds: [] },
  { id: 'sp22', partNo: 'KT-ZF-001', name: '蒸发器', spec: '2排/铜管/铝翅片', brand: '格力', category: '空调', compatibleModels: ['KFR-35GW', 'KFR-26GW'], unitPrice: 260, safetyStock: 8, highValue: false, substituteIds: [] },
  { id: 'sp23', partNo: 'BX-GG-001', name: '搁物架', spec: '钢化玻璃/通用型', brand: '通用', category: '冰箱', compatibleModels: ['BCD-215', 'BCD-251', 'BCD-335'], unitPrice: 40, safetyStock: 60, highValue: false, substituteIds: [] },
  { id: 'sp24', partNo: 'XY-BD-001', name: '变频板', spec: 'V3.1/220V', brand: '海尔', category: '洗衣机', compatibleModels: ['XQG80', 'XQG100'], unitPrice: 310, safetyStock: 6, highValue: true, substituteIds: [] },
  { id: 'sp25', partNo: 'KT-SG-001', name: '室内管温传感器', spec: 'NTC/10K', brand: '通用', category: '空调', compatibleModels: ['KFR-35GW', 'KFR-50LW', 'KFR-72LW', 'KFR-26GW'], unitPrice: 18, safetyStock: 80, highValue: false, substituteIds: [] },
  { id: 'sp26', partNo: 'XY-JD-001', name: '减震器', spec: '通用型/阻尼', brand: '通用', category: '洗衣机', compatibleModels: ['XQG80', 'XQG100', 'XQG120'], unitPrice: 55, safetyStock: 20, highValue: false, substituteIds: [] },
  { id: 'sp27', partNo: 'BX-ZL-001', name: '制冷剂', spec: 'R600a/150g', brand: '通用', category: '冰箱', compatibleModels: ['BCD-180', 'BCD-215', 'BCD-251'], unitPrice: 50, safetyStock: 30, highValue: false, substituteIds: [] },
  { id: 'sp28', partNo: 'RS-AQ-001', name: '安全阀', spec: '0.7MPa/铜', brand: '通用', category: '热水器', compatibleModels: ['ES60H', 'ES80H', 'ES50H'], unitPrice: 28, safetyStock: 50, highValue: false, substituteIds: [] },
  { id: 'sp29', partNo: 'KT-YF-001', name: '遥控器', spec: '万能型/LED显示', brand: '通用', category: '空调', compatibleModels: ['KFR-35GW', 'KFR-26GW', 'KFR-50LW'], unitPrice: 35, safetyStock: 60, highValue: false, substituteIds: [] },
  { id: 'sp30', partNo: 'XY-PD-001', name: '皮带', spec: '1240J6/橡胶', brand: '通用', category: '洗衣机', compatibleModels: ['XQG80'], unitPrice: 22, safetyStock: 40, highValue: false, substituteIds: [] },
  { id: 'sp31', partNo: 'KT-YS-001', name: '压缩机启动器', spec: 'PTC/220V', brand: '通用', category: '空调', compatibleModels: ['KFR-35GW', 'KFR-50LW', 'KFR-72LW'], unitPrice: 32, safetyStock: 40, highValue: false, substituteIds: [] },
  { id: 'sp32', partNo: 'BX-HQ-001', name: '化霜加热丝', spec: '150W/220V', brand: '海尔', category: '冰箱', compatibleModels: ['BCD-251', 'BCD-335'], unitPrice: 45, safetyStock: 15, highValue: false, substituteIds: [] },
  { id: 'sp33', partNo: 'RS-MB-001', name: '主板', spec: 'V1.5/220V/数码显示', brand: '海尔', category: '热水器', compatibleModels: ['ES60H', 'ES80H'], unitPrice: 280, safetyStock: 8, highValue: true, substituteIds: [] },
  { id: 'sp34', partNo: 'KT-JS-001', name: '接水盘', spec: 'ABS/通用型', brand: '通用', category: '空调', compatibleModels: ['KFR-35GW', 'KFR-26GW'], unitPrice: 20, safetyStock: 50, highValue: false, substituteIds: [] },
  { id: 'sp35', partNo: 'XY-SL-001', name: '水龙头接口', spec: '4分/铜/快接', brand: '通用', category: '洗衣机', compatibleModels: ['XQG80', 'XQG100', 'XQG120'], unitPrice: 15, safetyStock: 80, highValue: false, substituteIds: [] },
]

export const workOrders: WorkOrder[] = [
  { id: 'wo1', orderNo: 'WO-2026-0001', customerName: '张伟', machineModel: 'KFR-35GW', brand: '格力', faultDesc: '空调不制冷，运行电流偏高', faultType: '制冷故障', status: 'urgent', urgent: true, technician: '李强', createdAt: '2026-06-07', sparePartIds: ['sp1'] },
  { id: 'wo2', orderNo: 'WO-2026-0002', customerName: '王芳', machineModel: 'BCD-215', brand: '海尔', faultDesc: '冰箱不启动，无反应', faultType: '电气故障', status: 'pending', urgent: false, technician: '赵明', createdAt: '2026-06-07', sparePartIds: ['sp8', 'sp10'] },
  { id: 'wo3', orderNo: 'WO-2026-0003', customerName: '陈刚', machineModel: 'XQG80', brand: '海尔', faultDesc: '洗衣机脱水异响严重', faultType: '机械故障', status: 'in_progress', urgent: false, technician: '孙华', createdAt: '2026-06-06', sparePartIds: ['sp14', 'sp26'] },
  { id: 'wo4', orderNo: 'WO-2026-0004', customerName: '刘洋', machineModel: 'KFR-50LW', brand: '格力', faultDesc: '制热模式四通阀不切换', faultType: '制冷故障', status: 'pending', urgent: false, technician: '李强', createdAt: '2026-06-06', sparePartIds: ['sp5'] },
  { id: 'wo5', orderNo: 'WO-2026-0005', customerName: '杨秀英', machineModel: 'ES60H', brand: '海尔', faultDesc: '热水器加热慢且跳闸', faultType: '电气故障', status: 'in_progress', urgent: false, technician: '周伟', createdAt: '2026-06-06', sparePartIds: ['sp19', 'sp20'] },
  { id: 'wo6', orderNo: 'WO-2026-0006', customerName: '黄磊', machineModel: 'KFR-72LW', brand: '格力', faultDesc: '柜机主板故障，显示E1', faultType: '电气故障', status: 'urgent', urgent: true, technician: '李强', createdAt: '2026-06-05', sparePartIds: ['sp4'] },
  { id: 'wo7', orderNo: 'WO-2026-0007', customerName: '赵丽', machineModel: 'BCD-335', brand: '海尔', faultDesc: '冰箱显示F1报警', faultType: '电气故障', status: 'pending', urgent: false, technician: '赵明', createdAt: '2026-06-05', sparePartIds: ['sp11'] },
  { id: 'wo8', orderNo: 'WO-2026-0008', customerName: '孙涛', machineModel: 'XQG100', brand: '海尔', faultDesc: '洗衣机报E2排水超时', faultType: '排水故障', status: 'in_progress', urgent: false, technician: '孙华', createdAt: '2026-06-05', sparePartIds: ['sp17'] },
  { id: 'wo9', orderNo: 'WO-2026-0009', customerName: '周军', machineModel: 'KFR-35GW', brand: '美的', faultDesc: '内风机不转，电容鼓包', faultType: '电气故障', status: 'completed', urgent: false, technician: '李强', createdAt: '2026-06-04', sparePartIds: ['sp3'] },
  { id: 'wo10', orderNo: 'WO-2026-0010', customerName: '吴敏', machineModel: 'BCD-251', brand: '海尔', faultDesc: '冰箱冷藏室温度偏高', faultType: '制冷故障', status: 'completed', urgent: false, technician: '赵明', createdAt: '2026-06-04', sparePartIds: ['sp12'] },
  { id: 'wo11', orderNo: 'WO-2026-0011', customerName: '郑华', machineModel: 'XQG120', brand: '美的', faultDesc: '洗衣机脱水报UE不平衡', faultType: '机械故障', status: 'pending', urgent: false, technician: '孙华', createdAt: '2026-06-04', sparePartIds: ['sp15', 'sp26'] },
  { id: 'wo12', orderNo: 'WO-2026-0012', customerName: '马超', machineModel: 'KFR-26GW', brand: '格力', faultDesc: '空调漏水严重', faultType: '漏水故障', status: 'in_progress', urgent: false, technician: '周伟', createdAt: '2026-06-03', sparePartIds: ['sp34', 'sp6'] },
  { id: 'wo13', orderNo: 'WO-2026-0013', customerName: '林美', machineModel: 'ES80H', brand: '海尔', faultDesc: '热水器无法开机', faultType: '电气故障', status: 'pending', urgent: false, technician: '周伟', createdAt: '2026-06-03', sparePartIds: ['sp33'] },
  { id: 'wo14', orderNo: 'WO-2026-0014', customerName: '何伟', machineModel: 'BCD-180', brand: '美的', faultDesc: '压缩机不停机', faultType: '制冷故障', status: 'completed', urgent: false, technician: '赵明', createdAt: '2026-06-02', sparePartIds: ['sp9', 'sp10'] },
  { id: 'wo15', orderNo: 'WO-2026-0015', customerName: '罗芳', machineModel: 'KFR-35GW', brand: '格力', faultDesc: '空调制热效果差', faultType: '制热故障', status: 'pending', urgent: false, technician: '李强', createdAt: '2026-06-02', sparePartIds: ['sp7', 'sp25'] },
  { id: 'wo16', orderNo: 'WO-2026-0016', customerName: '唐强', machineModel: 'XQG80', brand: '海尔', faultDesc: '洗衣机显示F7通讯故障', faultType: '电气故障', status: 'urgent', urgent: true, technician: '孙华', createdAt: '2026-06-01', sparePartIds: ['sp16', 'sp24'] },
  { id: 'wo17', orderNo: 'WO-2026-0017', customerName: '韩雪', machineModel: 'KFR-50LW', brand: '格力', faultDesc: '外机噪音大，共振明显', faultType: '噪音故障', status: 'completed', urgent: false, technician: '李强', createdAt: '2026-06-01', sparePartIds: [] },
  { id: 'wo18', orderNo: 'WO-2026-0018', customerName: '冯丽', machineModel: 'BCD-510', brand: '海尔', faultDesc: '对开门冰箱不化霜', faultType: '制冷故障', status: 'in_progress', urgent: false, technician: '赵明', createdAt: '2026-05-31', sparePartIds: ['sp32'] },
  { id: 'wo19', orderNo: 'WO-2026-0019', customerName: '蒋明', machineModel: 'XQG100', brand: '海尔', faultDesc: '洗衣机门密封圈发霉变形', faultType: '外观故障', status: 'completed', urgent: false, technician: '孙华', createdAt: '2026-05-31', sparePartIds: ['sp18'] },
  { id: 'wo20', orderNo: 'WO-2026-0020', customerName: '沈婷', machineModel: 'ES50H', brand: '海尔', faultDesc: '热水器安全阀漏水', faultType: '漏水故障', status: 'completed', urgent: false, technician: '周伟', createdAt: '2026-05-30', sparePartIds: ['sp28'] },
  { id: 'wo21', orderNo: 'WO-2026-0021', customerName: '宋刚', machineModel: 'KFR-72LW', brand: '格力', faultDesc: '柜机内风机不转', faultType: '电气故障', status: 'pending', urgent: false, technician: '周伟', createdAt: '2026-05-30', sparePartIds: ['sp3'] },
  { id: 'wo22', orderNo: 'WO-2026-0022', customerName: '许芬', machineModel: 'BCD-215', brand: '海尔', faultDesc: '冰箱门封不严，结霜', faultType: '外观故障', status: 'pending', urgent: false, technician: '赵明', createdAt: '2026-05-29', sparePartIds: ['sp13'] },
  { id: 'wo23', orderNo: 'WO-2026-0023', customerName: '彭勇', machineModel: 'XQG80', brand: '海尔', faultDesc: '洗衣机皮带打滑', faultType: '机械故障', status: 'completed', urgent: false, technician: '孙华', createdAt: '2026-05-29', sparePartIds: ['sp30'] },
  { id: 'wo24', orderNo: 'WO-2026-0024', customerName: '蔡琳', machineModel: 'KFR-35GW', brand: '格力', faultDesc: '遥控器失灵', faultType: '电气故障', status: 'completed', urgent: false, technician: '李强', createdAt: '2026-05-28', sparePartIds: ['sp29'] },
  { id: 'wo25', orderNo: 'WO-2026-0025', customerName: '丁浩', machineModel: 'BCD-335', brand: '海尔', faultDesc: '冰箱化霜加热丝烧断', faultType: '电气故障', status: 'in_progress', urgent: false, technician: '赵明', createdAt: '2026-05-28', sparePartIds: ['sp32'] },
]

const generateInventory = (): InventoryItem[] => {
  const items: InventoryItem[] = []
  const whIds = warehouses.map(w => w.id)
  let counter = 1
  for (const part of spareParts) {
    for (const whId of whIds) {
      const baseQty = Math.floor(Math.random() * 40) + 2
      const inTransit = Math.random() > 0.6 ? Math.floor(Math.random() * 5) + 1 : 0
      items.push({
        id: `inv${counter++}`,
        partId: part.id,
        warehouseId: whId,
        quantity: baseQty,
        inTransit,
        safetyLine: part.safetyStock,
      })
    }
  }
  return items
}

export const inventoryItems: InventoryItem[] = generateInventory()

export const requisitions: Requisition[] = [
  { id: 'req1', reqNo: 'REQ-2026-0001', workOrderId: 'wo1', applicant: '李强', warehouseId: 'wh1', status: 'pending', urgent: true, needsApproval: true, approver: '王主管', createdAt: '2026-06-07', items: [{ id: 'ri1', partId: 'sp1', quantity: 1, substituted: false, originalPartId: '' }] },
  { id: 'req2', reqNo: 'REQ-2026-0002', workOrderId: 'wo2', applicant: '赵明', warehouseId: 'wh1', status: 'approved', urgent: false, needsApproval: true, approver: '王主管', createdAt: '2026-06-07', items: [{ id: 'ri2', partId: 'sp8', quantity: 1, substituted: false, originalPartId: '' }, { id: 'ri3', partId: 'sp10', quantity: 1, substituted: false, originalPartId: '' }] },
  { id: 'req3', reqNo: 'REQ-2026-0003', workOrderId: 'wo3', applicant: '孙华', warehouseId: 'wh2', status: 'shipped', urgent: false, needsApproval: true, approver: '王主管', createdAt: '2026-06-06', items: [{ id: 'ri4', partId: 'sp14', quantity: 1, substituted: false, originalPartId: '' }, { id: 'ri5', partId: 'sp26', quantity: 2, substituted: false, originalPartId: '' }] },
  { id: 'req4', reqNo: 'REQ-2026-0004', workOrderId: 'wo4', applicant: '李强', warehouseId: 'wh3', status: 'pending', urgent: false, needsApproval: false, approver: '', createdAt: '2026-06-06', items: [{ id: 'ri6', partId: 'sp5', quantity: 1, substituted: false, originalPartId: '' }] },
  { id: 'req5', reqNo: 'REQ-2026-0005', workOrderId: 'wo6', applicant: '李强', warehouseId: 'wh1', status: 'pending', urgent: true, needsApproval: true, approver: '刘经理', createdAt: '2026-06-05', items: [{ id: 'ri7', partId: 'sp4', quantity: 1, substituted: false, originalPartId: '' }] },
  { id: 'req6', reqNo: 'REQ-2026-0006', workOrderId: 'wo7', applicant: '赵明', warehouseId: 'wh4', status: 'approved', urgent: false, needsApproval: true, approver: '王主管', createdAt: '2026-06-05', items: [{ id: 'ri8', partId: 'sp11', quantity: 1, substituted: false, originalPartId: '' }] },
  { id: 'req7', reqNo: 'REQ-2026-0007', workOrderId: 'wo8', applicant: '孙华', warehouseId: 'wh5', status: 'shipped', urgent: false, needsApproval: false, approver: '', createdAt: '2026-06-04', items: [{ id: 'ri9', partId: 'sp17', quantity: 1, substituted: false, originalPartId: '' }] },
  { id: 'req8', reqNo: 'REQ-2026-0008', workOrderId: 'wo9', applicant: '李强', warehouseId: 'wh1', status: 'shipped', urgent: false, needsApproval: false, approver: '', createdAt: '2026-06-03', items: [{ id: 'ri10', partId: 'sp3', quantity: 1, substituted: false, originalPartId: '' }] },
  { id: 'req9', reqNo: 'REQ-2026-0009', workOrderId: 'wo11', applicant: '孙华', warehouseId: 'wh2', status: 'rejected', urgent: false, needsApproval: true, approver: '王主管', createdAt: '2026-06-04', items: [{ id: 'ri11', partId: 'sp15', quantity: 1, substituted: true, originalPartId: 'sp14' }] },
  { id: 'req10', reqNo: 'REQ-2026-0010', workOrderId: 'wo13', applicant: '周伟', warehouseId: 'wh3', status: 'pending', urgent: false, needsApproval: true, approver: '王主管', createdAt: '2026-06-03', items: [{ id: 'ri12', partId: 'sp33', quantity: 1, substituted: false, originalPartId: '' }] },
]

export const transfers: Transfer[] = [
  { id: 'tf1', transferNo: 'TF-2026-0001', fromWarehouseId: 'wh1', toWarehouseId: 'wh3', status: 'shipping', courier: '顺丰速运', trackingNo: 'SF1234567890', createdAt: '2026-06-07', items: [{ id: 'ti1', partId: 'sp1', quantity: 2 }, { id: 'ti2', partId: 'sp3', quantity: 5 }] },
  { id: 'tf2', transferNo: 'TF-2026-0002', fromWarehouseId: 'wh2', toWarehouseId: 'wh1', status: 'received', courier: '中通快递', trackingNo: 'ZT9876543210', createdAt: '2026-06-06', items: [{ id: 'ti3', partId: 'sp8', quantity: 3 }] },
  { id: 'tf3', transferNo: 'TF-2026-0003', fromWarehouseId: 'wh3', toWarehouseId: 'wh4', status: 'pending', courier: '', trackingNo: '', createdAt: '2026-06-06', items: [{ id: 'ti4', partId: 'sp14', quantity: 2 }, { id: 'ti5', partId: 'sp16', quantity: 1 }] },
  { id: 'tf4', transferNo: 'TF-2026-0004', fromWarehouseId: 'wh1', toWarehouseId: 'wh5', status: 'shipping', courier: '京东物流', trackingNo: 'JD2024060500001', createdAt: '2026-06-05', items: [{ id: 'ti6', partId: 'sp5', quantity: 4 }, { id: 'ti7', partId: 'sp7', quantity: 2 }] },
  { id: 'tf5', transferNo: 'TF-2026-0005', fromWarehouseId: 'wh4', toWarehouseId: 'wh2', status: 'received', courier: '顺丰速运', trackingNo: 'SF0987654321', createdAt: '2026-06-04', items: [{ id: 'ti8', partId: 'sp11', quantity: 1 }] },
  { id: 'tf6', transferNo: 'TF-2026-0006', fromWarehouseId: 'wh5', toWarehouseId: 'wh3', status: 'pending', courier: '', trackingNo: '', createdAt: '2026-06-03', items: [{ id: 'ti9', partId: 'sp19', quantity: 3 }, { id: 'ti10', partId: 'sp20', quantity: 5 }] },
  { id: 'tf7', transferNo: 'TF-2026-0007', fromWarehouseId: 'wh2', toWarehouseId: 'wh4', status: 'shipping', courier: '韵达快递', trackingNo: 'YD5678901234', createdAt: '2026-06-02', items: [{ id: 'ti11', partId: 'sp33', quantity: 2 }] },
]

export const recoveries: Recovery[] = [
  { id: 'rc1', recoveryNo: 'RC-2026-0001', workOrderId: 'wo9', partId: 'sp3', status: 'received', serialNo: 'CAP-2024-A001', serialMismatch: false, courier: '顺丰速运', trackingNo: 'SF1112223334', returnDate: '2026-06-06', disposal: 'scrap', overdueDays: 0 },
  { id: 'rc2', recoveryNo: 'RC-2026-0002', workOrderId: 'wo10', partId: 'sp12', status: 'shipping', serialNo: 'FAN-2023-B456', serialMismatch: false, courier: '中通快递', trackingNo: 'ZT4445556667', returnDate: '2026-06-07', disposal: 'stock_in', overdueDays: 0 },
  { id: 'rc3', recoveryNo: 'RC-2026-0003', workOrderId: 'wo14', partId: 'sp9', status: 'abnormal', serialNo: 'CMP-2025-C789', serialMismatch: true, courier: '', trackingNo: '', returnDate: '', disposal: '', overdueDays: 0 },
  { id: 'rc4', recoveryNo: 'RC-2026-0004', workOrderId: 'wo17', partId: 'sp3', status: 'registered', serialNo: 'CAP-2023-D012', serialMismatch: false, courier: '', trackingNo: '', returnDate: '', disposal: '', overdueDays: 5 },
  { id: 'rc5', recoveryNo: 'RC-2026-0005', workOrderId: 'wo19', partId: 'sp18', status: 'received', serialNo: 'SEL-2024-E345', serialMismatch: false, courier: '京东物流', trackingNo: 'JD8889990001', returnDate: '2026-06-05', disposal: 'scrap', overdueDays: 0 },
  { id: 'rc6', recoveryNo: 'RC-2026-0006', workOrderId: 'wo20', partId: 'sp28', status: 'shipping', serialNo: 'VAL-2023-F678', serialMismatch: false, courier: '韵达快递', trackingNo: 'YD2223334445', returnDate: '2026-06-06', disposal: 'stock_in', overdueDays: 0 },
  { id: 'rc7', recoveryNo: 'RC-2026-0007', workOrderId: 'wo23', partId: 'sp30', status: 'pending', serialNo: '', serialMismatch: false, courier: '', trackingNo: '', returnDate: '', disposal: '', overdueDays: 3 },
  { id: 'rc8', recoveryNo: 'RC-2026-0008', workOrderId: 'wo24', partId: 'sp29', status: 'abnormal', serialNo: 'RCU-2022-G901', serialMismatch: true, courier: '', trackingNo: '', returnDate: '', disposal: '', overdueDays: 8 },
  { id: 'rc9', recoveryNo: 'RC-2026-0009', workOrderId: 'wo3', partId: 'sp26', status: 'pending', serialNo: '', serialMismatch: false, courier: '', trackingNo: '', returnDate: '', disposal: '', overdueDays: 1 },
  { id: 'rc10', recoveryNo: 'RC-2026-0010', workOrderId: 'wo5', partId: 'sp19', status: 'registered', serialNo: 'HTR-2024-H234', serialMismatch: false, courier: '', trackingNo: '', returnDate: '', disposal: '', overdueDays: 0 },
]

export const monthlyStats: MonthlyStat[] = [
  { month: '2026-01', turnoverRate: 3.2, fixRate: 82, inventoryValue: 1850000, requisitionCount: 145, transferCount: 23, recoveryCount: 98 },
  { month: '2026-02', turnoverRate: 2.8, fixRate: 79, inventoryValue: 1920000, requisitionCount: 128, transferCount: 19, recoveryCount: 85 },
  { month: '2026-03', turnoverRate: 3.5, fixRate: 85, inventoryValue: 1780000, requisitionCount: 162, transferCount: 28, recoveryCount: 112 },
  { month: '2026-04', turnoverRate: 3.8, fixRate: 87, inventoryValue: 1720000, requisitionCount: 175, transferCount: 31, recoveryCount: 120 },
  { month: '2026-05', turnoverRate: 4.1, fixRate: 89, inventoryValue: 1680000, requisitionCount: 188, transferCount: 35, recoveryCount: 135 },
  { month: '2026-06', turnoverRate: 3.9, fixRate: 88, inventoryValue: 1710000, requisitionCount: 95, transferCount: 18, recoveryCount: 68 },
]

export const brandStats: BrandStat[] = [
  { brand: '格力', fixRate: 90, turnoverRate: 4.2, inventoryValue: 680000 },
  { brand: '海尔', fixRate: 87, turnoverRate: 3.8, inventoryValue: 560000 },
  { brand: '美的', fixRate: 85, turnoverRate: 3.5, inventoryValue: 420000 },
  { brand: '三花', fixRate: 92, turnoverRate: 4.5, inventoryValue: 85000 },
  { brand: '通用', fixRate: 94, turnoverRate: 5.1, inventoryValue: 120000 },
]

export const regionStats: RegionStat[] = [
  { region: '华东', fixRate: 91, turnoverRate: 4.3, inventoryValue: 520000 },
  { region: '华南', fixRate: 88, turnoverRate: 3.9, inventoryValue: 460000 },
  { region: '华北', fixRate: 86, turnoverRate: 3.6, inventoryValue: 380000 },
  { region: '西南', fixRate: 84, turnoverRate: 3.2, inventoryValue: 290000 },
  { region: '华中', fixRate: 87, turnoverRate: 3.7, inventoryValue: 340000 },
]

export const faultTypeStats: FaultTypeStat[] = [
  { faultType: '电气故障', count: 48, fixRate: 86 },
  { faultType: '制冷故障', count: 35, fixRate: 91 },
  { faultType: '机械故障', count: 22, fixRate: 88 },
  { faultType: '排水故障', count: 15, fixRate: 93 },
  { faultType: '漏水故障', count: 12, fixRate: 95 },
  { faultType: '制热故障', count: 10, fixRate: 82 },
  { faultType: '噪音故障', count: 8, fixRate: 90 },
  { faultType: '外观故障', count: 6, fixRate: 97 },
]
