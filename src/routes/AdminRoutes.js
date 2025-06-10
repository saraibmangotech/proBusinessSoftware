import VendorLedger from "pages/Dashboard/Accounts/VendorLedger";
import CreateServiceInvoice from "pages/Dashboard/AddOnServices/CreateServiceInvoice";
import ServiceInvoiceDetail from "pages/Dashboard/AddOnServices/ServiceInvoiceDetail";
import ServiceInvoice from "pages/Dashboard/AddOnServices/ServiceInvoive";
import UpdateServiceInvoice from "pages/Dashboard/AddOnServices/UpdateServiceInvoice";
import Certificate from "pages/Dashboard/Certificate/Certificate";
import CreateSalaryCertificate from "pages/Dashboard/Certificate/CreateSalaryCertificate";
import SalaryCertificate from "pages/Dashboard/Certificate/SalaryCertificate";
import VehicleAvailableForTT from "pages/Dashboard/Client/VehiclesAvailableForTT";
import UpdateAgent from "pages/Dashboard/Commission/UpdateAgent";
import GalaxyCustomers from "pages/Dashboard/Customers/GalaxyCustomers";
import MyCustomers from "pages/Dashboard/Customers/MyCustomers";
import MyVehicles from "pages/Dashboard/Customers/MyVehicles";
import UpdateCustomer from "pages/Dashboard/Customers/UpdateCustomer";
import SystemSettings from "pages/Dashboard/Settings/SystemSettings";

import CandidateDetail from "pages/Dashboard/Visa/CandidateDetail";
import VisaDetail from "pages/Dashboard/Visa/VisaDetail";
import VisaProcessing from "pages/Dashboard/VisaProcessing/VisaProcessingList";
import VisaInvoice from "pages/Dashboard/VisaProcessing/VisaInvoice";
import ActiveVisaList from "pages/Dashboard/VisaProcessing/ActiveVisaList";
import RenewVisaList from "pages/Dashboard/VisaProcessing/RenewVisaList";

import React, { lazy } from "react";
import DraftDetail from "pages/Dashboard/Visa/DraftDetail";
import VisaManagementInvoice from "pages/Dashboard/Visa/VisaManagmentInvoice2";
import CanceledVisaList from "pages/Dashboard/VisaProcessing/CanceledVisaList";
import AbsconderVisaList from "pages/Dashboard/VisaProcessing/AbsconderList";
import RenewInvoice from "pages/Dashboard/VisaProcessing/RenewInvoice1";
import AbsconderInvoice from "pages/Dashboard/VisaProcessing/AbsconderInvoice1";
import CanceledInvoice from "pages/Dashboard/VisaProcessing/CancelledInvoice1";
import RenewDetail from "pages/Dashboard/VisaProcessing/RenewDetails";
import AbsconderDetail from "pages/Dashboard/VisaProcessing/AbsconderDetail";
import CanceledDetail from "pages/Dashboard/VisaProcessing/CanceledDetail";
import DraftVisas from "pages/Dashboard/Visa/DraftVisas";
import CreateMonthlyInvoice from "pages/Dashboard/InvoicesPayments/CreateMonthlyInvoice";
import MonthlyServiceInvoices from "pages/Dashboard/InvoicesPayments/MonthlyServiceInvoices";
import MonthlyInvoice from "pages/Dashboard/InvoicesPayments/MonthlyInvoice1";
import Payments from "pages/Dashboard/InvoicesPayments/Payments";
import Invoices from "pages/Dashboard/InvoicesPayments/Invoices";
import VisaSalesRevenue from "pages/Dashboard/Reports/VisaSalesRevenue";
import ReceivableAging from "pages/Dashboard/Reports/ReceiveableAging";
import MonthlyBillingRevenue from "pages/Dashboard/Reports/MonthlyBillingRevenue";
import CustomerViseTotalVisa from "pages/Dashboard/Reports/CustomerViseTotalVisa";
import CustomerViseRequestList from "pages/Dashboard/Reports/CustomerViseRequestList";
import CustomerViseBillingReport from "pages/Dashboard/Reports/CustomerViseBillingReport";
import MasterReport from "pages/Dashboard/Reports/MasterReport";
import VisaProcessingList from "pages/Dashboard/VisaProcessing/VisaProcessingList";
import UpdateAccount from "pages/Dashboard/Accounts/UpdateAccount";
import AccountSetting from "pages/Dashboard/AccountSetting";
import Notification from "pages/Dashboard/Notifications";
import UpdateVisa from "pages/Dashboard/Visa/UpdateVisa";
import CustomerReport from "pages/Dashboard/Reports/CustomerReports"
import AgentViseBillingReport from "pages/Dashboard/Reports/AgentViseBillingReport";
import AgentViseVisaList from "pages/Dashboard/Reports/AgentViseVisaReport";
import ProfitLossVisaReport from "pages/Dashboard/Reporting/ProfitLossVisaReport";
import ProfitLossCustomerReport from "pages/Dashboard/Reporting/ProfitLossCustomerReport";
import RejectedVisaList from "pages/Dashboard/VisaProcessing/RejectedVisaList";
import CreditNote from "pages/Dashboard/VisaProcessing/CreditNote";
import ServiceList from "pages/Dashboard/ServiceItem/ServiceItemList";
import ServiceDetail from "pages/Dashboard/ServiceItem/ServiceDetail";




