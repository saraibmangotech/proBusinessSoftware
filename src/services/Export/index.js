import { post, get, patch, deleted, Statementget } from "services";
import routes from "./routes";

const ExportServices = {
  getExportCustomers: async (params) => {
    const data = await get(routes.getExportCustomers, params);
    return data;
  },
  getExportRates: async (params) => {
    const data = await get(routes.getExportRates, params);
    return data;
  },
  getExportDropdowns: async (params) => {
    const data = await get(routes.getExportDropdowns, params);
    return data;
  },
  getExportContainerPaymentDetails: async (params) => {
    const data = await get(routes.getExportContainerPaymentDetails, params);
    return data;
  },
  getExportContainerDetails: async (params) => {
    const data = await get(routes.getExportContainerDetails, params);
    return data;
  },
  getExportContainerPreview: async (params) => {
    const data = await get(routes.getExportContainerPreview, params);
    return data;
  },
  getExportContainerPaymentPreview: async (params) => {
    const data = await get(routes.getExportContainerPaymentPreview, params);
    return data;
  },
  getExportContainerPayments: async (params) => {
    const data = await get(routes.getExportContainerPayments, params);
    return data;
  },
  getExportCountries: async (params) => {
    const data = await get(routes.getExportCountries, params);
    return data;
  },
  getBorderCostingDetail: async (params) => {
    const data = await get(routes.getBorderCostingDetail, params);
    return data;
  },
  getBorderVins: async (params) => {
    const data = await get(routes.getBorderVins, params);
    return data;
  },
  getBorderCostingApproval: async (params) => {
    const data = await get(routes.getBorderCostingApproval, params);
    return data;
  },
  getExportPaymentDetails: async (params) => {
    const data = await get(routes.getExportPaymentDetails, params);
    return data;
  },
  getExportPaymentPreview: async (params) => {
    const data = await get(routes.getExportPaymentPreview, params);
    return data;
  },
  getContainerList: async (params) => {
    const data = await get(routes.getContainerList, params);
    return data;
  },
  getCountryDropdown: async (params) => {
    const data = await get(routes.getCountryDropdown, params);
    return data;
  },
  getBorderCostingVehicles: async (params) => {
    const data = await get(routes.getBorderCostingVehicles, params);
    return data;
  },
  getVehiclePayments: async (params) => {
    const data = await get(routes.getVehiclePayments, params);
    return data;
  },
  getExportContainersDetails: async (params) => {
    const data = await get(routes.getExportContainersDetails, params);
    return data;
  },
  getExportCustomersList: async (params) => {
    const data = await get(routes.getExportCustomersList, params);
    return data;
  },
  getVendorPayments: async (params) => {
    const data = await get(routes.getVendorPayments, params);
    return data;
  },
  getBrokerAgent: async (params) => {
    const data = await get(routes.getExportCustomers, params);
    return data;
  },
  getVehiclesChecklist: async () => {
    const data = await get(routes.getVehiclesChecklist);
    return data;
  },
  getFinalDestination: async (params) => {
    const data = await get(routes.getFinalDestination, params);
    return data;
  },
  getOffloadDestination: async (params) => {
    const data = await get(routes.getOffloadDestination, params);
    return data;
  },
  getStatus: async () => {
    const data = await get(routes.getStatus);
    return data;
  },
  getVehicleStatus: async () => {
    const data = await get(routes.getVehicleStatus);
    return data;
  },
  getMake: async (params) => {
    const data = await get(routes.getMake, params);
    return data;
  },
  getModel: async (params) => {
    const data = await get(routes.getModel, params);
    return data;
  },
  getColors: async () => {
    const data = await get(routes.getColors);
    return data;
  },
  CreateExport: async (obj) => {
    const data = await post(routes.CreateExport, obj);
    return data;
  },
  getExportVehicles: async (params) => {
    const data = await get(routes.getExportVehicles, params);
    return data;
  },
  getExportVehiclesStatement: async (params) => {
    const data = await Statementget(routes.getExportVehicles, params);
    return data;
  },
  getManifest: async (params) => {
    const data = await get(routes.getManifest, params);
    return data;
  },
  getVehicleExportDetails: async (params) => {
    const data = await get(routes.getVehicleExportDetails, params);
    return data;
  },
  getVehicleExportPreview: async (params) => {
    const data = await get(routes.getVehicleExportPreview, params);
    return data;
  },

  AddContainer: async (obj) => {
    const data = await post(routes.AddContainer, obj);
    return data;
  },
  CreateExportCountry: async (obj) => {
    const data = await post(routes.CreateExportCountry, obj);
    return data;
  },
  CustomerHandover: async (obj) => {
    const data = await post(routes.CustomerHandover, obj);
    return data;
  },
  updateBorderCosting: async (obj) => {
    const data = await post(routes.updateBorderCosting, obj);
    return data;
  },
  uploadExportRate: async (obj) => {
    const data = await post(routes.uploadExportRate, obj);
    return data;
  },
  AddRates: async (obj) => {
    const data = await post(routes.AddRates, obj);
    return data;
  },
  UpdateContainer: async (obj) => {
    const data = await patch(routes.UpdateContainer, obj);
    return data;
  },
  EditContainer: async (obj) => {
    const data = await patch(routes.EditContainer, obj);
    return data;
  },
  editBorderCosting: async (obj) => {
    const data = await patch(routes.editBorderCosting, obj);
    return data;
  },
  BorderCostingApproval: async (obj) => {
    const data = await patch(routes.BorderCostingApproval, obj);
    return data;
  },
  UpdateManifest: async (obj) => {
    const data = await patch(routes.UpdateManifest, obj);
    return data;
  },
  updateExportRates: async (obj) => {
    const data = await patch(routes.updateExportRates, obj);
    return data;
  },
  VehicleBrokerUpdate: async (obj) => {
    const data = await patch(routes.VehicleBrokerUpdate, obj);
    return data;
  },
  UpdateContainerCosting: async (obj) => {
    const data = await patch(routes.UpdateContainerCosting, obj);
    return data;
  },
  CreateDamage: async (obj) => {
    const data = await patch(routes.CreateDamage, obj);
    return data;
  },
  createExportTT: async (obj) => {
    const data = await post(routes.createExportTT, obj);
    return data;
  },
  addContainerPayment: async (obj) => {
    const data = await post(routes.addContainerPayment, obj);
    return data;
  },
  addVehiclePayment: async (obj) => {
    const data = await post(routes.addVehiclePayment, obj);
    return data;
  },
  handlePay: async (obj) => {
    const data = await patch(routes.handlePay, obj);
    return data;
  },
  VehicleStatusUpdate: async (obj) => {
    const data = await patch(routes.VehicleStatusUpdate, obj);
    return data;
  },
  getExportContainers: async (params) => {
    const data = await get(routes.getExportContainers, params);
    return data;
  },
  getShipmentDetails: async (params) => {
    const data = await get(routes.getShipmentDetails, params);
    return data;
  },
  getVendorDropdown: async (params) => {
    const data = await get(routes.getVendorDropdown, params);
    return data;
  },
  getPaymentAccounts: async (params) => {
    const data = await get(routes.getPaymentAccounts, params);
    return data;
  },
  getTT: async (params) => {
    const data = await get(routes.getTT, params);
    return data;
  },
  getTTDetail: async (params) => {
    const data = await get(routes.getTTDetail, params);
    return data;
  },
  getTTPreview: async (params) => {
    const data = await get(routes.getTTPreview, params);
    return data;
  },
  applyFund: async (obj) => {
    const data = await post(routes.applyFund, obj);
    return data;
  },
  getVendorAppliedFunds: async (params) => {
    const data = await get(routes.getVendorAppliedFunds, params);
    return data;
  },
  getVendorCenter: async (params) => {
    const data = await get(routes.getVendorCenter, params);
    return data;
  },
  getAllDoc: async (reference,referenceId) => {
    const data = await get(routes.getAllDoc+ `?reference=${reference}&reference_id=${referenceId}`);
    return data;
  },
};

export default ExportServices;
