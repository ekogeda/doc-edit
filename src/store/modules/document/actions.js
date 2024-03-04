import Document from '@/api/Document';
import Tool from '@/api/Tool';
import Print from '@/api/Print';
import router from '@/router/router';
import store from '@/store';
import { useDownloadPDFFromServer } from '@/composables/useDownloadPDF';
import { useToast } from 'vue-toast-notification';
const toast = useToast();

export const getUserDocuments = ({ commit }, token) => {
	Document.allDocuments(token)
		.then((response) => commit('SET_DOCUMENTS', response.data))
		.catch((error) => {
			if (error.response.status === 401 || error.response.status == 422) {
				commit('SET_TOKEN', null);
				router.push({ name: 'Login' });
			}
		});
};

export const getUserDocument = ({ commit }, docId) => {
	commit('SET_DOCUMENT_LOADER', true);
	commit('SET_DOCUMENT', []);
	commit('SET_RESOURCE_TOOLS', []);

	Document.showDocument(docId)
		.then((response) => commit('SET_DOCUMENT', response.data.data))
		.then(() => setTimeout(() => commit('SET_DOCUMENT_LOADER', false), 500))
		.then(() => {
			commit('SET_LOADER', true);
			Tool.all(docId).then((response) => {
				commit('SET_RESOURCE_TOOLS', response.data.data);
				commit('SET_LOADER', false);
			});
		})
		.catch((error) => {
			commit('SET_DOCUMENT_LOADER', false);
			if (error.response.status === 401 || error.response.status == 422) {
				commit('SET_TOKEN', null);
				router.push({ name: 'Login' });
			}
		});
};

export const getAuditTrail = ({ commit }, formData) => {
	Document.auditTrail(formData).then((response) => {
		commit('SET_AUDIT_TRAIL', response.data.data);
	});
};

export const getStatistics = ({ commit }, token) => {
	Document.documentStatistics(token).then((response) => commit('SET_DOCUMENT_STATISTICS', response.data));
};

export const getUserDocumentByStatus = ({ commit }, formData) => {
	Document.allDocumentByStatus(formData).then((response) => {
		if (!['Received', 'Deleted'].includes(formData)) {
			commit('SET_DOCUMENTS_BY_STATUS', response.data);
		}
	});
};

export const getLockerDocs = ({ commit }) => {
	const token = store.getters['auth/token'];
	commit('SET_LOADER', true);
	Document.allLockedDocuments(token)
		.then((response) => {
			commit('SET_LOCKER_DOCS', response.data);
			commit('SET_LOADER', false);
		})
		.catch((error) => {
			if (error.response.status === 401 || error.response.status == 422) {
				commit('SET_LOADER', false);
				commit('SET_TOKEN', null);
				router.push({ name: 'Login' });
			}
		});
};

export const getLockerDoc = ({ commit }, docId) => {
	const token = store.getters['auth/token'];

	Document.lockDocument(docId)
		.then((response) => {
			Document.allDocumentByStatus('Completed&sort_by_desc=updated_at').then((response) =>
				commit('SET_DOCUMENTS_BY_STATUS', response.data)
			);
			Document.documentStatistics(token).then((response) => commit('SET_DOCUMENT_STATISTICS', response.data));
			Document.allDocuments(token).then((response) => commit('SET_DOCUMENTS', response.data));

			toast.info(`${response.data.data.message}`, {
				timeout: 5000,
				position: 'top-right',
			});
		})
		.catch((error) => {
			if (error.response.status == 409) {
				toast.error(`${error.response.data.data.error}`, {
					timeout: 5000,
					position: 'top-right',
				});
			}

			if (error.response.status === 401 || error.response.status == 422) {
				commit('SET_TOKEN', null);
				router.push({ name: 'Login' });
			}
		});
};

export const getReceivedDocuments = ({ commit }, token) => {
	Document.allReceivedDocuments(token).then((response) => {
		let receivedArray = [];
		response.data.data.filter((item) => {
			if (item.status != 'Completed') receivedArray.push(item);
		});
		commit('SET_RECEIVED_DOCUMENTS', { data: receivedArray, meta: response.data.meta });
	});
};

export const getDeclinedDocuments = ({ commit }, token) => {
	Document.allDeclinedDocuments(token).then((response) => {
		commit('SET_DECLINED_DOCUMENTS', { data: response.data.data, meta: response.data.meta });
	});
};

export const getCompletedDocuments = ({ commit }, token) => {
	Document.completedDocuments(token).then((response) => commit('SET_COMPLETED_DOCUMENTS', response.data));
};

