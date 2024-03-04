export const SET_DOCUMENTS = (state, docs) => {
	state.documents = docs;
};

export const SET_AUDIT_TRAIL = (state, trail) => {
	state.documentAuditTrail = trail;
};

export const SET_DOCUMENT_STATISTICS = (state, docStats) => {
	state.statistics = docStats;
};

export const SET_DOCUMENTS_BY_STATUS = (state, docs) => {
	state.documentsByStatus = docs;
};

export const SET_RECEIVED_DOCUMENTS = (state, docs) => {
	state.receivedDocuments = docs;
};

export const SET_DECLINED_DOCUMENTS = (state, docs) => {
	state.declinedDocuments = docs;
};

export const SET_COMPLETED_DOCUMENTS = (state, docs) => {
	state.completedDocuments = docs;
};

export const SET_LOCKER_DOCS = (state, locker) => {
	state.lockerDocs = locker;
};

export const SET_LOCKER_DOC = (state, locker) => {
	state.lockerDoc = locker;
};

export const SET_DOCUMENT = (state, doc) => {
	state.document = doc;
};

export const SET_DOCUMENT_PARENT_CHILD_ID = (state, parentId) => {
	state.parentChildDocId = parentId;
};

export const SET_INITIALIZED_DOCUMENT_ID = (state, doc) => {
	state.initializedDocumentId = doc;
};

export const SET_CANCEL = (state, cancel) => {
	state.cancel = cancel;
};

export const SET_DOCUMENT_DONE = (state, done) => {
	state.doneEditing = done;
};

export const SET_SHARED_DOCUMENT = (state, share) => {
	state.sharedDoc = share;
};

export const SET_NOTIFICATION = (state, modal) => {
	state.isOpenModal = modal;
};

export const SET_GUEST = (state, isNew) => {
	state.guest = isNew;
};

export const SET_CONFIRM_GUEST = (state, confirm) => {
	state.confirmGuest = confirm;
};

export const SET_FEEDBACK = (state, feed) => {
	state.feedback = feed;
};

export const SET_ACTIVATED_TOOL = (state, tool) => {
	state.toolData = tool;
};

export const SET_RESOURCE_TOOLS = (state, tool) => {
	state.resourceTools = tool;
};

export const SET_EDIT_RESOURCE_TOOL = (state, edit) => {
	const index = state.resourceTools.findIndex((tool) => tool.id === edit.id);
	if (index !== -1) {
		state.resourceTools.splice(index, 1, edit);
	}
};

export const SET_MESSAGE = (state, msg) => {
	state.message = msg;
};

export const SET_DONE_LOADER = (state, done) => {
	state.isDoneLoading = done;
};

export const SET_DECLINE_LOADER = (state, decline) => {
	state.isDeclineLoading = decline;
};

export const SET_DOWNLOAD = (state, done) => {
	state.isDownloading = done;
};

export const SET_STATUS = (state, status) => {
	state.status = status;
};

export const SET_LOADER = (state, loader) => {
	state.isLoading = loader;
};

export const SET_DOCUMENT_LOADER = (state, loader) => {
	state.isDocLoading = loader;
};

export const SET_PHOTO_LOADER = (state, loader) => {
	state.isPhotoLoading = loader;
};

export const SET_TOOL_LOADER = (state, loader) => {
	state.isToolLoading = loader;
};

export const SET_META = (state, meta) => {
	state.croppedWidthHeight = meta;
};


export const SET_PARTICIPANT_ERROR = (state, hasError) => {
	state.participantError = hasError;
};