const CreateCustomer = lazy(() =>
  import("pages/Dashboard/Customers/CreateCustomer")
);
const CreateCategory = lazy(() =>
  import("pages/Dashboard/ServiceCategory/CreateCategory")
);
const CategoryList = lazy(() =>
  import("pages/Dashboard/ServiceCategory/CategoryList")
);

// const ServiceList = lazy(() =>
//   import("pages/Dashboard/ServiceCategory/ServiceList")
// );
const CostSetup = lazy(() =>
  import("pages/Dashboard/Settings/CostSetup")
);
const RateSetup = lazy(() =>
  import("pages/Dashboard/Settings/RatesSetup")
);
const CustomerQueue = lazy(() =>
  import("pages/Dashboard/Customers/CustomerQueue")
);
const CreateAgent = lazy(() =>
  import("pages/Dashboard/Commission/CreateAgent")
);
const CommissionList = lazy(() =>
  import("pages/Dashboard/Commission/CommissionList")
);
const VisaList = lazy(() =>
  import("pages/Dashboard/Visa/VisaList")
);
const AdminApproval = lazy(() =>
  import("pages/Dashboard/Visa/AdminApproval")
);
const WPSList = lazy(() =>
  import("pages/Dashboard/WPSManagement/WPSList")
);
const DraftVisa = lazy(() =>
  import("pages/Dashboard/Visa/DraftVisa")
);
const ExportCustomers = lazy(() =>
  import("pages/Dashboard/Customers/ExportCustomers")
);

const CustomerDetail = lazy(() =>
  import("pages/Dashboard/Customers/CustomerDetail")
);
const AgentDetail = lazy(() =>
  import("pages/Dashboard/Commission/AgentDetail")
);
const AddVisa = lazy(() =>
  import("pages/Dashboard/Visa/AddVisa")
);


const CreateAccount = lazy(() =>
  import("pages/Dashboard/Accounts/CreateAccount")
);
const AccountList = lazy(() =>
  import("pages/Dashboard/Accounts/AccountList")
);
const ChartOfAccounts = lazy(() =>
  import("pages/Dashboard/Reporting/ChartOfAccounts")
);
const TrialBalance = lazy(() =>
  import("pages/Dashboard/Reporting/TrialBalance")
);
const TrialBalanceDetailed = lazy(() =>
  import("pages/Dashboard/Reporting/TrialBalanceDetail")
);
const AccountLedger = lazy(() =>
  import("pages/Dashboard/Accounts/AccountLedger")
);
const EmployeeSalesSummary = lazy(() =>
  import("pages/Dashboard/Reports/EmployeeSalesSummary")
);

const GeneralLedger = lazy(() =>
  import("pages/Dashboard/Accounts/GeneralLedger")
);

const GeneralJournalLedger = lazy(() =>
  import("pages/Dashboard/Accounts/GeneralJournalLedger")
);

const CreateUser = lazy(() =>
  import("pages/Dashboard/UserManagement/CreateUser")
);
const UpdateUser = lazy(() =>
  import("pages/Dashboard/UserManagement/UpdateUser")
);
const UserList = lazy(() => import("pages/Dashboard/UserManagement/UserList"));
const SubCreateUser = lazy(() =>
  import("pages/Dashboard/SubUserManagement/CreateUser")
);
const SubUpdateUser = lazy(() =>
  import("pages/Dashboard/SubUserManagement/UpdateUser")
);
const SubUserList = lazy(() => import("pages/Dashboard/SubUserManagement/UserList"));

const CreateRole = lazy(() =>
  import("pages/Dashboard/RoleManagement/CreateRole")
);
const UpdateRole = lazy(() =>
  import("pages/Dashboard/RoleManagement/UpdateRole")
);
const RoleList = lazy(() => import("pages/Dashboard/RoleManagement/RoleList"));

const SubCreateRole = lazy(() =>
  import("pages/Dashboard/SubRoleManagement/CreateRole")
);
const SubUpdateRole = lazy(() =>
  import("pages/Dashboard/SubRoleManagement/UpdateRole")
);
const SubRoleList = lazy(() => import("pages/Dashboard/SubRoleManagement/RoleList"));
const Permission = lazy(() =>
  import("pages/Dashboard/RoleManagement/Permission")
);
const SubPermission = lazy(() =>
  import("pages/Dashboard/SubRoleManagement/Permission")
);





const BalanceSheet = lazy(() =>
  import("pages/Dashboard/Reporting/BalanceSheet")
);

const ProfitLossStatement = lazy(() =>
  import("pages/Dashboard/Reporting/ProfitLossStatement")
);

const CreateJournalVoucher = lazy(() =>
  import("pages/Dashboard/Accounts/CreateJournalVoucher")
);

