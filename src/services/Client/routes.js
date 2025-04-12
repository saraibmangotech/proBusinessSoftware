const routes = {
	getClientDropdown: "clients/dropdown",
	getClientCosting: "clients/costings",
	updateClientCosting: "clients/costings/update",
	getClientVin: "shippings/filters",
	getStorageDetails: "clients/storage/details",
	updateStorage: "clients/storage/update",
	getTTVin: "clients/vehicleTT/vehicles",
	getVehicleTT: "vehicleBookings/vinDetails",
	getBuyerId: "buyerIds",
	AddTT: "clients/vehicleTT/add",
	getTT: "clients/vehicleTT",
	getTTDetail: "clients/vehicleTT/details",
	getClientRates: "clients/importRates",
	updateRates: "clients/importRates/update",
	updateFundsApply: "clients/funds/apply",
	getAppliedFunds: "clients/funds",
	getVehicleTTPreview:'clients/vehicleTT/preview',
	getClientInvoice:'clients/invoice/details',
	getClientInvoicePreview:"clients/invoice/preview",
	uploadClientRate:'/clients/importRates/upload',
	getShippingInvoice:'clients/funds/details',
	sendApproval:'clients//vehicleTT/approvals/send',
	getApprovalList:'clients/vehicleTT/approvals',
	approveTTStatus:'clients/vehicleTT/approvals/update',
	getVehicleForTT:'vehicleBookings/tt/availableVehicles',
	deleteTT:'clients/vehicleTT/delete',
	getShippingInvoicePreview:'clients/funds/preview'
	
};

export default routes;