export const getDeletedDocuments = ({ commit }, token) => {
	Document.allDeletedDocuments(token).then((response) => commit('SET_DOCUMENTS_BY_STATUS', response.data));
};

export const finishAnnotation = ({ commit }, formData) => {
	Document.participantDonePut(formData).then((response) => {
		commit('SET_MESSAGE', response.data.data);

		toast.success('Document annotation completed', {
			timeout: 5000,
			position: 'top-right',
		});

		setTimeout(() => {
			router.push({ name: 'Dashboard', query: { status: 'completed' } });
		}, 1000);
	});
};

export const storeStatus = ({ commit }, formData) => commit('SET_STATUS', formData);

export const removeLoader = ({ commit }) => commit('SET_LOADER', false);

export const fileUploads = ({ commit, getters }, formData) => {
	commit('SET_LOADER', true);
	let documentTitle = formData.title;
	let entryPoint = formData.entry_point;

	Document.storeFileUpload({ title: documentTitle, entry_point: entryPoint })
		.then((response) => commit('SET_INITIALIZED_DOCUMENT_ID', response.data.data.id))
		.then(() => {
			const newFormData = { ...formData, parent_id: getters.initializedDocumentId };
			const files = newFormData.files.map((item) => ({ ...item, parent_id: newFormData.parent_id }));

			newFormData.files = files;

			Document.storeFileUpload(newFormData)
				.then((response) => {
					commit('SET_DOCUMENT', response.data.data);
					commit('SET_CANCEL', true);
					commit('SET_LOADER', false);
					router.push({ name: 'document.edit', params: { document_id: response.data.data.id } });
				})
				.catch((error) => {
					commit('SET_LOADER', false);
					if (error.response.status == 422) {
						toast.error(`${error.response.data.message}`, {
							timeout: 5000,
							position: 'top-right',
						});
					}
				});
		});
};

export const removeRecentUpload = ({ commit }) => commit('SET_CANCEL', false);

export const removeDocument = ({ commit, getters }, formData) => {
	Document.deleteDocument(formData)
		.then((response) => {
			const token = store.getters['auth/token'];
			const status = router.currentRoute.value.query.status;
			const hasParentId = getters.parentChildDocId;

			if (status != undefined) {
				const capitalizedStatus = status.charAt(0).toUpperCase() + status.slice(1);

				Document.documentStatistics(token).then((response) => commit('SET_DOCUMENT_STATISTICS', response.data));
				Document.allLockedDocuments(token).then((response) => commit('SET_LOCKER_DOCS', response.data));

				if (!['Completed', 'Received', 'Deleted'].includes(capitalizedStatus)) {
					Document.allDocumentByStatus(capitalizedStatus).then((response) =>
						commit('SET_DOCUMENTS_BY_STATUS', response.data)
					);
				} else {
					if (capitalizedStatus == 'Completed') {
						Document.completedDocuments(token).then((response) => commit('SET_COMPLETED_DOCUMENTS', response.data));
					}
					if (capitalizedStatus == 'Received') {
						Document.allReceivedDocuments(token).then((response) => commit('SET_RECEIVED_DOCUMENTS', response.data));
					}
					if (capitalizedStatus == 'Deleted') {
						Document.allDeletedDocuments(token).then((response) => commit('SET_DOCUMENTS_BY_STATUS', response.data));
					}
				}
			}

			let message = hasParentId != null ? 'Document replaced successfully' : `${response.data.data.message}`;

			if (hasParentId != null) commit('SET_DOCUMENT_PARENT_CHILD_ID', null);

			toast.success(message, {
				timeout: 5000,
				position: 'top-right',
			});
		})
		.catch((error) => {
			toast.error(`${error.message}`, {
				timeout: 5000,
				position: 'top-right',
			});
		});
};

export const retrieveDocument = ({ commit }, formData) => {
	Document.restoreDocument(formData)
		.then((response) => {
			const token = store.getters['auth/token'];
			Document.allDeletedDocuments(token)
				.then((response) => commit('SET_DOCUMENTS_BY_STATUS', response.data))
				.then(() => {
					Document.documentStatistics(token).then((response) => commit('SET_DOCUMENT_STATISTICS', response.data));
				});

			toast.success(`${response.data.data.message}`, {
				timeout: 5000,
				position: 'top-right',
			});
		})
		.catch((error) => {
			toast.error(`${error.message}`, {
				timeout: 5000,
				position: 'top-right',
			});
		});
};