const JournalVoucherList = lazy(() =>
  import("pages/Dashboard/Accounts/JournalVoucherList")
);
const JournalVoucherDetail = lazy(() =>
  import("pages/Dashboard/Accounts/JournalVoucherDetail")
);

const UpdateCategory = lazy(() =>
  import("pages/Dashboard/ServiceCategory/UpdateCategory")
);

const CategoryDetail = lazy(() =>
  import("pages/Dashboard/ServiceCategory/CategoryDetail")
);

const ServiceReport = lazy(() =>
  import("pages/Dashboard/Reports/ServiceReport")
);

const CollectionReport = lazy(() =>
  import("pages/Dashboard/Reports/CollectionReport")
);
const VatOutputRegister = lazy(() =>
  import("pages/Dashboard/Reports/VatOutputRegister")
);
const VatInputRegister = lazy(() =>
  import("pages/Dashboard/Reports/VatInputRegister")
);
const CollectionDetailedReport = lazy(() =>
  import("pages/Dashboard/Reports/CollectionDetailedReport")
);
const CreateReception = lazy(() =>
  import("pages/Dashboard/Reception/CreateReception")
);
const ReceptionList = lazy(() =>
  import("pages/Dashboard/Reception/Receptions")
);

const UpdateServiceItem = lazy(() =>
  import("pages/Dashboard/ServiceItem/UpdateServiceItem")
);
const CreateServiceItem = lazy(() =>
  import("pages/Dashboard/ServiceItem/CreateServiceItem")
);
const UpdateReception = lazy(() =>
  import("pages/Dashboard/Reception/UpdateReception")
);
const ReceptionDetail = lazy(() =>
  import("pages/Dashboard/Reception/ReceptionDetail")
);
const CreateBank = lazy(() =>
  import("pages/Dashboard/Banks/CreateBank")
);
const BankList = lazy(() =>
  import("pages/Dashboard/Banks/BankList")
);
const UpdateBank = lazy(() =>
  import("pages/Dashboard/Banks/UpdateBank")
);
const BankDetail = lazy(() =>
  import("pages/Dashboard/Banks/BankDetail")
);
const SalesReciept = lazy(() =>
  import("pages/Dashboard/SalesReciept/index")
);
const SalesReciept2 = lazy(() =>
  import("pages/Dashboard/SalesReciept/index2")
);
const PreSalesList = lazy(() =>
  import("pages/Dashboard/SalesReciept/PreSales")
);
const UpdatePreSale = lazy(() =>
  import("pages/Dashboard/SalesReciept/UpdatePreSale")
);
const CreateAldeed = lazy(() =>
  import("pages/Dashboard/AlDeed/CreateAldeed")
);
const AldeedList = lazy(() =>
  import("pages/Dashboard/AlDeed/Aldeeds")
);
const UpdateAldeed = lazy(() =>
  import("pages/Dashboard/AlDeed/UpdateAldeed")
);
const CreatePurchaseReceipt = lazy(() =>
  import("pages/Dashboard/PurchaseReceipt/CreatePurchaseReceipt")
);
const PayReceipts = lazy(() =>
  import("pages/Dashboard/Payments/PayReciepts")
);
const CreatePaidReceipt = lazy(() =>
  import("pages/Dashboard/Payments/CreatePaidReceipt")
);
const UpdatePaidReceipt = lazy(() =>
  import("pages/Dashboard/Payments/UpdateReceipt")
);
const CardList = lazy(() =>
  import("pages/Dashboard/Cards/Cards")
);
const CreateCard = lazy(() =>
  import("pages/Dashboard/Cards/CreateCard")
);
const UpdateCard = lazy(() =>
  import("pages/Dashboard/Cards/UpdateCard")
);
const CreateCustomerPayment = lazy(() =>
  import("pages/Dashboard/CustomerPayment/CreateCustomerPayment")
);
const CreateFundTransferVoucher = lazy(() =>
  import("pages/Dashboard/Finance/CreateFundTransferVoucher")
);

