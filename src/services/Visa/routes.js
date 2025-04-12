const routes = {
	getVisaRequestList: "/visas",
	AddVisa:'/visas/addRequest',
	updateStatus:'/visas/updateStatus',
	updatePaymentStatus:'/visas/addPayment',
	getVisaDetail:'/visas/details',
	UploadCandidateDocs:'/visas/candidates/upload',
	PublishDraft:'/visas/publishDraft',
	CandidateUpdateStatus:'/visas/candidates/updateStatus',
	visaProcessingAdd:'/visas/processing/add',
	UpdateRequestStatus:'/visas/processing/update',
	updateProcessingPaymentStatus:'/visas/processing/addPayment',
	UpdateVisaProcessingStatus:'/visas/processing/updateStatus',
	UpdateProof:'/visas/update',
	getListDetails:'/visas/processing/details',
	DeleteStatus:'/visas/candidates/deleteStatus',
	CustomerCandidateUpdate:"customers/candidates/update",
	UpdateVisa:'/visas/updateRequest',
	UpdateDate:'customers/candidates/update',
	UpdateStatusDocument:"/visas/candidates/updateStatusDocument",
	DepositReversal:'/customers/candidates/reverseDeposit',
	UpdateApprovalStatus:'visas/admin/approve'

	
};

export default routes;
