import React, { useState } from 'react';
import { 
  INITIAL_USERS, 
  INITIAL_PRODUCTS, 
  INITIAL_ORDERS, 
  INITIAL_DELIVERIES, 
  INITIAL_CUSTOMERS, 
  INITIAL_ATTENDANCE, 
  INITIAL_PAYROLL 
} from './data/mockData';
import { 
  UserAccount, 
  Product, 
  TransactionOrder, 
  DeliveryOrder, 
  Customer, 
  AttendanceRecord, 
  EmployeePayroll, 
  DeliveryStatus 
} from './types';
import { Navbar } from './components/layout/Navbar';
import { Sidebar, ScreenId } from './components/layout/Sidebar';
import { AuthScreen } from './components/screens/AuthScreen';
import { DashboardScreen } from './components/screens/DashboardScreen';
import { PosScreen } from './components/screens/PosScreen';
import { InventoryScreen } from './components/screens/InventoryScreen';
import { LogisticsScreen } from './components/screens/LogisticsScreen';
import { CustomerScreen } from './components/screens/CustomerScreen';
import { HRPayrollScreen } from './components/screens/HRPayrollScreen';
import { UserManagementScreen } from './components/screens/UserManagementScreen';
import { DesignSystemModal } from './components/modals/DesignSystemModal';
import { ToastContainer, ToastMessage } from './components/ui/Toast';
import { formatRupiah } from './utils/formatters';