const FundTransferVoucherList = lazy(() =>
  import("pages/Dashboard/Finance/FundTransferVoucherList")
);
const FundTransferVoucherDetail = lazy(() =>
  import("pages/Dashboard/Finance/FundTransferVoucherDetail")
);
const CustomerPaymentList = lazy(() =>
  import("pages/Dashboard/CustomerPayment/CustomerPaymentList")
);
const UpdateCustomerPayment = lazy(() =>
  import("pages/Dashboard/CustomerPayment/CustomerPaymentDetail")
);
const SnapshotCategoryReport = lazy(() =>
  import("pages/Dashboard/Reports/SnapshotCategoryReport")
);
const SnapshotOverviewReport = lazy(() =>
  import("pages/Dashboard/Reports/SnapshotOverviewReport")
);
const CompleteTransactionReport = lazy(() =>
  import("pages/Dashboard/Reports/CompleteTransactionReport")
);
const SnapshotEmployeeServiceReport = lazy(() =>
  import("pages/Dashboard/Reports/SnapshotEmplaoyeeServiceReport")
);
const CreateCreditNote = lazy(() =>
  import("pages/Dashboard/Payments/CreateCreditNotes")
);
const CreateDebitNote= lazy(() =>
  import("pages/Dashboard/Payments/CreateDebitNote")
);
const CreatePaymentVoucher= lazy(() =>
  import("pages/Dashboard/Payments/CreatePaymentVoucher")
);
const CreateReceiptVoucher= lazy(() =>
  import("pages/Dashboard/Payments/CreateReceiptVoucher")
);
const CreateVendor= lazy(() =>
  import("pages/Dashboard/Vendors/CreateVendor")
);
const EmployeeWiseSalesReport= lazy(() =>
  import("pages/Dashboard/Reports/EmployeeWiseSalesReport")
);
const Vendors= lazy(() =>
  import("pages/Dashboard/Vendors/Vendors")
);
const UpdateVendor= lazy(() =>
  import("pages/Dashboard/Vendors/UpadteVendor")
);
const VendorDetail= lazy(() =>
  import("pages/Dashboard/Vendors/VendorDetail")
);
const CreditNotes= lazy(() =>
  import("pages/Dashboard/Payments/CreditNotes")
);
const DebitNotes= lazy(() =>
  import("pages/Dashboard/Payments/DebitNotes")
);
const PaymentVouchers= lazy(() =>
  import("pages/Dashboard/Payments/PaymentVouchers")
);
const ReceiptVouchers= lazy(() =>
  import("pages/Dashboard/Payments/ReceiptVouchers")
);
const Categories= lazy(() =>
  import("pages/Dashboard/Category/Categories")
);
const CreateProductCategory= lazy(() =>
  import("pages/Dashboard/Category/CreateCategory")
);
const UpdateProductCategory= lazy(() =>
  import("pages/Dashboard/Category/UpdateCategory")
);
const ProductCategoryDetail= lazy(() =>
  import("pages/Dashboard/Category/CategoryDetail")
);
const Products= lazy(() =>
  import("pages/Dashboard/Product/Products")
);
const CreateProduct= lazy(() =>
  import("pages/Dashboard/Product/CreateProduct")
);
const UpdateProduct= lazy(() =>
  import("pages/Dashboard/Product/UpdateProduct")
);
const ProductDetail= lazy(() =>
  import("pages/Dashboard/Product/Product-detail")
);
const CreatePurchaseInvoice= lazy(() =>
  import("pages/Dashboard/Invoice/CreatePurchaseInvoice")
);
const PurchaseInvoices= lazy(() =>
  import("pages/Dashboard/Invoice/PurchaseInvoices")
);
const UpdatePurchaseInvoice= lazy(() =>
  import("pages/Dashboard/Invoice/UpdatePurchaseInvoice")
);
const CreatePaymentInvoice= lazy(() =>
  import("pages/Dashboard/Payments/CreatePaymentInvoice")
);
const CreateSaleInvoicePayment= lazy(() =>
  import("pages/Dashboard/Payments/CreateSaleInvoicePayment")
);
const PaymentInvoices= lazy(() =>
  import("pages/Dashboard/Payments/PaymentInvoices")
);
const PurchaseInvoicePaymentList= lazy(() =>
  import("pages/Dashboard/Payments/PurchaseInvoicePaymentList")
);
const CreateVendorPayment= lazy(() =>
  import("pages/Dashboard/VendorPayments/CreateVendorPayment")
);
const UpdateVendorPayment= lazy(() =>
  import("pages/Dashboard/VendorPayments/VendorPaymentDetail")
);
const VendorPaymentList= lazy(() =>
  import("pages/Dashboard/VendorPayments/VendorPayments")
);
const CustomerLedgers= lazy(() =>
  import("pages/Dashboard/Accounts/CustomerLedgers")
);
const SupplierLedgers= lazy(() =>
  import("pages/Dashboard/Accounts/SupplierLedgers")
);
const UpdateJournalVoucher= lazy(() =>
  import("pages/Dashboard/Accounts/UpdateJournalVoucher")
);
const CreatePrepaidInvoice= lazy(() =>
  import("pages/Dashboard/Invoice/CreatePrePaidInvoices")
);
const PrepaidInvoices= lazy(() =>
  import("pages/Dashboard/Invoice/PrepaidInvoices")
);
const UpdatePrepaidInvoices= lazy(() =>
  import("pages/Dashboard/Invoice/UpdatePrepaidInvoice")
);