export const shareDoc = ({ commit }, formData) => {
	Document.shareDocument(formData)
		.then((response) => {
			commit('SET_SHARED_DOCUMENT', response.data.data);

			toast.success(`${response.data.data.message}`, {
				timeout: 5000,
				position: 'top-right',
			});
		})
		.catch((error) => {
			if (error.response.status == 409) {
				toast.error(`${error.response.data.data.error}`, {
					timeout: 5000,
					position: 'top-right',
				});
			}
		});
};

export const addSelf = ({ commit }, formData) => {
	Document.storeSelf(formData)
		.then((response) => {
			commit('SET_DOCUMENT', response.data.data);

			toast.success('You added yourself as a signer', {
				timeout: 5000,
				position: 'top-right',
			});
		})
		.catch((error) => {
			toast.error(`${error.response.data.data.error}`, {
				timeout: 5000,
				position: 'top-right',
			});
		});
};

export const participantError = ({ commit }) => commit('SET_PARTICIPANT_ERROR', false);

export const addParticipant = ({ commit }, formData) => {
	Document.storeParticipant({ participants: formData.payload, has_sequence_order: formData.has_sequence_order })
		.then((response) => {
			commit('SET_DOCUMENT', response.data.data);
			toast.success(`${response.data.message}`, {
				timeout: 5000,
				position: 'top-right',
			});
		})
		.catch((error) => {
			if (error.response.data.data.code == 409) {
				commit('SET_PARTICIPANT_ERROR', true);
				toast.error(`${error.response.data.data.error}`, {
					timeout: 5000,
					position: 'top-right',
				});
			}
			if (error.response.status == 422) {
				toast.error(`${error.response.data.message}`, {
					timeout: 5000,
					position: 'top-right',
				});
			}
		});
};

export const editParticipant = ({ commit }, formData) => {
	Document.updateParticipant({ participants: formData.payload, has_sequence_order: formData.has_sequence_order })
		.then((response) => {
			commit('SET_DOCUMENT', response.data.data);

			toast.info(`${response.data.message}`, {
				timeout: 5000,
				position: 'top-right',
			});
		})
		.catch((error) => {
			toast.error(`${error.message}`, {
				timeout: 5000,
				position: 'top-right',
			});
		});
};

export const removeParticipant = ({ commit, getters }, formData) => {
	Document.deleteParticipant(formData)
		.then((response) => {
			commit('SET_DOCUMENT', response.data.data);

			toast.success('Participant removed successfully', {
				timeout: 5000,
				position: 'top-right',
			});
		})
		.then(() => {
			Tool.all(getters.userDocument.id).then((response) => {
				commit('SET_RESOURCE_TOOLS', response.data.data);
			});
		})
		.catch((error) => {
			if (error.response.status != 403) {
				toast.error(`${error.message}`, {
					timeout: 5000,
					position: 'top-right',
				});
			}
		});
};

export const isGuest = ({ commit }, formData) => {
	commit('SET_GUEST', formData);
	commit('SET_CONFIRM_GUEST', false);
};

export const removeDeclineLoader = ({ commit }, formData) => commit('SET_DECLINE_LOADER', formData);

export const participantAction = async ({ commit, getters }, formData) => {
	try {
		if (formData.payload.status === 'Signed') {
			commit('SET_DONE_LOADER', true);
		}

		const res = await Document.participantDonePut(formData);

		console.log('SET_DONE_LOADER', res.data.data);
		commit('SET_DONE_LOADER', false);
		commit('SET_MESSAGE', null);

		let message = `Document ${formData.payload.status} successfully`;
		toast.success(message, {
			timeout: 5000,
			position: 'top-right',
		});

		setTimeout(() => {
			router.push({
				name: 'document.audit',
				params: { document_id: getters.userDocument.id },
			});
		}, 1000);
	} catch (error) {
		commit('SET_DECLINE_LOADER', false);
		commit('SET_DONE_LOADER', false);

		if (error.response && error.response.status === 409) {
			toast.error(`${error.response.data.data.error}`, {
				timeout: 5000,
				position: 'top-right',
			});
		}
	}
};

export const removeParentDocumentId = ({ commit }) => commit('SET_DOCUMENT_PARENT_CHILD_ID', null);

export const storeParentDocumentId = ({ commit }, formData) => {
	commit('SET_DOCUMENT_PARENT_CHILD_ID', formData);
};

export const documentExport = ({ commit, getters }, formData) => {
	commit('SET_DOWNLOAD', true);
	Document.documentExport(formData)
		.then((response) => {
			useDownloadPDFFromServer(response.data, getters.userDocument.title);
			commit('SET_DOWNLOAD', false);
		})
		.catch(() => {
			commit('SET_DOWNLOAD', false);
		});
};

