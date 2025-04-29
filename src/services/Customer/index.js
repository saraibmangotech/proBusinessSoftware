import { post, get, patch,deleted } from 'services';
import routes from './routes';

const CustomerServices = {
  requestBuyerId: async (obj) => {
    const data = await post(routes.requestBuyerId, obj);
    return data;
  },
  CreateVendor: async (obj) => {
    const data = await post(routes.CreateVendor, obj);
    return data;
  },
  CreateProduct: async (obj) => {
    const data = await post(routes.CreateProduct, obj);
    return data;
  },
  CreatePurchaseInvoice: async (obj) => {
    const data = await post(routes.CreatePurchaseInvoice, obj);
    return data;
  },
  CreateNote: async (obj) => {
    const data = await post(routes.CreateNote, obj);
    return data;
  },
  CreateProductCategory: async (obj) => {
    const data = await post(routes.CreateProductCategory, obj);
    return data;
  },
  CreateBank: async (obj) => {
    const data = await post(routes.CreateBank, obj);
    return data;
  },
  CreditReceipt: async (obj) => {
    const data = await post(routes.CreditReceipt, obj);
    return data;
  },
  CreateAlDed: async (obj) => {
    const data = await post(routes.CreateAlDed, obj);
    return data;
  },
  CreateSaleReceipt: async (obj) => {
    const data = await post(routes.CreateSaleReceipt, obj);
    return data;
  },
  CreateCard: async (obj) => {
    const data = await post(routes.CreateCard, obj);
    return data;
  },
  DeleteVoucher: async (obj) => {
    const data = await deleted(routes.DeleteVoucher, obj);
    return data;
  },
  DeleteJournalVoucher: async (obj) => {
    const data = await deleted(routes.DeleteJournalVoucher, obj);
    return data;
  },
  DeletePreSale: async (obj) => {
    const data = await deleted(routes.DeletePreSale, obj);
    return data;
  },
  deleteVendor: async (obj) => {
    const data = await deleted(routes.deleteVendor, obj);
    return data;
  },
  DeleteProduct: async (obj) => {
    const data = await deleted(routes.DeleteProduct, obj);
    return data;
  },
  DeleteProductCategory: async (obj) => {
    const data = await deleted(routes.DeleteProductCategory, obj);
    return data;
  },
  DeleteBank: async (obj) => {
    const data = await deleted(routes.DeleteBank, obj);
    return data;
  },
  deleteNotes: async (obj) => {
    const data = await deleted(routes.deleteNotes, obj);
    return data;
  },
  CreateWPS: async (obj) => {
    const data = await post(routes.CreateWPS, obj);
    return data;
  },
  CreateReception: async (obj) => {
    const data = await post(routes.CreateReception, obj);
    return data;
  },
  addCompany: async (obj) => {
    const data = await post(routes.addCompany, obj);
    return data;
  },
  CreateAddOnService: async (obj) => {
    const data = await post(routes.CreateAddOnService, obj);
    return data;
  },
  CreateCertificate: async (obj) => {
    const data = await post(routes.CreateCertificate, obj);
    return data;
  },
  CreateCategory: async (obj) => {
    const data = await post(routes.CreateCategory, obj);
    return data;
  },
  UpdateWPStatus: async (obj) => {
    const data = await patch(routes.UpdateWPStatus, obj);
    return data;
  },
  UpdateVendor: async (obj) => {
    const data = await patch(routes.UpdateVendor, obj);
    return data;
  },
  UpdateCard: async (obj) => {
    const data = await patch(routes.UpdateCard, obj);
    return data;
  },
  UpdateReceipt: async (obj) => {
    const data = await patch(routes.UpdateReceipt, obj);
    return data;
  },
  UpdateCategory: async (obj) => {
    const data = await patch(routes.UpdateCategory, obj);
    return data;
  },
  CustomerStatus: async (obj) => {
    const data = await patch(routes.CustomerStatus, obj);
    return data;
  },
  UpdateBank: async (obj) => {
    const data = await patch(routes.UpdateBank, obj);
    return data;
  },
  UpdateReception: async (obj) => {
    const data = await patch(routes.UpdateReception, obj);
    return data;
  },
  UpdateProductCategory: async (obj) => {
    const data = await patch(routes.UpdateProductCategory, obj);
    return data;
  },
  UpdateProduct: async (obj) => {
    const data = await patch(routes.UpdateProduct, obj);
    return data;
  },
  UpdateSaleReceipt: async (obj) => {
    const data = await patch(routes.UpdateSaleReceipt, obj);
    return data;
  },
  UpdateAddOnService: async (obj) => {
    const data = await patch(routes.UpdateAddOnService, obj);
    return data;
  },
  UpdatePurchaseInvoice: async (obj) => {
    const data = await patch(routes.UpdatePurchaseInvoice, obj);
    return data;
  },
  UpdateCandidate: async (obj) => {
    const data = await patch(routes.UpdateCandidate, obj);
    return data;
  },
  UpdateCertificate: async (obj) => {
    const data = await patch(routes.UpdateCertificate, obj);
    return data;
  },
  CreateMemo: async (obj) => {
    const data = await post(routes.CreateMemo, obj);
    return data;
  },
  AddVisa: async (obj) => {
    const data = await post(routes.AddVisa, obj);
    return data;
  },
  getAgents: async (params) => {
    const data = await get(routes.getAgents, params);
    return data;
  },
  getVouchers: async (params) => {
    const data = await get(routes.getVouchers, params);
    return data;
  },
  getVoucherToken: async (params) => {
    const data = await get(routes.getVoucherToken, params);
    return data;
  },
  getProductCategory: async (params) => {
    const data = await get(routes.getProductCategory, params);
    return data;
  },
  getVendors: async (params) => {
    const data = await get(routes.getVendors, params);
    return data;
  },
  getPurchaseInvoices: async (params) => {
    const data = await get(routes.getPurchaseInvoices, params);
    return data;
  },
  getProducts: async (params) => {
    const data = await get(routes.getProducts, params);
    return data;
  },
  getPurchaseInvoiceDetail: async (params) => {
    const data = await get(routes.getPurchaseInvoiceDetail, params);
    return data;
  },
  getProductCategoryDetail: async (params) => {
    const data = await get(routes.getProductCategoryDetail, params);
    return data;
  },
  getProductDetail: async (params) => {
    const data = await get(routes.getProductDetail, params);
    return data;
  },
  getCreditDebitToken: async (params) => {
    const data = await get(routes.getCreditDebitToken, params);
    return data;
  },
  getSnapshotCategoryReport: async (params) => {
    const data = await get(routes.getSnapshotCategoryReport, params);
    return data;
  },
  getBankDetail: async (params) => {
    const data = await get(routes.getBankDetail, params);
    return data;
  },
  getRejectedVisa: async (params) => {
    const data = await get(routes.getRejectedVisa, params);
    return data;
  },
  getNotes: async (params) => {
    const data = await get(routes.getNotes, params);
    return data;
  },
  getCards: async (params) => {
    const data = await get(routes.getCards, params);
    return data;
  },
  getVendorDetail: async (params) => {
    const data = await get(routes.getVendorDetail, params);
    return data;
  },
  getServiceCategories: async (params) => {
    const data = await get(routes.getServiceCategories, params);
    return data;
  },
  getSnapshotOverviewReport: async (params) => {
    const data = await get(routes.getSnapshotOverviewReport, params);
    return data;
  },
  getReceiptDetail: async (params) => {
    const data = await get(routes.getReceiptDetail, params);
    return data;
  },
  getInvoiceDetail: async (params) => {
    const data = await get(routes.getInvoiceDetail, params);
    return data;
  },
  getReceptionsList: async (params) => {
    const data = await get(routes.getReceptionsList, params);
    return data;
  },
  getCompanies: async (params) => {
    const data = await get(routes.getCompanies, params);
    return data;
  },
  getCandidateDetail: async (params) => {
    const data = await get(routes.getCandidateDetail, params);
    return data;
  },
  getPreSaleDetail: async (params) => {
    const data = await get(routes.getPreSaleDetail, params);
    return data;
  },
  getReceptionDetail: async (params) => {
    const data = await get(routes.getReceptionDetail, params);
    return data;
  },
  getBanks: async (params) => {
    const data = await get(routes.getBanks, params);
    return data;
  },
  VisaProcessing: async (params) => {
    const data = await get(routes.VisaProcessing, params);
    return data;
  },
  getPreSales: async (params) => {
    const data = await get(routes.getPreSales, params);
    return data;
  },
  getInvoices: async (params) => {
    const data = await get(routes.getInvoices, params);
    return data;
  },
  getWPSList: async (params) => {
    const data = await get(routes.getWPSList, params);
    return data;
  },
  getCategoryList: async (params) => {
    const data = await get(routes.getCategoryList, params);
    return data;
  },
  checkWPS: async (params) => {
    const data = await get(routes.checkWPS, params);
    return data;
  },
  getCategoryDetail: async (params) => {
    const data = await get(routes.getCategoryDetail, params);
    return data;
  },
  getCandidateLists: async (params) => {
    const data = await get(routes.getCandidateLists, params);
    return data;
  },
  getCertificates: async (params) => {
    const data = await get(routes.getCertificates, params);
    return data;
  },
  ServiceInvoiceDetail: async (params) => {
    const data = await get(routes.ServiceInvoiceDetail, params);
    return data;
  },
  getInvoices: async (params) => {
    const data = await get(routes.getInvoices, params);
    return data;
  },
  addCustomer: async (obj) => {
    const data = await post(routes.addCustomer, obj);
    return data;
  },
  UpdateCustomer: async (obj) => {
    const data = await patch(routes.UpdateCustomer, obj);
    return data;
  },
  UpdateAddOnservice: async (obj) => {
    const data = await patch(routes.UpdateAddOnservice, obj);
    return data;
  },
  CreateNotifcation: async (obj) => {
    const data = await post(routes.CreateNotifcation, obj);
    return data;
  },
  CreateSubCustomer: async (obj) => {
    const data = await post(routes.CreateSubCustomer, obj);
    return data;
  },
  ChangeBranch: async (obj) => {
    const data = await patch(routes.ChangeBranch, obj);
    return data;
  },
  SelectCustomer: async (obj) => {
    const data = await patch(routes.SelectCustomer, obj);
    return data;
  },
  ChangeType: async (obj) => {
    const data = await patch(routes.ChangeType, obj);
    return data;
  },
  requestBuyerIdAgain: async (obj) => {
    const data = await post(routes.requestBuyerIdAgain, obj);
    return data;
  },
  deleteId: async (params) => {
    const data = await deleted(routes.deleteId, params);
    return data;
  },
  handleDeleteCustomer: async (params) => {
    const data = await deleted(routes.handleDeleteCustomer, params);
    return data;
  },
  deleteReception: async (params) => {
    const data = await deleted(routes.deleteReception, params);
    return data;
  },
  handleDeleteDraft: async (params) => {
    const data = await deleted(routes.handleDeleteDraft, params);
    return data;
  },
  DeleteCustomerPayment: async (params) => {
    const data = await deleted(routes.DeleteCustomerPayment, params);
    return data;
  },
  DeleteCategory: async (params) => {
    const data = await deleted(routes.DeleteCategory, params);
    return data;
  },
  getCustomerDropDown: async (params) => {
    const data = await get(routes.getCustomerDropDown, params);
    return data;
  },
  getSubCustomerList: async (params) => {
    const data = await get(routes.getSubCustomerList, params);
    return data;
  },
  getGalaxyCustomerList: async (params) => {
    const data = await get(routes.getGalaxyCustomerList, params);
    return data;
  },
  getCustomerQueue: async (params) => {
    const data = await get(routes.getCustomerQueue, params);
    return data;
  },
  getCustomerDetail: async (params) => {
    const data = await get(routes.getCustomerDetail, params);
    return data;
  },
  getBuyerIdDetail: async (params) => {
    const data = await get(routes.getBuyerIdDetail, params);
    return data;
  },
  getBuyerIdByAuctionId: async (params) => {
    const data = await get(routes.getBuyerIdByAuctionId, params);
    return data;
  },
  verifyFinance: async (obj) => {
    const data = await post(routes.verifyFinance, obj);
    return data;
  },
  allocateBuyerId: async (obj) => {
    const data = await post(routes.allocateBuyerId, obj);
    return data;
  },
  deallocateBuyerId: async (obj) => {
    const data = await post(routes.deallocateBuyerId, obj);
    return data;
  },
  changeAllocationStatus: async (obj) => {
    const data = await patch(routes.changeAllocationStatus, obj);
    return data;
  },
  getMessages: async (params) => {
    const data = await get(routes.getMessages, params);
    return data;
  },
  sendMessage: async (obj) => {
    const data = await post(routes.sendMessage, obj);
    return data;
  },
  getCustomerBooking: async (params) => {
    const data = await get(routes.getCustomerBooking, params);
    return data;
  },
  getCustomerBuyerId: async (params) => {
    const data = await get(routes.getCustomerBuyerId, params);
    return data;
  },
  AddServiceItem: async (obj) => {
    const data = await post(routes.AddServiceItem, obj);
    return data;
  },
  getServiceItem: async (params) => {
    const data = await get(routes.getServiceItem, params);
    return data;
  },
  DetailServiceItem: async (params) => {
    const data = await get(routes.DetailServiceItem, params);
    return data;
  },
  UpdateServiceItem: async (obj) => {
    const data = await patch(routes.UpdateServiceItem, obj);
    return data;
  },
  DeleteServiceItem: async (params) => {
    const data = await deleted(routes.DeleteServiceItem, params);
    return data;
  },
  getInvoiceNumber: async (params) => {
    const data = await get(routes.getInvoiceNumber, params);
    return data;
  },
  PayReceipt: async (obj) => {
    const data = await post(routes.PayReceipt, obj);
    return data;
  },

  customerPayment: async (obj) => {
    const data = await post(routes.CreateCustomerPayment, obj);
    return data;
  },

  getServiceReport: async (params) => {
    const data = await get(routes.getServiceReport, params);
    return data;
  },
  getCollectionReport: async (params) => {
    const data = await get(routes.getCollectionReport, params);
    return data;
  },
  getSystemSettings: async (params) => {
    const data = await get(routes.getSystemSettings, params);
    return data;
  },
}

export default CustomerServices