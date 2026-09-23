export type UserRole = 'OWNER' | 'ADMIN' | 'EMPLOYEE';

export interface UserAccount {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  roleTitle: string;
  department: string;
  branch: string;
  avatarUrl?: string;
  status: 'ACTIVE' | 'INACTIVE';
  lastLogin: string;
  phone: string;
}

export type ProductCategory = 
  | 'Keramik & Granit'
  | 'Sanitari & Faucet'
  | 'Cat & Pelapis'
  | 'Semen & Mortar'
  | 'Pintu & Hardware'
  | 'Baja Ringan & Atap';

export interface Product {
  id: string;
  sku: string;
  barcode: string;
  name: string;
  category: ProductCategory;
  unit: string; // Dus, Pcs, Sak, Pail, Batang
  buyPrice: number; // HPP (Harga Pokok Penjualan)
  sellPrice: number; // Harga Jual
  stock: number;
  minStock: number;
  location: string; // e.g. Rak A-02, Gudang 1
  supplier: string;
  description: string;
  images: string[];
}

export interface CartItem {
  product: Product;
  quantity: number;
  discountPercent: number;
  note?: string;
}

export type PaymentMethod = 'TUNAI' | 'QRIS' | 'TEMPO' | 'TRANSFER_BANK';

export type PaymentStatus = 'LUNAS' | 'BELUM_LUNAS' | 'JATUH_TEMPO' | 'SEBAGIAN';

export interface TransactionOrder {
  id: string; // e.g. TRX-202609-0012
  invoiceNumber: string;
  date: string;
  customerId: string;
  customerName: string;
  customerPhone: string;
  customerType: 'UMUM' | 'KONTRAKTOR' | 'PARTNER';
  items: {
    productId: string;
    productName: string;
    sku: string;
    quantity: number;
    unit: string;
    unitPrice: number;
    discount: number;
    subtotal: number;
  }[];
  subtotal: number;
  discountTotal: number;
  taxAmount: number; // PPN 11%
  grandTotal: number;
  paidAmount: number;
  changeAmount: number;
  paymentMethod: PaymentMethod;
  paymentStatus: PaymentStatus;
  cashierName: string;
  notes?: string;
  deliveryNeeded: boolean;
  dueDate?: string; // For TEMPO
}

export type DeliveryStatus = 'SIAP_KIRIM' | 'DALAM_PERJALANAN' | 'TERKIRIM' | 'BATAL';

export interface DeliveryOrder {
  id: string;
  suratJalanNo: string; // SJ-2026-XXXX
  orderId: string;
  customerName: string;
  customerPhone: string;
  address: string;
  courierName: string;
  courierPhone: string;
  vehiclePlate: string;
  status: DeliveryStatus;
  departureTime?: string;
  estimatedArrival?: string;
  deliveredTime?: string;
  itemsSummary: string;
  notes?: string;
  podProof?: {
    receivedBy: string;
    relationship: string;
    receivedAt: string;
    photoUrl?: string;
    signatureUrl?: string;
  };
}

export interface Customer {
  id: string;
  code: string;
  name: string;
  company?: string;
  type: 'PLATINUM' | 'GOLD' | 'REGULAR';
  phone: string;
  email: string;
  address: string;
  creditLimit: number;
  usedCredit: number;
  totalOrders: number;
  totalSpend: number;
  agingBreakdown: {
    current: number; // <30 hari
    days30to60: number; // 30-60 hari
    over60: number; // >60 hari (Jatuh tempo)
  };
  lastTransactionDate: string;
}

export type AttendanceStatus = 'TEPAT_WAKTU' | 'TERLAMBAT' | 'IZIN' | 'CUTI' | 'ALPHA';

export interface AttendanceRecord {
  id: string;
  employeeId: string;
  employeeName: string;
  department: string;
  date: string;
  clockInTime?: string;
  clockOutTime?: string;
  status: AttendanceStatus;
  locationName?: string;
  notes?: string;
  isSelfieVerified: boolean;
}

export interface EmployeePayroll {
  id: string;
  employeeId: string;
  employeeName: string;
  roleTitle: string;
  department: string;
  period: string; // e.g. "September 2026"
  baseSalary: number;
  positionAllowance: number;
  salesIncentive: number;
  overtimePay: number;
  bpjsDeduction: number;
  latePenaltyDeduction: number;
  taxPph21: number;
  netSalary: number;
  status: 'DRAFT' | 'APPROVED' | 'PAID';
  paymentDate?: string;
}
