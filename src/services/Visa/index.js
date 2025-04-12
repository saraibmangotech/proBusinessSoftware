import { post, get, patch,deleted } from 'services';
import routes from './routes';

const VisaServices = {

  AddVisa: async (obj) => {
    const data = await post(routes.AddVisa, obj);
    return data;
  },
  DepositReversal: async (obj) => {
    const data = await post(routes.DepositReversal, obj);
    return data;
  },
    UpdateVisa: async (obj) => {
    const data = await patch(routes.UpdateVisa, obj);
    return data;
  },
  UpdateDate: async (obj) => {
    const data = await patch(routes.UpdateDate, obj);
    return data;
  },
  UpdateApprovalStatus: async (obj) => {
    const data = await patch(routes.UpdateApprovalStatus, obj);
    return data;
  },
  UpdateStatusDocument: async (obj) => {
    const data = await patch(routes.UpdateStatusDocument, obj);
    return data;
  },
  visaProcessingAdd: async (obj) => {
    const data = await post(routes.visaProcessingAdd, obj);
    return data;
  },
  CandidateUpdateStatus: async (obj) => {
    const data = await patch(routes.CandidateUpdateStatus, obj);
    return data;
  },
  DeleteStatus: async (obj) => {
    const data = await patch(routes.DeleteStatus, obj);
    return data;
  },
  UpdateProof: async (obj) => {
    const data = await patch(routes.UpdateProof, obj);
    return data;
  },
  UpdateVisaProcessingStatus: async (obj) => {
    const data = await post(routes.UpdateVisaProcessingStatus, obj);
    return data;
  },
  updateProcessingPaymentStatus: async (obj) => {
    const data = await post(routes.updateProcessingPaymentStatus, obj);
    return data;
  },
  UpdateRequestStatus: async (obj) => {
    const data = await patch(routes.UpdateRequestStatus, obj);
    return data;
  },
  PublishDraft: async (obj) => {
    const data = await post(routes.PublishDraft, obj);
    return data;
  },
  UploadCandidateDocs: async (obj) => {
    const data = await post(routes.UploadCandidateDocs, obj);
    return data;
  },
  updatePaymentStatus: async (obj) => {
    const data = await post(routes.updatePaymentStatus, obj);
    return data;
  },
  updateStatus: async (obj) => {
    const data = await patch(routes.updateStatus, obj);
    return data;
  },
  CustomerCandidateUpdate: async (obj) => {
    const data = await patch(routes.CustomerCandidateUpdate, obj);
    return data;
  },
  getVisaRequestList: async (params) => {
    const data = await get(routes.getVisaRequestList, params);
    return data;
  },
  getVisaDetail: async (params) => {
    const data = await get(routes.getVisaDetail, params);
    return data;
  },
getListDetails: async (params) => {
    const data = await get(routes.getListDetails, params);
    return data;
  },

}

export default VisaServices