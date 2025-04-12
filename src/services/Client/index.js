import { post, get, patch, deleted, Statementget } from "services";
import routes from "./routes";

const ClientServices = {
	getClientDropdown: async (params) => {
		const data = await get(routes.getClientDropdown, params);
		return data;
	},
	getVehicleForTT: async (params) => {
		const data = await get(routes.getVehicleForTT, params);
		return data;
	},
	getClientCosting: async (params) => {
		const data = await get(routes.getClientCosting, params);
		return data;
	},
	getClientCostingStatement: async (params) => {
		const data = await Statementget(routes.getClientCosting, params);
		return data;
	},
	getClientInvoice: async (params) => {
		const data = await get(routes.getClientInvoice, params);
		return data;
	},
	getVehicleTTPreview: async (params) => {
		const data = await get(routes.getVehicleTTPreview, params);
		return data;
	},
	getClientInvoicePreview: async (params) => {
		const data = await get(routes.getClientInvoicePreview, params);
		return data;
	},
	updateClientCosting: async (obj) => {
		const data = await patch(routes.updateClientCosting, obj);
		return data;
	},
	approveTTStatus: async (obj) => {
		const data = await patch(routes.approveTTStatus, obj);
		return data;
	},
	getClientVin: async (params) => {
		const data = await get(routes.getClientVin, params);
		return data;
	},
	getStorageDetails: async (params) => {
		const data = await get(routes.getStorageDetails, params);
		return data;
	},
	updateStorage: async (obj) => {
		const data = await patch(routes.updateStorage, obj);
		return data;
	},
	getTTVin: async (params) => {
		const data = await get(routes.getTTVin, params);
		return data;
	},
	getVehicleTT: async (params) => {
		const data = await get(routes.getVehicleTT, params);
		return data;
	},
	getBuyerId: async (params) => {
		const data = await get(routes.getBuyerId, params);
		return data;
	},
	getApprovalList: async (params) => {
		const data = await get(routes.getApprovalList, params);
		return data;
	},
	AddTT: async (obj) => {
		const data = await post(routes.AddTT, obj);
		return data;
	},
	uploadClientRate: async (obj) => {
		const data = await post(routes.uploadClientRate, obj);
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
	getClientRates: async (params) => {
		const data = await get(routes.getClientRates, params);
		return data;
	},
	getAppliedFunds: async (params) => {
		const data = await get(routes.getAppliedFunds, params);
		return data;
	},
	updateRates: async (obj) => {
		const data = await patch(routes.updateRates, obj);
		return data;
	},
	updateFundsApply: async (obj) => {
		const data = await post(routes.updateFundsApply, obj);
		return data;
	},
	getShippingInvoice: async (params) => {
		const data = await get(routes.getShippingInvoice, params);
		return data;
	},
	getShippingInvoicePreview: async (params) => {
		const data = await get(routes.getShippingInvoicePreview, params);
		return data;
	},
	sendApproval: async (obj) => {
		const data = await post(routes.sendApproval, obj);
		return data;
	},
	deleteTT: async (params) => {
		const data = await deleted(routes.deleteTT, params);
		return data;
	},
	deleteVoucher: async (params) => {
		const data = await deleted(routes.deleteVoucher, params);
		return data;
	},
};

export default ClientServices;