export default function App() {
  // Authentication & Current User State
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(true);
  const [currentUser, setCurrentUser] = useState<UserAccount>(INITIAL_USERS[0]); // Default to Owner
  const [users, setUsers] = useState<UserAccount[]>(INITIAL_USERS);

  // Active Screen Navigation
  const [currentScreen, setCurrentScreen] = useState<ScreenId>('dashboard');

  // Mobile drawer state for narrow screens
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false);

  // Enterprise Data States
  const [products, setProducts] = useState<Product[]>(INITIAL_PRODUCTS);
  const [orders, setOrders] = useState<TransactionOrder[]>(INITIAL_ORDERS);
  const [deliveries, setDeliveries] = useState<DeliveryOrder[]>(INITIAL_DELIVERIES);
  const [customers, setCustomers] = useState<Customer[]>(INITIAL_CUSTOMERS);
  const [attendanceRecords, setAttendanceRecords] = useState<AttendanceRecord[]>(INITIAL_ATTENDANCE);
  const [payrollRecords, setPayrollRecords] = useState<EmployeePayroll[]>(INITIAL_PAYROLL);

  // Design System Spec Modal State
  const [isDesignSystemOpen, setIsDesignSystemOpen] = useState(false);

  // Toast Notifications
  const [toasts, setToasts] = useState<ToastMessage[]>([]);

  const addToast = (type: ToastMessage['type'], title: string, message?: string) => {
    const id = Date.now().toString();
    setToasts(prev => [...prev, { id, type, title, message }]);
    setTimeout(() => {
      setToasts(prev => prev.filter(t => t.id !== id));
    }, 4000);
  };

  const removeToast = (id: string) => {
    setToasts(prev => prev.filter(t => t.id !== id));
  };

  // Auth Handlers
  const handleLogin = (user: UserAccount) => {
    setCurrentUser(user);
    setIsAuthenticated(true);
    addToast('success', `Selamat Datang, ${user.name}`, `Masuk sebagai ${user.roleTitle}`);
    if (user.role === 'ADMIN') setCurrentScreen('pos');
    else if (user.role === 'EMPLOYEE' && user.department.includes('Logistik')) setCurrentScreen('logistics');
    else setCurrentScreen('dashboard');
  };

  const handleLogout = () => {
    setIsAuthenticated(false);
    addToast('info', 'Anda telah keluar', 'Sesi operasional diakhiri');
  };

  const handleSwitchUser = (user: UserAccount) => {
    setCurrentUser(user);
    addToast('info', `Beralih Peran: ${user.role}`, `${user.name} (${user.roleTitle})`);
  };

  // Screen Title for Breadcrumb
  const screenTitles: Record<ScreenId, string> = {
    dashboard: 'Executive Dashboard & Analitik',
    pos: 'Point of Sale (Kasir Operasional)',
    inventory: 'Manajemen Produk & Stok',
    logistics: 'Pengiriman & Logistik Armada',
    customers: 'Pelanggan & Piutang Usaha (AR)',
    hr_payroll: 'SDM, Presensi & Payroll',
    users: 'Pengaturan User & Hak Akses',
  };

  // Business Action Handlers
  const handleCompleteTransaction = (newOrder: TransactionOrder, newDelivery?: DeliveryOrder) => {
    setOrders(prev => [newOrder, ...prev]);

    // Deduct stock for each purchased item
    setProducts(prevProducts => {
      return prevProducts.map(prod => {
        const cartItem = newOrder.items.find(i => i.productId === prod.id);
        if (cartItem) {
          const newStock = Math.max(0, prod.stock - cartItem.quantity);
          return { ...prod, stock: newStock };
        }
        return prod;
      });
    });

    // Update customer AR if payment method is TEMPO
    if (newOrder.paymentMethod === 'TEMPO') {
      setCustomers(prevCust => {
        return prevCust.map(c => {
          if (c.id === newOrder.customerId) {
            return {
              ...c,
              usedCredit: c.usedCredit + newOrder.grandTotal,
              totalOrders: c.totalOrders + 1,
              totalSpend: c.totalSpend + newOrder.grandTotal,
              agingBreakdown: {
                ...c.agingBreakdown,
                current: c.agingBreakdown.current + newOrder.grandTotal,
              },
            };
          }
          return c;
        });
      });
    }

    if (newDelivery) {
      setDeliveries(prev => [newDelivery, ...prev]);
      addToast('success', 'Faktur & Surat Jalan Diterbitkan', `${newOrder.invoiceNumber} · SJ Siap Muat`);
    } else {
      addToast('success', 'Transaksi Kasir Berhasil', `Faktur ${newOrder.invoiceNumber} (${newOrder.paymentMethod})`);
    }
  };

  const handleAddProduct = (newProduct: Product) => {
    setProducts(prev => [newProduct, ...prev]);
    addToast('success', 'Produk Ditambahkan', `${newProduct.name} (${newProduct.sku})`);
  };

  const handleUpdateProduct = (updated: Product) => {
    setProducts(prev => prev.map(p => p.id === updated.id ? updated : p));
    addToast('success', 'Data Produk Diperbarui', updated.name);
  };

  const handleStockAdjustment = (productId: string, amount: number, type: 'IN' | 'OUT', reason: string) => {
    setProducts(prev => {
      return prev.map(p => {
        if (p.id === productId) {
          const newStock = type === 'IN' ? p.stock + amount : Math.max(0, p.stock - amount);
          return { ...p, stock: newStock };
        }
        return p;
      });
    });
    addToast('info', `Mutasi Stok ${type === 'IN' ? 'Masuk' : 'Keluar'} Berhasil`, `${amount} unit · ${reason}`);
  };

  const handleUpdateDeliveryStatus = (
    deliveryId: string, 
    nextStatus: DeliveryStatus, 
    notes?: string, 
    podProof?: DeliveryOrder['podProof']
  ) => {
    setDeliveries(prev => {
      return prev.map(d => {
        if (d.id === deliveryId) {
          return {
            ...d,
            status: nextStatus,
            departureTime: nextStatus === 'DALAM_PERJALANAN' ? new Date().toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' }) + ' WIB' : d.departureTime,
            deliveredTime: nextStatus === 'TERKIRIM' ? new Date().toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' }) + ' WIB' : d.deliveredTime,
            notes: notes || d.notes,
            podProof: podProof || d.podProof,
          };
        }
        return d;
      });
    });
    addToast('success', 'Status Pengiriman Diperbarui', `Surat Jalan kini: ${nextStatus.replace('_', ' ')}`);
  };

  const handleAssignCourier = (deliveryId: string, courierName: string, vehiclePlate: string) => {
    setDeliveries(prev => {
      return prev.map(d => {
        if (d.id === deliveryId) {
          return { ...d, courierName, vehiclePlate };
        }
        return d;
      });
    });
    addToast('info', 'Penugasan Kurir Tersimpan', `${courierName} · ${vehiclePlate}`);
  };

  const handleAddCustomer = (newCustomer: Customer) => {
    setCustomers(prev => [...prev, newCustomer]);
    addToast('success', 'Mitra Pelanggan Terdaftar', newCustomer.name);
  };

  const handlePayPiutang = (customerId: string, amount: number, notes: string) => {
    setCustomers(prev => {
      return prev.map(c => {
        if (c.id === customerId) {
          const newUsed = Math.max(0, c.usedCredit - amount);
          const remainingAgingCurrent = Math.max(0, c.agingBreakdown.current - amount);
          return {
            ...c,
            usedCredit: newUsed,
            agingBreakdown: {
              ...c.agingBreakdown,
              current: remainingAgingCurrent,
            },
          };
        }
        return c;
      });
    });
    addToast('success', 'Pelunasan Piutang Diterima', `${formatRupiah(amount)} · ${notes}`);
  };

  const handleClockIn = (record: AttendanceRecord) => {
    setAttendanceRecords(prev => [record, ...prev]);
    addToast('success', 'Presensi Berhasil Diverifikasi', `${record.status.replace('_', ' ')} (${record.clockInTime})`);
  };

  const handleToggleUserStatus = (userId: string) => {
    setUsers(prev => {
      return prev.map(u => {
        if (u.id === userId) {
          const newStatus = u.status === 'ACTIVE' ? 'INACTIVE' : 'ACTIVE';
          addToast('info', `Status User Diubah`, `${u.name} sekarang ${newStatus === 'ACTIVE' ? 'Aktif' : 'Non-Aktif'}`);
          return { ...u, status: newStatus };
        }
        return u;
      });
    });
  };

  // If not authenticated, show Screen 1
  if (!isAuthenticated) {
    return (
      <>
        <AuthScreen onLoginSuccess={handleLogin} availableUsers={users} />
        <ToastContainer toasts={toasts} onDismiss={removeToast} />
      </>
    );
  }

  // Count Badges for Sidebar
  const lowStockCount = products.filter(p => p.stock <= p.minStock).length;
  const activeDeliveryCount = deliveries.filter(d => d.status === 'SIAP_KIRIM' || d.status === 'DALAM_PERJALANAN').length;
  const pendingPiutangCount = customers.filter(c => c.usedCredit > 0).length;

  return (
    <div className="min-h-screen bg-[#0a0d14] flex flex-col font-sans text-slate-100 selection:bg-amber-500/30 selection:text-amber-200">
      
      {/* Top Bar (Navbar) */}
      <Navbar
        currentUser={currentUser}
        onOpenDesignSystem={() => setIsDesignSystemOpen(true)}
        onLogout={handleLogout}
        activeScreenTitle={screenTitles[currentScreen]}
        onToggleMobileSidebar={() => setIsMobileSidebarOpen(prev => !prev)}
        isMobileSidebarOpen={isMobileSidebarOpen}
      />

      {/* Main Workspace Layout (Sidebar + Responsive Main Content) */}
      <div className="flex-1 flex overflow-hidden relative">
        
        <Sidebar
          currentScreen={currentScreen}
          onSelectScreen={setCurrentScreen}
          userRole={currentUser.role}
          lowStockCount={lowStockCount}
          activeDeliveryCount={activeDeliveryCount}
          pendingPiutangCount={pendingPiutangCount}
          isMobileOpen={isMobileSidebarOpen}
          onCloseMobile={() => setIsMobileSidebarOpen(false)}
        />

        <main className="flex-1 overflow-y-auto bg-[#0a0d14] min-w-0">
          {currentScreen === 'dashboard' && (
            <DashboardScreen
              orders={orders}
              products={products}
              deliveries={deliveries}
              customers={customers}
              onNavigateTo={setCurrentScreen}
              onViewOrder={(order) => {
                setCurrentScreen('pos');
                addToast('info', 'Memuat Riwayat Faktur Kasir', order.invoiceNumber);
              }}
            />
          )}

          {currentScreen === 'pos' && (
            <PosScreen
              products={products}
              customers={customers}
              onCompleteTransaction={handleCompleteTransaction}
              currentUser={currentUser}
            />
          )}

          {currentScreen === 'inventory' && (
            <InventoryScreen
              products={products}
              onAddProduct={handleAddProduct}
              onUpdateProduct={handleUpdateProduct}
              onStockAdjustment={handleStockAdjustment}
            />
          )}

          {currentScreen === 'logistics' && (
            <LogisticsScreen
              deliveries={deliveries}
              onUpdateDeliveryStatus={handleUpdateDeliveryStatus}
              onAssignCourier={handleAssignCourier}
            />
          )}

          {currentScreen === 'customers' && (
            <CustomerScreen
              customers={customers}
              orders={orders}
              onAddCustomer={handleAddCustomer}
              onPayPiutang={handlePayPiutang}
            />
          )}

          {currentScreen === 'hr_payroll' && (
            <HRPayrollScreen
              attendanceRecords={attendanceRecords}
              payrollRecords={payrollRecords}
              currentUser={currentUser}
              onClockIn={handleClockIn}
            />
          )}

          {currentScreen === 'users' && (
            <UserManagementScreen
              users={users}
              onToggleUserStatus={handleToggleUserStatus}
              onAddUser={(newUser) => {
                setUsers(prev => [...prev, newUser]);
                addToast('success', 'Pengguna Ditambahkan', newUser.name);
              }}
            />
          )}
        </main>

      </div>

      {/* Design System & Figma Spec Modal */}
      <DesignSystemModal
        isOpen={isDesignSystemOpen}
        onClose={() => setIsDesignSystemOpen(false)}
      />

      {/* Global Toast Notifications Container */}
      <ToastContainer toasts={toasts} onDismiss={removeToast} />

    </div>
  );
}
