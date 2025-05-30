import { post, get, patch,deleted, Statementget } from 'services';
import routes from './routes';

const FinanceServices = {
  getUnits: async () => {
    const data = await get(routes.getUnits);
    return data;
  },
  getMajorCategories: async () => {
    const data = await get(routes.getMajorCategories);
    return data;
  },
  getCustomerPaymentDetail: async (params) => {
    const data = await get(routes.getCustomerPaymentDetail,params);
    return data;
  },
  getConsolidatedProStatement: async (params) => {
    const data = await get(routes.getConsolidatedProStatement,params);
    return data;
  },
  getAccountReportsDetail: async (params) => {
    const data = await get(routes.getAccountReportsDetail,params);
    return data;
  },
  getVendorPaymentDetail: async (params) => {
    const data = await get(routes.getVendorPaymentDetail,params);
    return data;
  },
  getReceipts: async (params) => {
    const data = await get(routes.getReceipts,params);
    return data;
  },
  getCustomerPaymentList: async (params) => {
    const data = await get(routes.getCustomerPaymentList,params);
    return data;
  },
  getVendorPaymentList: async (params) => {
    const data = await get(routes.getVendorPaymentList,params);
    return data;
  },
  getTax: async (params) => {
    const data = await get(routes.getTax,params);
    return data;
  },
  getCustomerProfitLoss: async (params) => {
    const data = await get(routes.getCustomerProfitLoss,params);
    return data;
  },
  getShippingAging: async (params) => {
    const data = await get(routes.getShippingAging,params);
    return data;
  },
  getVoucherPreview: async (params) => {
    const data = await get(routes.getVoucherPreview,params);
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
  getNewAccountLedgers: async (params) => {
    const data = await get(routes.getNewAccountLedgers, params);
    return data;
  },
  deleteVoucher: async (params) => {
    const data = await deleted(routes.deleteVoucher, params);
    return data;
  },
  deleteReceipt: async (params) => {
    const data = await deleted(routes.deleteReceipt, params);
    return data;
  },
  deleteIFTV: async (params) => {
    const data = await deleted(routes.deleteIFTV, params);
    return data;
  },
  deleteJournalVoucher: async (params) => {
    const data = await deleted(routes.deleteJournalVoucher, params);
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
  createAccount: async (obj) => {
    const data = await post(routes.createAccount, obj);
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
  UpdateFundTransferVoucher: async (obj) => {
    const data = await patch(routes.UpdateFundTransferVoucher, obj);
    return data;
  },
  updateEmployee: async (obj) => {
    const data = await patch(routes.updateEmployee, obj);
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
  CreateVoucher: async (obj) => {
    const data = await post(routes.CreateVoucher, obj);
    return data;
  },
  getChartOfAccount: async (params) => {
    const data = await get(routes.getChartOfAccount, params);
    return data;
  },
  getChartOfAccountSubAccount: async (params) => {
    const data = await get(routes.getChartOfAccountSubAccount, params);
    return data;
  },
  getAccountLedgers: async (params) => {
    const data = await get(routes.getAccountLedgers, params);
    return data;
  },
  getAccountLedgersStatement: async (params) => {
    const data = await Statementget(routes.getAccountLedgers, params);
    return data;
  },
  getExportAccountLedgers: async (params) => {
    const data = await get(routes.getExportAccountLedgers, params);
    return data;
  },
  getExportAccountLedgersStatement: async (params) => {
    const data = await Statementget(routes.getExportAccountLedgers, params);
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
  AccountBlance: async (params) => {
    const data = await get(routes.AccountBlance, params);
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
  UpdateJournalVoucher: async (obj) => {
    const data = await patch(routes.UpdateJournalVoucher, obj);
    return data;
  },
  UpdatePaymentVoucher: async (obj) => {
    const data = await patch(routes.UpdatePaymentVoucher, obj);
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
    const data = await get(routes.ExportJournalVoucherPreview, params);
    return data;
  },
  createFundTransferVoucher: async (obj) => {
    const data = await post(routes.createFundTransferVoucher, obj);
    return data;
  },
  updateVaultTopUp: async (obj) => {
    const data = await patch(routes.updateVaultTopUp, obj);
    return data;
  },
  getFundTransferVouchers: async (params) => {
    const data = await get(routes.getFundTransferVouchers, params);
    return data;
  },
  getFundTransferVoucherPreview: async (params) => {
    const data = await get(routes.getFundTransferVoucherPreview, params);
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
  getVehicleSumLedger: async (params) => {
    const data = await get(routes.getVehicleSumLedger, params);
    return data;
  },
  getVehicleSumLedgerStatement: async (params) => {
    const data = await Statementget(routes.getVehicleSumLedger, params);
    return data;
  },
}

export default FinanceServices