export const removeNotification = ({ commit }, closeModal) => commit('SET_NOTIFICATION', closeModal);

export const invitationMail = ({ commit }, formData) => {
	Document.mailToParticipant({
		participants: formData.payload,
		has_sequence_order: formData.has_sequence_order,
		subject: formData.payload.subject,
		message: formData.payload.message,
	})
		.then((response) => {
			commit('SET_DOCUMENT', response.data.data);
			commit('SET_NOTIFICATION', true);
		})
		.catch((error) => {
			if (error.response.status == 409) {
				toast.error(`${error.response.data.data.error}`, {
					timeout: 5000,
					position: 'top-right',
				});
			}
			if (error.response.status == 422) {
				toast.error('Kindly add participant(s)', {
					timeout: 5000,
					position: 'top-right',
				});
			}
		});
};

export const sendFeedback = ({ commit }, formData) => {
	commit('SET_FEEDBACK', true);
	Document.feedback(formData)
		.then((response) => {
			commit('SET_FEEDBACK', false);
			toast.success(`${response.data.data.message}`, {
				timeout: 5000,
				position: 'top-right',
			});

			router.push({ name: 'Dashboard', query: { status: 'sent' } });
		})
		.catch((error) => {
			toast.error(`${error.message}`, {
				timeout: 5000,
				position: 'top-right',
			});
		});
};

export const activatedTool = ({ commit }, formData) => commit('SET_ACTIVATED_TOOL', formData);

export const getTools = ({ commit }, formData) => {
	commit('SET_LOADER', true);
	Tool.all(formData).then((response) => {
		commit('SET_LOADER', false);
		commit('SET_RESOURCE_TOOLS', response.data.data);
	});
};

export const resourceTools = ({ commit, getters }, formData) => {
	commit('SET_LOADER', true);
	commit('SET_TOOL_LOADER', { id: formData.id, active: true });
	if (getters.workingTools.length !== 0) {
		const mergedObject = {
			...getters.workingTools[0],
			...formData,
		};
		delete mergedObject.append_print;
		getters.workingTools.push(mergedObject);
	}

	Document.storeTools(formData)
		.then(() => {
			Tool.all(getters.userDocument.id).then((response) => {
				commit('SET_LOADER', false);
				commit('SET_TOOL_LOADER', { id: '', active: false });
				commit('SET_RESOURCE_TOOLS', response.data.data);
			});
		})
		.catch((error) => {
			commit('SET_LOADER', false);
			console.log(error);
		});
};

export const editTools = ({ commit, getters }, formData) => {
	const index = getters.workingTools.findIndex((tool) => tool.id === formData.id);
	if (index !== -1) getters.workingTools.splice(index, 1, { ...getters.workingTools[index], ...formData.payload });

	// eslint-disable-next-line no-unused-vars
	const { append_print, ...objectWithoutAppendPrint } = formData.payload;

	Document.updateTool(formData.id, objectWithoutAppendPrint)
		.then((response) => {
			commit('SET_META', null);
			if (formData.payload.tool_name) {
				// commit('SET_EDIT_RESOURCE_TOOL', response.data.data);
				setTimeout(() => {
					commit('SET_TOOL_LOADER', { id: '', active: false });
				}, 500);
			} else {
				if (formData.payload.value != '') commit('SET_EDIT_RESOURCE_TOOL', response.data.data);
			}
		})
		.catch((error) => {
			console.log(error);
			commit('SET_TOOL_LOADER', { id: '', active: false });
		});
};

export const clearTools = ({ commit, getters }) => {
	const tools = getters.workingTools;

	tools.forEach((item) => {
		setTimeout(() => {
			const index = tools.findIndex((tool) => tool.id === item.id);
			if (index !== -1) tools.splice(index, 1);
			commit('SET_RESOURCE_TOOLS', tools);
		}, 100);
		Document.deleteTool(item.id);
	});
};

export const removeTool = ({ commit, getters }, formData) => {
	const tools = getters.workingTools;
	const index = tools.findIndex((tool) => tool.id === formData.toolId);
	if (index !== -1) tools.splice(index, 1);

	commit('SET_RESOURCE_TOOLS', tools);

	Document.deleteTool(formData.toolId);
	if (formData.printId == undefined || formData.toolName != 'Textarea') return;
	Print.deletePrint(formData.printId);
};

export const cropMeta = ({ commit }, formData) => {
	commit('SET_META', formData);
};

export const clearCropMeta = ({ commit }) => commit('SET_META', {});



