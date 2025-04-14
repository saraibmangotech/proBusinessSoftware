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

const AccountLedger = lazy(() =>
  import("pages/Dashboard/Accounts/AccountLedger")
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
const AdminRoutes = [
  
  {
    path: "/create-service-item",
    component: <CreateServiceItem />,
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
 
];

export default AdminRoutes;