const UpdateFixedAssets= lazy(() =>
  import("pages/Dashboard/Invoice/UpdateFixedAssets")
);
const InventoryList= lazy(() =>
  import("pages/Dashboard/Product/InventoryList")
);
const ProductUnitList= lazy(() =>
  import("pages/Dashboard/Product/ProductUnitList")
);
const UpdatePaymentVoucher= lazy(() =>
  import("pages/Dashboard/Payments/UpdatePaymentVoucher")
);
const UpdateReceiptVoucher= lazy(() =>
  import("pages/Dashboard/Payments/UpdateReceiptVoucher")
);
const UpdateFundTransferVoucher= lazy(() =>
  import("pages/Dashboard/Finance/UpdateFundTransferVoucher")
);
const CreateEmployee= lazy(() =>
  import("pages/Dashboard/EmployeeManagement/CreateEmployee")
);
const CreateLeave= lazy(() =>
  import("pages/Dashboard/EmployeeManagement/CreateLeave")
);
const UpdateLeave= lazy(() =>
  import("pages/Dashboard/EmployeeManagement/UpdateLeave")
);
const LeaveList= lazy(() =>
  import("pages/Dashboard/EmployeeManagement/LeaveList")
);
const SalaryList= lazy(() =>
  import("pages/Dashboard/EmployeeManagement/SalaryList")
);
const ConsolidatedProStatement= lazy(() =>
  import("pages/Dashboard/Accounts/ProConsolidatedStatement")
);
const SupplierConsolidatedProStatement= lazy(() =>
  import("pages/Dashboard/Accounts/SupplierConsolidatedStatement")
);
const AccountConsolidatedProStatement= lazy(() =>
  import("pages/Dashboard/Accounts/AccountConsolidatedStatement")
);
const EmployeeList= lazy(() =>
  import("pages/Dashboard/EmployeeManagement/EmployeeList")
);
const UpdateEmployee= lazy(() =>
  import("pages/Dashboard/EmployeeManagement/UpdateEmployee")
);
const AttendanceTable= lazy(() =>
  import("pages/Dashboard/HRMS/AttendanceReport")
);


// Prepaid Expense Region

const CreatePrepaidExpense= lazy(() =>
  import("pages/Dashboard/Invoice/CreatePrepaidExpenseInvoice")
);
const PrepaidExpenseList= lazy(() =>
  import("pages/Dashboard/Invoice/PrepaidExpenseList")
);
const CreatePrepaidExpensePayment= lazy(() =>
  import("pages/Dashboard/Payments/CreateFixedAssetPayment")
);
const PrepaidExpensePaymentList= lazy(() =>
  import("pages/Dashboard/Payments/FixedAssetPayments")
);

// Fixed Asset Region

const CreateFixedAsset= lazy(() =>
  import("pages/Dashboard/Invoice/CreateFixedAssetInvoice")
);
const FixedAssetList= lazy(() =>
  import("pages/Dashboard/Invoice/FixedAssetList")
);
const CreateFixedAssetPayment= lazy(() =>
  import("pages/Dashboard/Payments/CreateFixedAssetPayment")
);
const FixedAssetPaymentList= lazy(() =>
  import("pages/Dashboard/Payments/FixedAssetPayments")
);

const FPPaymentHistory= lazy(() =>
  import("pages/Dashboard/Payments/FPPaymentHistory")
);


