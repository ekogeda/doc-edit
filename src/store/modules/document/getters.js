export const documents = (state) => {
	return state.documents;
};

export const documentAuditTrail = (state) => {
	return state.documentAuditTrail;
};

export const statistics = (state) => {
	return state.statistics;
};

export const documentsByStatus = (state) => {
	return state.documentsByStatus;
};

export const receivedDocuments = (state) => {
	return state.receivedDocuments;
};

export const declinedDocuments = (state) => {
	return state.declinedDocuments;
};

export const completedDocuments = (state) => {
	return state.completedDocuments;
};

export const userDocument = (state) => {
	return state.document;
};

export const initializedDocumentId = (state) => {
	return state.initializedDocumentId;
};

export const parentChildDocId = (state) => {
	return state.parentChildDocId;
};

export const lockerDocs = (state) => {
	return state.lockerDocs;
};

export const lockerDoc = (state) => {
	return state.lockerDoc;
};

export const canCancel = (state) => {
	return state.cancel;
};

export const doneDocument = (state) => {
	return state.doneEditing;
};

export const sharedDocument = (state) => {
	return state.sharedDoc;
};

export const userFeedback = (state) => {
	return state.feedback;
};

export const toolData = (state) => {
	return state.toolData;
};

export const workingTools = (state) => {
	return state.resourceTools;
};

export const isOpenModal = (state) => {
	return state.isOpenModal;
};

export const guest = (state) => {
	return state.guest;
};

export const confirmGuest = (state) => {
	return state.confirmGuest;
};

export const isDoneLoading = (state) => {
	return state.isDoneLoading;
};

export const isDeclineLoading = (state) => {
	return state.isDeclineLoading;
};

export const isDownloading = (state) => {
	return state.isDownloading;
};

export const getStatus = (state) => {
	return state.status;
};

export const isLoading = (state) => {
	return state.isLoading;
};

export const isDocLoading = (state) => {
	return state.isDocLoading;
};

export const isAllToolLoading = (state) => {
	return state.isAllToolLoading;
};

export const isToolLoading = (state) => {
	return state.isToolLoading;
};

export const croppedWH = (state) => {
	return state.croppedWidthHeight;
};

export const participantErrorModal = (state) => {
	return state.participantError;
};

