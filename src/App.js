import React from "react";
import { BrowserRouter, Navigate, Route, Routes } from "react-router-dom";
import { createTheme, ThemeProvider } from "@mui/material";
import { useAuth } from "context/UseContext";
import Colors from "assets/Style/Colors";
import { ToasterContainer } from "components/Toaster";
import { ToasterComponent } from 'components/NewToaster';
import "@fontsource/public-sans";
import WebsiteLayout from "layouts/Website";
import DashboardLayout from "layouts/Dashboard";
import PublicRoutes from "routes/PublicRoutes";
import AuthRoutes from "routes/AuthRoutes";
import CustomerRoutes from "routes/CustomerRoutes";
import AdminRoutes from "routes/AdminRoutes";
import ScrollToTop from "hooks/ScrollToTop";
import Invoice from "pages/Website/Invoice";
import VaultTopUp from "pages/Website/Vault";
import PaymentReceiptPreview from "pages/Website/PaymentReceipt";
import TTPreview from "pages/Website/TT";
import ExportTTPreview from "pages/Website/ExportTT";
import VehicleTTPreview from "pages/Website/VehicleTT";
import VoucherPreview from "pages/Website/Voucher";
import ReceiptPreview from "pages/Website/Receipt";
import DamagePreview from "pages/Website/Damage";
import ShippingPreview from "pages/Website/Shipping";
import ClientInvoicePreview from "pages/Website/ClientInvoice";
import VccRefundedPreview from "pages/Website/Vcc/VccRefundedPreview";
import VccDepositedPreview from "pages/Website/VccDeposit/index";
import GatePassPreview from "pages/Website/GatePass";
import PageNotFound from "pages/Dashboard/PageNotFound";
import FundTransferVoucherPreview from "pages/Website/FundTransfer";
import JournalVoucherPreview from "pages/Website/JournalVoucher";
import ExportPaymentReceiptPreview from "pages/Website/Container";
import ExportInvoicePreview from "pages/Website/Export";
import ExportVehiclePaymentReceiptPreview from "pages/Website/ExportPayment";
import ExportVoucherDetailPreview from "pages/Website/ExportVoucher";
import ExportReceiptDetailPreview from "pages/Website/ExportReceipt";
import ExportFundTransferVoucherPreview from "pages/Website/ExportFundTransferVoucher";
import ExportJournalVoucherPreview from "pages/Website/ExportJournalVoucher";
import ExportContainerInvoicePreview from "pages/Website/ContainerInvoice";
import VatDueStatement from "pages/Website/Statements.js/VatDueReport";
import VatUnDueStatement from "pages/Website/Statements.js/VatUndueReport";
import PaidShippingSOAStatement from "pages/Website/Statements.js/PaidShippingSoa";
import UnPaidShippingSOAStatement from "pages/Website/Statements.js/UnpaidShippingSoa";
import PaidVehicleSOAList from "pages/Website/Statements.js/PaidVehicleSoa";
import UnPaidVehicleSOAList from "pages/Website/Statements.js/UnpaidVehicleSoa";
import CustomerVehicleVaultStatement from "pages/Website/Statements.js/CustomerVehicleVaultStatement";
import CustomerShippingVaultStatement from "pages/Website/Statements.js/CustomerShippingVaultStatement";
import CustomDueStatement from "pages/Website/Statements.js/DueCustomDuty";
import CustomUnDueStatement from "pages/Website/Statements.js/UnDueCustomDuty";
import ExportShippingSOAStatement from "pages/Website/Statements.js/ExportShippingSoaStatement";
import ExportCustomerVehicleVaultStatement from "pages/Website/Statements.js/ExportCustomerVehicleVault";
import { unstable_HistoryRouter as HistoryRouter } from 'react-router-dom';
import history from "services/HistoryService";