const AdminRoutes = [
  {
    path: "/system-settings",
    component: <SystemSettings />,
  },
  {
    path: "/attendance-report",
    component: <AttendanceTable />,
  },
  {
    path: "/prepaid-invoices",
    component: <PrepaidInvoices />,
  },
  {
    path: "/employee-list",
    component: <EmployeeList />,
  },
 
  {
    path: "/create-service-item",
    component: <CreateServiceItem />,
  },
  {
    path: "/create-employee",
    component: <CreateEmployee />,
  },
  {
    path: "/create-leave",
    component: <CreateLeave />,
  },
  {
    path: "/update-leave/:id",
    component: <UpdateLeave />,
  },
  {
    path: "/account-consolidated-statement",
    component: <AccountConsolidatedProStatement />,
  },
  {
    path: "/leave-list",
    component: <LeaveList />,
  },
  {
    path: "/salary-list",
    component: <SalaryList />,
  },
  {
    path: "/create-credit-note",
    component: <CreateCreditNote />,
  },
  {
    path: "/create-debit-note",
    component: <CreateDebitNote />,
  },
  {
    path: "/create-payment-voucher",
    component: <CreatePaymentVoucher />,
  },
  {
    path: "/create-receipt-voucher",
    component: <CreateReceiptVoucher />,
  },
  {
    path: "/create-vendor",
    component: <CreateVendor />,
  },
  {
    path: "/create-product-category",
    component: <CreateProductCategory />,
  },
  {
    path: "/employee-wise-sales-report",
    component: <EmployeeWiseSalesReport />,
  },
  {
    path: "/employee-sales-summary-report",
    component: <EmployeeSalesSummary />,
  },
  {
    path: "/inventory-list",
    component: <InventoryList />,
  },
  {
    path: "/product-unit-list",
    component: <ProductUnitList />,
  },
  {
    path: "/update-payment-voucher/:id",
    component: <UpdatePaymentVoucher />,
  },
  {
    path: "/pro-consolidated-statement",
    component: <ConsolidatedProStatement />,
  },
  {
    path: "/supplier-consolidated-statement",
    component: <SupplierConsolidatedProStatement />,
  },
  {
    path: "/update-employee/:id",
    component: <UpdateEmployee />,
  },
  {
    path: "/update-fund-transfer-voucher/:id",
    component: <UpdateFundTransferVoucher />,
  },
  {
    path: "/update-receipt-voucher/:id",
    component: <UpdateReceiptVoucher />,
  },
  {
    path: "/vendor-list",
    component: <Vendors />,
  },
  {
    path: "/payment-invoice-list",
    component: <PaymentInvoices />,
  },
  {
    path: "/purchase-payment-invoice-list",
    component: <PurchaseInvoicePaymentList />,
  },
  {
    path: "/product-list",
    component: <Products />,
  },
  {
    path: "/vendor-payment-list",
    component: <VendorPaymentList />,
  },
  {
    path: "/customer-ledgers",
    component: <CustomerLedgers />,
  },
  {
    path: "/supplier-ledgers",
    component: <SupplierLedgers />,
  },
  {
    path: "/create-product",
    component: <CreateProduct />,
  },
  {
    path: "/create-purchase-invoice",
    component: <CreatePurchaseInvoice />,
  },
  {
    path: "/purchase-invoices",
    component: <PurchaseInvoices />,
  },
  {
    path: "/create-payment-invoice",
    component: <CreatePaymentInvoice />,
  },
  {
    path: "/create-sale-invoice-payment",
    component: <CreateSaleInvoicePayment />,
  },
  {
    path: "/product-category-list",
    component: <Categories />,
  },
  {
    path: "/credit-note-list",
    component: <CreditNotes />,
  },
  {
    path: "/debit-note-list",
    component: <DebitNotes />,
  },
  {
    path: "/payment-voucher-list",
    component: <PaymentVouchers />,
  },
  {
    path: "/payment-receipt-list",
    component: <ReceiptVouchers />,
  },
  {
    path: "/service-report",
    component: <ServiceReport />,
  },
  {
    path: "/create-paid-receipt",
    component: <CreatePaidReceipt />,
  },
  {
    path: "/create-customer-payment",
    component: <CreateCustomerPayment />,
  },
  {
    path: "/update-vendor/:id",
    component: <UpdateVendor />,
  },
  {
    path: "/update-purchase-invoice/:id",
    component: <UpdatePurchaseInvoice />,
  },
  {
    path: "/product-category-detail/:id",
    component: <ProductCategoryDetail />,
  },
  {
    path: "/update-product/:id",
    component: <UpdateProduct />,
  },
  {
    path: "/update-prepaid-invoice/:id",
    component: <UpdatePrepaidInvoices />,
  },
  {
    path: "/update-fixed-assets/:id",
    component: <UpdateFixedAssets />,
  },
  {
    path: "/update-product-category/:id",
    component: <UpdateProductCategory />,
  },
  {
    path: "/vendor-detail/:id",
    component: <VendorDetail />,
  },
  {
    path: "/product-detail/:id",
    component: <ProductDetail />,
  },
  {
    path: "/create-fund-transfer",
    component: <CreateFundTransferVoucher />,
  },
  {
    path: "/fund-transfer-vouchers",
    component: <FundTransferVoucherList />,
  },
  {
    path: "/customer-payment-list",
    component: <CustomerPaymentList />,
  },
  {
    path: "/create-vendor-payment",
    component: <CreateVendorPayment />,
  },
  {
    path: "/snapshot-category-report",
    component: <SnapshotCategoryReport />,
  },
  {
    path: "/snapshot-overview-report",
    component: <SnapshotOverviewReport />,
  },
  {
    path: "/complete-transaction-report",
    component: <CompleteTransactionReport />,
  },
  {
    path: "/snapshot-employee-service-report",
    component: <SnapshotEmployeeServiceReport />,
  },
  {
    path: "/fund-transfer-voucher-detail/:id",
    component: <FundTransferVoucherDetail />,
  },
  {
    path: "/customer-payment-detail/:id",
    component: <UpdateCustomerPayment />,
  },
  {
    path: "/vendor-payment-detail/:id",
    component: <UpdateVendorPayment />,
  },
  {
    path: "/create-card",
    component: <CreateCard />,
  },
  {
    path: "/update-card/:id",
    component: <UpdateCard />,
  },
  {
    path: "/update-paid-receipt/:id",
    component: <UpdatePaidReceipt />,
  },
  {
    path: "/create-aldeed",
    component: <CreateAldeed />,
  },
  {
    path: "/paid-receipts",
    component: <PayReceipts />,
  },
  {
    path: "/card-list",
    component: <CardList />,
  },
  {
    path: "/update-card",
    component: <UpdateCard />,
  },
  {
    path: "/create-purchase-receipt",
    component: <CreatePurchaseReceipt />,
  },
  {
    path: "/aldeed-list",
    component: <AldeedList />,
  },
  {
    path: "/pre-sales",
    component: <PreSalesList />,
  },
  {
    path: "/sales-receipt",
    component: <SalesReciept />,
  },
  {
    path: "/sales-receipt-copy",
    component: <SalesReciept2 />,
  },
  {
    path: "/vat-output-register",
    component: <VatOutputRegister />,
  },
  {
    path: "/vat-input-register",
    component: <VatInputRegister />,
  },
  {
    path: "/update-presale/:id",
    component: <UpdatePreSale />,
  },
  {
    path: "/update-alded/:id",
    component: <UpdateAldeed />,
  },
  {
    path: "/update-bank/:id",
    component: <UpdateBank />,
  },
  {
    path: "/bank-detail/:id",
    component: <BankDetail />,
  },
  {
    path: "/create-bank",
    component: <CreateBank />,
  },
  {
    path: "/bank-list",
    component: <BankList />,
  },
  {
    path: "/update-service/:id",
    component: <UpdateServiceItem />,
  },
  {
    path: "/reception-detail/:id",
    component: <ReceptionDetail />,
  },
  {
    path: "/service-list",
    component: <ServiceList />,
  },
  {
    path: "/service-item-detail/:id",
    component: <ServiceDetail />,
  },
  {
    path: "/create-customer",
    component: <CreateCustomer />,
  },
  {
    path: "/create-service-category",
    component: <CreateCategory />,
  },
  
  {
    path: "/update-service-category/:id",
    component: <UpdateCategory />,
  },
  {
  path: "/service-category-detail/:id",
    component: <CategoryDetail />,
  },
  {
    path: "/create-reception",
    component: <CreateReception />,
  },
  {
    path: "/create-prepaid-invoice",
    component: <CreatePrepaidInvoice />,
  },

  {
    path: "/category-list",
    component: <CategoryList />,
  },
  {
    path: "/reception-list",
    component: <ReceptionList />,
  },
  {
    path: "/create-agent",
    component: <CreateAgent />,
  },
  {
    path: "/create-request",
    component: <AddVisa />,
  },
  {
    path: "/update-request/:id",
    component: <UpdateVisa />,
  },
  {
    path: "/update-agent/:id",
    component: <UpdateAgent />,
  },
  {
    path: "/update-customer/:id",
    component: <UpdateCustomer />,
  },
  {
    path: "/commission-list",
    component: <CommissionList />,
  },
  {
    path: "/visa-list",
    component: <VisaList />,
  },
  {
    path: "/admin-approval",
    component: <AdminApproval />,
  },
  {
    path: "/rejected-visa-list",
    component: <RejectedVisaList />,
  },
  {
    path: "/draft-visa",
    component: <DraftVisa />,
  },
  {
    path: "/draft-visas",
    component: <DraftVisas />,
  },
  {
    path: "/visa-processing-list",
    component: <VisaProcessingList />,
  },
  {
    path: "/renew-visa-list",
    component: <RenewVisaList />,
  },
  {
    path: "/view-invoice",
    component: <VisaInvoice />,
  },
  {
    path: "/create-role",
    component: <CreateRole />,
  },
  {
    path: "/create-sub-role",
    component: <SubCreateRole />,
  },
  {
    path: "/create-user",
    component: <CreateUser />,
  },
  {
    path: "/update-user",
    component: <UpdateUser />,
  },
  {
    path: "/user-list",
    component: <UserList />,
  },
  {
    path: "/create-sub-user",
    component: <SubCreateUser />,
  },
  {
    path: "/update-sub-user",
    component: <SubUpdateUser />,
  },
  {
    path: "/sub-user-list",
    component: <SubUserList />,
  },
  {
    path: "/update-role",
    component: <UpdateRole />,
  },
  {
    path: "/update-sub-role",
    component: <SubUpdateRole />,
  },
  {
    path: "/permission/:id",
    component: <Permission />,
  },
  {
    path: "/sub-permission/:id",
    component: <SubPermission />,
  },
  {
    path: "/role-list",
    component: <RoleList />,
  },
  {
    path: "/sub-role-list",
    component: <SubRoleList />,
  },
  {
    path: "/active-visa-list",
    component: <ActiveVisaList />,
  },
  {
    path: "/customer-list",
    component: <CustomerQueue />,
  },
  {
    path: "/general-ledger",
    component: <GeneralLedger />,
  },
  {
    path: "/general-journal-ledger",
    component: <GeneralJournalLedger />,
  },
  {
    path: "/profit-loss-statement",
    component: <ProfitLossStatement />,
  },
  {
    path: "/profit-loss-visa-report",
    component: <ProfitLossVisaReport />,
  },
  {
    path: "/profit-loss-customer-report",
    component: <ProfitLossCustomerReport />,
  },
  {
    path: "/balance-sheet",
    component: <BalanceSheet />,
  },
  {
    path: "/export-customers",
    component: <ExportCustomers />,
  },
  {
    path: "/galaxy-customers",
    component: <GalaxyCustomers />,
  },
  {
    path: "/chart-of-accounts",
    component: <ChartOfAccounts />,
  },
  {
    path: "/create-account",
    component: <CreateAccount />,
  },
  {
    path: "/trial-balance",
    component: <TrialBalance />,
  },
  {
    path: "/trial-balance-detailed",
    component: <TrialBalanceDetailed />,
  },
  {
    path: "/service-invoice",
    component: <ServiceInvoice />,
  },
  {
    path: "/wps-list",
    component: <WPSList />,
  },
  {
    path: "/renew-invoice/:id",
    component: <RenewInvoice />,
  },
  {
    path: "/credit_note/:id",
    component: <CreditNote />,
  },
  {
    path: "/absconder_invoice/:id",
    component: <AbsconderInvoice />,
  },
  {
    path: "/monthly-invoice/:id",
    component: <MonthlyInvoice />,
  },
  {
    path:"/customer-vise-report",
    component: <CustomerReport />,

  },
  {
    path: "/payments",
    component: <Payments />,
  },
  {
    path: "/invoices",
    component: <Invoices />,
  },
  {
    path: "/visa-sales-report",
    component: <VisaSalesRevenue />,
  },
  {
    path: "/update-account",
    component: <UpdateAccount />,
  },
  {
    path: "/receivable-aging",
    component: <ReceivableAging />,
  },
  {
    path: "/monthly-billing-revenue",
    component: <MonthlyBillingRevenue />,
  },
  {
    path: "/customer-vise-total-visa",
    component: <CustomerViseTotalVisa />,
  },
  {
    path: "/customer-vise-request-list",
    component: <CustomerViseRequestList />,
  },
  {
    path: "/customer-vise-billng-report",
    component: <CustomerViseBillingReport />,
  },
  {
    path: "/agent-vise-billng-report",
    component: <AgentViseBillingReport />,
  },
  {
    path: "/agent-vise-visa-report",
    component: <AgentViseVisaList />,
  },
  {
    path: "/master-report",
    component: <MasterReport />,
  },
  {
    path: "/create-journal-voucher",
    component: <CreateJournalVoucher />,
  },
  {
    path: "/update-journal-voucher/:id",
    component: <UpdateJournalVoucher />,
  },
  {
    path: "/journal-voucher-list",
    component: <JournalVoucherList />,
  },
  {
    path: "/create-monthly-invoice",
    component: <CreateMonthlyInvoice />,
  },
  {
    path: "/monthly-invoices",
    component: <MonthlyServiceInvoices />,
  },
  {
    path: "/cancel_invoice/:id",
    component: <CanceledInvoice />,
  },
  {
    path: "/renewed-detail/:id",
    component: <RenewDetail />,
  },
  {
    path: "/journal-voucher-detail/:id",
    component: <JournalVoucherDetail />,
  },
  {
    path: "/absconder-detail/:id",
    component: <AbsconderDetail />,
  },
  {
    path: "/cancelled-detail/:id",
    component: <CanceledDetail />,
  },
  {
    path: "/account-ledger/:id",
    component: <AccountLedger />,
  },
  {
    path: "/create-service-invoice",
    component: <CreateServiceInvoice />,
  },
  {
    path: "/salary-certificate",
    component: <SalaryCertificate />,
  },
  {
    path: "/create-new-salary-certificate",
    component: <CreateSalaryCertificate />,
  },
  {
    path: "/certificate-pdf",
    component: <Certificate />,
  },
  {
    path: "/update-service-invoice/:id",
    component: <UpdateServiceInvoice />,
  },
  {
    path: "/service-detail/:id",
    component: <ServiceInvoiceDetail />,
  },
  {
    path: "/my-customers",
    component: <MyCustomers />,
  },
  {
    path: "/account-list",
    component: <AccountList />,
  },
  {
    path: "/customer-detail/:id",
    component: <CustomerDetail />,
  },
  {
    path: "/update-reception/:id",
    component: <UpdateReception />,
  },
  {
    path: "/visa-detail/:id",
    component: <VisaDetail />,
  },
  {
    path: "/view-invoice/:id",
    component: <VisaManagementInvoice />,
  },
  {
    path: "/draft-detail/:id",
    component: <DraftDetail />,
  },
  {
    path: "/view-candidate-detail/:id",
    component: <CandidateDetail />,
  },
  {
    path: "/cancelled-visa-list",
    component: <CanceledVisaList />,
  },
  {
    path: "/absconder-visa-list",
    component: <AbsconderVisaList />,
  },
  {
    path: "/agent-detail/:id",
    component: <AgentDetail />,
  },
  {
    path: "/cost-setup",
    component: <CostSetup />,
  },
  {
    path: "/rate-setup",
    component: <RateSetup />,
  },
  {
    path: "/account-setting",
    component: <AccountSetting />,
  },
  {
    path: "/notifcations",
    component: <Notification />,
  },
  {
    path: "/collection-report",
    component: <CollectionReport />,
  },
  {
    path: "/collection-detailed-report",
    component: <CollectionDetailedReport />,
  },
  {
    path: "/prepaid-expenses",
    component: <PrepaidExpenseList />,
  },
  {
    path: "/create-prepaid-expense",
    component: <CreatePrepaidExpense />,
  },
  {
    path: "/prepaid-expense-payments",
    component: <PrepaidExpensePaymentList />,
  },
  {
    path: "/create-prepaid-expense-payment",
    component: <CreatePrepaidExpensePayment />,
  },
  {
    path: "/fixed-assets",
    component: <FixedAssetList />,
  },
  {
    path: "/create-fixed-asset",
    component: <CreateFixedAsset />,
  },
  {
    path: "/fixed-asset-payments",
    component: <FixedAssetPaymentList />,
  },
  {
    path: "/create-fixed-asset-payment",
    component: <CreateFixedAssetPayment />,
  },

  {
    path: "/fp-payment-history",
    component: <FPPaymentHistory />,
  },
 
];

export default AdminRoutes;
