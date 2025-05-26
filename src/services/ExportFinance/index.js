import { post, get, patch } from 'services';
import routes from './routes';

const ExportFinanceServices = {
  getUnits: async () => {
    const data = await get(routes.getUnits);
    return data;
  },
  getMajorCategories: async () => {
    const data = await get(routes.getMajorCategories);
    return data;
  },
  getReceipts: async (params) => {
    const data = await get(routes.getReceipts,params);
    return data;
  },
  getContainerPayments: async (params) => {
    const data = await get(routes.getContainerPayments,params);
    return data;
  },
  getCostProfit: async (params) => {
    const data = await get(routes.getCostProfit,params);
    return data;
  },
  getExportCosting: async (params) => {
    const data = await get(routes.getExportCosting,params);
    return data;
  },
  getShippingAging: async (params) => {
    const data = await get(routes.getShippingAging,params);
    return data;
  },
  getReceiptDetail: async (params) => {
    const data = await get(routes.getReceiptDetail, params);
    return data;
  },
  getReceiptPreview: async (params) => {
    const data = await get(routes.getReceiptPreview, params);
    return data;
  },
  getShippingProfit: async (params) => {
    const data = await get(routes.getShippingProfit, params);
    return data;
  },
  getSubCategories: async (params) => {
    const data = await get(routes.getSubCategories, params);
    return data;
  },
  getShippingReceiving: async (params) => {
    const data = await get(routes.getShippingReceiving, params);
    return data;
  },
  getVouchers: async (params) => {
    const data = await get(routes.getVouchers, params);
    return data;
  },
  getVoucherDetails: async (params) => {
    const data = await get(routes.getVoucherDetails, params);
    return data;
  },
  getVoucherPreview: async (params) => {
    const data = await get(routes.getVoucherPreview, params);
    return data;
  },
  getAccountCode: async (params) => {
    const data = await get(routes.getAccountCode, params);
    return data;
  },
  getAccountBySubCategory: async (params) => {
    const data = await get(routes.getAccountBySubCategory, params);
    return data;
  },
  getAccounts: async (params) => {
    const data = await get(routes.getAccounts, params);
    return data;
  },
  getAccountsDropDown: async (params) => {
    const data = await get(routes.getAccountsDropDown, params);
    return data;
  },
  getUnpaidInvoices: async (params) => {
    const data = await get(routes.getUnpaidInvoices, params);
    return data;
  },
  createAccount: async (obj) => {
    const data = await post(routes.createAccount, obj);
    return data;
  },
  createBank: async (obj) => {
    const data = await post(routes.createBank, obj);
    return data;
  },
  ReceiptVoucher: async (obj) => {
    const data = await post(routes.ReceiptVoucher, obj);
    return data;
  },
  updateAccount: async (obj) => {
    const data = await patch(routes.updateAccount, obj);
    return data;
  },
  getAccountsApprovals: async (params) => {
    const data = await get(routes.getAccountsApprovals, params);
    return data;
  },
  approveAccount: async (obj) => {
    const data = await post(routes.approveAccount, obj);
    return data;
  },
  PaymentVoucher: async (obj) => {
    const data = await post(routes.PaymentVoucher, obj);
    return data;
  },
  getChartOfAccount: async (params) => {
    const data = await get(routes.getChartOfAccount, params);
    return data;
  },
  getBanks: async (params) => {
    const data = await get(routes.getBanks, params);
    return data;
  },
  getChartOfAccountSubAccount: async (params) => {
    const data = await get(routes.getChartOfAccountSubAccount, params);
    return data;
  },
  updateBank: async (obj) => {
    const data = await patch(routes.updateBank, obj);
    return data;
  },
  updateCosting: async (obj) => {
    const data = await patch(routes.updateCosting, obj);
    return data;
  },
  getAccountLedgers: async (params) => {
    const data = await get(routes.getAccountLedgers, params);
    return data;
  },
  getGeneralJournalLedgers: async (params) => {
    const data = await get(routes.getGeneralJournalLedgers, params);
    return data;
  },
  getVaultCustomers: async (params) => {
    const data = await get(routes.getVaultCustomers, params);
    return data;
  },
  getPaymentAccounts: async (params) => {
    const data = await get(routes.getPaymentAccounts, params);
    return data;
  },
  getVaultTopUps: async (params) => {
    const data = await get(routes.getVaultTopUps, params);
    return data;
  },
  createVaultTopUp: async (obj) => {
    const data = await post(routes.createVaultTopUp, obj);
    return data;
  },
  getVaultTopUpDetail: async (params) => {
    const data = await get(routes.getVaultTopUpDetail, params);
    return data;
  },
  getVaultTopUpPreview: async (params) => {
    const data = await get(routes.getVaultTopUpPreview, params);
    return data;
  },
  getAccountReports: async (params) => {
    const data = await get(routes.getAccountReports, params);
    return data;
  },
  getCashierActivity: async (params) => {
    const data = await get(routes.getCashierActivity, params);
    return data;
  },
  createJournalVoucher: async (obj) => {
    const data = await post(routes.createJournalVoucher, obj);
    return data;
  },
  getJournalVouchers: async (params) => {
    const data = await get(routes.getJournalVouchers, params);
    return data;
  },
  getJournalVoucherDetail: async (params) => {
    const data = await get(routes.getJournalVoucherDetail, params);
    return data;
  },
  getJournalVoucherPreview: async (params) => {
    const data = await get(routes.getJournalVoucherPreview, params);
    return data;
  },
  createFundTransferVoucher: async (obj) => {
    const data = await post(routes.createFundTransferVoucher, obj);
    return data;
  },
  UpdateFundTransferVoucher: async (obj) => {
    const data = await post(routes.UpdateFundTransferVoucher, obj);
    return data;
  },
  getFundTransferVouchers: async (params) => {
    const data = await get(routes.getFundTransferVouchers, params);
    return data;
  },
  getFundTransferApproval: async (params) => {
    const data = await get(routes.getFundTransferApproval, params);
    return data;
  },
  FundTransferApprove: async (obj) => {
    const data = await post(routes.FundTransferApprove, obj);
    return data;
  },
  getFundTransferVoucherDetail: async (params) => {
    const data = await get(routes.getFundTransferVoucherDetail, params);
    return data;
  },
  getFundTransferVoucherPreview: async (params) => {
    const data = await get(routes.getFundTransferVoucherPreview, params);
    return data;
  },
  getVehicleSumLedger: async (params) => {
    const data = await get(routes.getVehicleSumLedger, params);
    return data;
  },
  getShippingAging: async (params) => {
    const data = await get(routes.getShippingAging, params);
    return data;
  },
}

export default ExportFinanceServices