function App() {
	const { user } = useAuth();

	let theme = createTheme();
	theme = createTheme({
		palette: {
			primary: {
				main: Colors.primary,
				contrastText: Colors.white,
			},
			secondary: {
				main: Colors.secondary,
				contrastText: Colors.white,
			},
		},
		typography: {
			fontFamily: "Public Sans",
			// * md is Table size
			// * sm is mobile size
			h1: {
				fontSize: 65,
				fontWeight: 900,
				color: Colors.white,
				[theme.breakpoints.down("md")]: {
					fontSize: 45,
				},
				[theme.breakpoints.down("sm")]: {
					fontSize: 38,
				},
			},
			h2: {
				fontSize: 48,
				fontWeight: 700,
				color: Colors.textSecondary,
				[theme.breakpoints.down("md")]: {
					fontSize: 35,
				},
				[theme.breakpoints.down("sm")]: {
					fontSize: 30,
				},
			},
			h3: {
				fontSize: 32,
				fontWeight: 700,
				[theme.breakpoints.down("md")]: {
					fontSize: 28,
				},
				[theme.breakpoints.down("sm")]: {
					fontSize: 26,
				},
			},
			h4: {
				fontSize: 28,
				fontWeight: 700,
				[theme.breakpoints.down("md")]: {
					fontSize: 26,
				},
				[theme.breakpoints.down("sm")]: {
					fontSize: 22,
				},
			},
			h5: {
				fontSize: 22,
				fontWeight: 700,
				[theme.breakpoints.down("md")]: {
					fontSize: 20,
				},
				[theme.breakpoints.down("sm")]: {
					fontSize: 18,
				},
			},
			h6: {
				fontSize: 20,
				fontWeight: 500,
				[theme.breakpoints.down("md")]: {
					fontSize: 18,
				},
				[theme.breakpoints.down("sm")]: {
					fontSize: 16,
				},
			},
			subtitle1: {
				fontSize: 18,
				fontWeight: 600,
				[theme.breakpoints.down("md")]: {
					fontSize: 16,
				},
			},
			subtitle2: {
				fontSize: 17,
				fontWeight: 400,
				[theme.breakpoints.down("md")]: {
					fontSize: 15,
				},
			},
			body1: {
				fontSize: 16,
				fontWeight: 400,
				[theme.breakpoints.down("md")]: {
					fontSize: 14,
				},
			},
			body2: {
				fontSize: 14,
				fontWeight: 400,
				[theme.breakpoints.down("md")]: {
					fontSize: 12,
				},
			},
			caption: {
				fontSize: 12,
				fontWeight: 300,
				[theme.breakpoints.down("md")]: {
					fontSize: 10,
				},
			},
			overline: {
				fontSize: 10,
				fontWeight: 300,
			},
		},
	});

	return (
		<HistoryRouter history={history}>     
		{console.log(history,'historyhistory')}
		     
			<ThemeProvider theme={theme}>
				{/* ========== Toaster ========== */}
				<ToasterContainer />
				<ToasterComponent  />

				<Routes>
					<Route path={"/invoice-preview/:id"} element={<Invoice />} />

					<Route path={"/vaulttopup-preview/:id"} element={<VaultTopUp />} />
					<Route path={"/export-container-preview/:id"} element={<ExportContainerInvoicePreview />} />

					<Route
						path={"/payment-receipt-preview/:id"}
						element={<PaymentReceiptPreview />}
					/>

					<Route path={"/tt-preview/:id"} element={<TTPreview />} />
					<Route path={"/export-journal-voucher-preview/:id"} element={<ExportJournalVoucherPreview />} />
					<Route path={"/export-tt-detail-preview/:id"} element={<ExportTTPreview />} />
					<Route path={"/export-invoice-preview/:id"} element={<ExportInvoicePreview />} />
					<Route path={"/vehicle-tt-preview/:id"} element={<VehicleTTPreview />} />
					<Route path={"/shipping-detail-preview:id"} element={<ShippingPreview />} />
					<Route path={"/client-Invoice-preview/:id"} element={<ClientInvoicePreview />} />
					<Route path={"/damage-preview/:id"} element={<DamagePreview />} />
					<Route path={"/voucher-preview/:id"} element={<VoucherPreview />} />
					<Route path={"/container-receipt-preview/:id"} element={<ExportPaymentReceiptPreview />} />
					<Route path={"/receipt-preview/:id"} element={<ReceiptPreview />} />
					<Route path={"/export-preview/:id"} element={<ExportInvoicePreview />} />
					<Route path={"/export-voucher-preview/:id"} element={<ExportVoucherDetailPreview />} />
					<Route path={"/vcc-refunded-preview/:id"} element={<VccRefundedPreview />} />
					<Route path={"/export-vehicle-payment-receipt-preview/:id"} element={<ExportVehiclePaymentReceiptPreview />} />
					<Route path={"/vcc-deposited-preview/:id"} element={<VccDepositedPreview />} />
					<Route path={"fund-transfer-voucher-preview/:id"} element={<FundTransferVoucherPreview />} />
					<Route path={"journal-voucher-preview/:id"} element={<JournalVoucherPreview />} />
					<Route path={"export-receipt-preview/:id"} element={<ExportReceiptDetailPreview />} />
					<Route path={"export-fund-transfer-voucher-preview/:id"} element={<ExportFundTransferVoucherPreview />} />
					<Route path={"/gate-pass-preview/:id"} element={<GatePassPreview />} />
					<Route path={"/vat-due-statement"} element={<VatDueStatement />} />
					<Route path={"/custom-due-statement"} element={<CustomDueStatement />} />
					<Route path={"/custom-undue-statement"} element={<CustomUnDueStatement />} />
					<Route path={"/vat-undue-statement"} element={<VatUnDueStatement />} />
					<Route path={"/paid-shipping-soa-statement"} element={<PaidShippingSOAStatement />} />
					<Route path={"/unpaid-shipping-soa-statement"} element={<UnPaidShippingSOAStatement />} />
					<Route path={"/paid-vehicle-soa-statement"} element={<PaidVehicleSOAList />} />
					<Route path={"/unpaid-vehicle-soa-statement"} element={<UnPaidVehicleSOAList />} />
					<Route path={"/customer-vehicle-vault-statement"} element={<CustomerVehicleVaultStatement />} />
					<Route path={"/customer-shipping-vault-statement"} element={<CustomerShippingVaultStatement />} />
					<Route path={"/export-shipping-soa-statement"} element={<ExportShippingSOAStatement />} />
					<Route path={"/export-customer-vehicle-vault-statement"} element={<ExportCustomerVehicleVaultStatement />} />
					<Route path={"/404"} element={<PageNotFound />} />
					<Route path={"*"} element={<Navigate to="/404" />} />

					<Route element={<WebsiteLayout />}>
						{PublicRoutes.map((route, index) => (
							<Route key={index} path={route.path} element={user ? <Navigate to="/dashboard" /> :  route.component} />
						))}
					</Route>

					<Route element={user ? <Navigate to="/dashboard" /> :  <WebsiteLayout  />}>
						{AuthRoutes.map((route, index) => (
							<Route key={index} path={route.path} element={route.component} />
						))}
					</Route>

					<Route element={user ? <DashboardLayout /> : <Navigate to={"/"}  />}>
						{CustomerRoutes.map((route, index) => (
							<Route key={index} path={route.path} element={route.component} />
						))}
					</Route>

					<Route
						element={
							
								<DashboardLayout />
							
						}
					>
						{AdminRoutes.map((route, index) => (
							<Route key={index} path={route.path} element={route.component} />
						))}
					</Route>
				</Routes>

				{/* ========== Scroll To Top ========== */}
				<ScrollToTop />

			</ThemeProvider>
		</HistoryRouter>
	);
}

export default App;
