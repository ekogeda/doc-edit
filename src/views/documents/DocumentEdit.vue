<template>
  <nav v-if="signerRole != 'Viewer'"
    class="header-navbar navbar navbar-expand-lg floating-nav navbar-shadow container-xxl" style="z-index: 102"
    :style="[type == 'xs' ? 'margin:0!important;top:0' : '']">
    <div class="navbar-container">
      <div class="d-flex pb-1">
        <div class="bookmark-wrapper d-flex align-items-center">
          <ul class="nav navbar-nav bookmark-icons" v-show="hasRole">
            <li class="nav-item">
              <PuSkeleton v-if="isDocLoading" width="140px" height="30px" />
              <template v-else>
                <template v-if="isOwner && type != 'lg'">
                  <AddSelfToSignatories :mobile="true" />
                </template>
                <div v-else :class="[type == 'lg' ? 'btn-group' : 'dropdown']">
                  <button v-if="type == 'lg'" type="button" class="btn btn-primary">
                    <SettingIcon />
                    Manage Assets
                  </button>
                  <button type="button" class="btn btn-outline-primary dropdown-toggle"
                    :class="[type == 'lg' ? 'dropdown-toggle-split' : 'btn-sm']" data-bs-toggle="dropdown"
                    aria-expanded="false">
                    <template v-if="!isOwner && type != 'lg'">
                      <SettingIcon />
                      Assets
                    </template>
                    <span class="visually-hidden"></span>
                  </button>
                  <div class="dropdown-menu" :class="[type == 'lg' ? 'dropdown-menu-end' : 'dropdown-menu-left']"
                    :style="{ top: type == 'xs' ? '40px!important' : '' }">
                    <a class="dropdown-item" href="#" @click="affixModal = true">Manage Signature</a>
                    <template v-if="planned == 'Business'">
                      <a class="dropdown-item" href="#" @click="sealModal = true">Manage Seal</a>
                      <a class="dropdown-item" href="#" @click="stampModal = true">Manage Stamp</a>
                    </template>
                  </div>
                </div>
              </template>
            </li>
          </ul>
        </div>

        <ul class="nav navbar-nav align-items-center ms-auto">
          <PuSkeleton v-if="isDocLoading" width="140px" height="30px" />
          <template v-else>
            <template v-if="signerRole != 'Approver'">
              <li v-if="userDocument.status != 'Completed'" class="nav-item">
                <template v-if="isOwner">
                  <template v-if="(!canComplete && userDocument.participants_count != 0) ||
                    userDocument.participants_count > 1
                    ">
                    <a class="nav-link nav-link-style">
                      <button class="btn btn-primary" :class="[type != 'lg' ? 'btn-sm' : '']" @click="emailModal = true">
                        Send
                      </button>
                    </a>
                  </template>
                  <template v-else>
                    <a v-if="canComplete" class="nav-link nav-link-style" @click="doneModal = true">
                      <button class="btn btn-primary" :class="[type != 'lg' ? 'btn-sm' : '']" @click="doneModal = true">
                        Finish
                      </button>
                    </a>
                  </template>
                </template>
                <template v-else>
                  <a class="nav-link nav-link-style">
                    <button class="btn btn-primary" :class="[type != 'lg' ? 'btn-sm' : '']" @click="doneModal = true">
                      Submit
                    </button>
                  </a>
                </template>
              </li>
            </template>
            <!-- <li v-if="isOwner && workingTools.length > 0">
						<a class="nav-link nav-link-style">
							<ClearAllTools />
						</a>
					</li> -->
            <template v-if="role == 'Approver' && type == 'lg'">
              <template v-if="userDocument.status != 'Completed'">
                <li class="nav-item">
                  <a class="nav-link nav-link-style" @click="openApproveModal = true">
                    <button class="btn btn-primary" :class="[type != 'lg' ? 'btn-sm' : '']">
                      Approve
                    </button>
                  </a>
                </li>
                <li class="nav-item" v-if="hasApproverSigned != 'Approved'">
                  <a class="nav-link nav-link-style" @click="openDeclineModal = true">
                    <button class="btn btn-outline-danger" :class="[type != 'lg' ? 'btn-sm' : '']">
                      Decline
                    </button>
                  </a>
                </li>
                <li class="nav-item">
                  <a class="nav-link nav-link-style" @click="documentExport(uri)" :disabled="isDownload">
                    <button class="btn btn-outline-primary" :class="[type != 'lg' ? 'btn-sm' : '']">
                      <template v-if="isDownload">
                        <span class="spinner-border spinner-border-sm"></span>
                        Downloading
                      </template>
                      <template v-else>Download</template>
                    </button>
                  </a>
                </li>
              </template>
            </template>
            <template v-else>
              <li v-if="!isOwner && type == 'lg'" class="nav-item">
                <a class="nav-link nav-link-style" @click="documentExport(uri)" :disabled="isDownload">
                  <button class="btn btn-outline-primary" :class="[type != 'lg' ? 'btn-sm' : '']">
                    <template v-if="isDownload">
                      <span class="spinner-border spinner-border-sm"></span>
                      Downloading
                    </template>
                    <template v-else>Download</template>
                  </button>
                </a>
              </li>
              <template v-if="!isOwner && signerRole == 'Signer' && type == 'lg'">
                <li v-if="userDocument.status != 'Completed'" class="nav-item">
                  <a class="nav-link nav-link-style" @click="openDeclineModal = true">
                    <button class="btn btn-outline-danger" :class="[type != 'lg' ? 'btn-sm' : '']" :disabled="isDecline">
                      <template v-if="isDecline">
                        <span class="spinner-border spinner-border-sm"></span>
                        Declining
                      </template>
                      <template v-else>Decline to sign</template>
                    </button>
                  </a>
                </li>
              </template>
              <template v-else>
                <li v-if="userDocument.status == 'Completed'" class="nav-item">
                  <a class="nav-link nav-link-style" @click="documentExport(uri)" :disabled="isDownload">
                    <button class="btn btn-outline-primary" :class="[type != 'lg' ? 'btn-sm' : '']">
                      <template v-if="isDownload">
                        <span class="spinner-border spinner-border-sm"></span>
                        Downloading
                      </template>
                      <template v-else>Download</template>
                    </button>
                  </a>
                </li>
                <li v-else class="nav-item">
                  <a class="nav-link nav-link-style p-0">
                    <div class="dropdown">
                      <button class="btn btn-outline-primary" :class="[type != 'lg' ? 'btn-sm' : '']" id="moreContent"
                        data-bs-toggle="dropdown" aria-expanded="false">
                        More
                        <VerticalEllipsis />
                      </button>
                      <ul class="dropdown-menu dropdown-menu-right" aria-labelledby="moreContent">
                        <template v-if="isOwner && type != 'lg'">
                          <h5 class="dropdown-item mb-0">Manage</h5>
                          <hr class="dropdown-divider" />
                          <a class="dropdown-item" href="#" @click="affixModal = true">
                            <Icon icon="mdi:file-sign" class="text-primary" style="font-size: 1.3rem" />&nbsp; Signature
                          </a>
                          <template v-if="planned == 'Business'">
                            <a class="dropdown-item" href="#" @click="sealModal = true">
                              <SealIcon class="text-primary" />&nbsp; Seal
                            </a>
                            <a class="dropdown-item" href="#" @click="stampModal = true">
                              <StampIcon class="text-primary" />&nbsp; Stamp
                            </a>
                          </template>
                          <hr class="dropdown-divider" />
                          <a class="dropdown-item" role="button" @click="addParticipantModal = true">
                            <Icon icon="akar-icons:plus" class="text-primary" />&nbsp; Add
                            participants
                          </a>
                        </template>
                        <template v-if="type != 'lg'">
                          <UserAvatar :fromDocEdit="true" />
                          <hr class="dropdown-divider" />
                        </template>
                        <template v-if="role == 'Approver'">
                          <a class="dropdown-item" role="button" @click="openApproveModal = true">
                            <Icon icon="material-symbols:order-approve-outline-rounded" class="text-primary"
                              style="font-size: 1.2rem" />&nbsp; Approve
                          </a>
                          <a class="dropdown-item" role="button" @click="openDeclineModal = true">
                            <Icon icon="fluent-mdl2:entry-decline" class="text-primary" style="font-size: 1.2rem" />&nbsp;
                            Decline
                          </a>
                          <hr class="dropdown-divider" />
                        </template>
                        <a v-if="isOwner && canComplete" class="dropdown-item" role="button" @click="doneModal = true">
                          <Icon icon="material-symbols:download-done" class="text-primary" />&nbsp; Finish
                        </a>
                        <a class="dropdown-item" role="button" @click="documentExport(uri)" :disabled="isDownload">
                          <Icon icon="bx:download" class="text-primary" />&nbsp;
                          <template v-if="isDownload">
                            <span class="spinner-border spinner-border-sm"></span>
                            Downloading
                          </template>
                          <template v-else>Download</template>
                        </a>
                        <a v-if="isOwner && workingTools.length > 0" class="dropdown-item">
                          <Icon icon="ph:eraser-duotone" class="text-primary" style="font-size: 1.2rem" />&nbsp;
                          <ClearAllTools :isDropDown="true" />
                        </a>
                        <a v-if="!isOwner && signerRole == 'Signer'" class="dropdown-item text-danger" role="button"
                          @click="openDeclineModal = true">
                          <Icon icon="mdi:cancel-box-outline" style="font-size: 1.2rem" />&nbsp; Decline to sign
                        </a>
                        <a v-if="type != 'lg'" class="dropdown-item" role="button" @click="openActivityModal = true">
                          <Icon icon="tdesign:file-zip" class="text-primary" style="font-size: 1.2rem" />&nbsp; Activities
                        </a>
                        <a v-if="isOwner && canCancel" class="dropdown-item" role="button" @click="cancel">
                          <Icon icon="iconoir:cancel" class="text-danger" />&nbsp; Cancel
                        </a>
                        <router-link v-if="type != 'lg'" :to="{ name: 'document.upload' }"
                          class="dropdown-item" role="button">
                          <Icon icon="charm:chevron-left" class="text-primary" />&nbsp; Back
                        </router-link>
                        <template v-if="isOwner">
                          <hr class="dropdown-divider" />
                          <a class="dropdown-item" role="button" @click="openAddMoreDocUpload = true">
                            <Icon icon="ic:baseline-plus" class="text-primary" />&nbsp;
                            Add/Replace Document
                          </a>
                        </template>
                      </ul>
                    </div>
                  </a>
                </li>
              </template>
            </template>
          </template>
        </ul>
      </div>


      <div v-if="type != 'lg'" class="d-flex justify-content-between align-items-center">
        <PuSkeleton v-if="isDocLoading" width="140px" height="30px" />
        <template v-else>
          <DropdownUserSelect v-if="isOwner" @emitToolKitData="handleToolKitData" />

          <div v-else>
            <NextButton @goToNextTool="scrollToNextTool" />
          </div>
        </template>
        <PuSkeleton v-if="isDocLoading" width="140px" height="30px" />
        <template v-else>
          <div class="w-50 ms-auto" style="padding-right: 10px">
            <UserAvatar :fromDocEdit="true" :showAvatar="true" />
          </div>

          <div v-if="isOwner" style="width: 35px; height: 35px">
            <button data-bs-toggle="tooltip" data-bs-placement="top" title="Add participants"
              class="btn rounded-circle ttw_button" @click="addParticipantModal = true">
              <PlusIcon />
            </button>
          </div>
        </template>
      </div>
    </div>
  </nav>

  <div class="content-area-wrapper container-xxl p-0 mt-5 overflow-x-scroll border-0" style="position: static !important">
    <AsideLeft :chunkFileId="pageId" />
    <MainContent @docId="getDocId" @open="open" :isDownload="isDownload" :doneModal="doneModal" />
    <AsideRight :isOwner="isOwner" />
  </div>

  <div v-if="isOwner" class="fixed-bottom bg-white shadow-lg custom-sm">
    <AsideBottom :chunkFileId="pageId" :toolValue="toolKitValue" :isOpen="addParticipantModal"
      @close="addParticipantModal = false" />
  </div>

  <ModalComp :show="openAddMoreDocUpload" :header="false" :footer="false" @close="openAddMoreDocUpload = false">
    <template #body>
      <h3 class="modal-title text-darker my-2">Edit document uploaded</h3>
      <h4 class="text-darker">Existing Documents</h4>

      <AddMoreDocument :parentId="uri" @close="openAddMoreDocUpload = false">
        <template #prefix>
          <p>Add or replace documents you have uploaded</p>
        </template>
      </AddMoreDocument>

      <div class="row align-items-center">
        <div class="col-12 mb-2" v-for="(doc, index) in userDocument.child_documents" :key="index">
          <div class="d-flex align-items-center">
            <Icon icon="bxs:file-pdf" class="text-danger" style="font-size: 2rem" />
            <div class="mx-1 text-truncate" style="padding: 0.5rem">
              {{ doc.title }}
            </div>
            <span class="text-center d-none d-md-block"></span>
            <button class="btn btn-outline-primary border-0 ms-auto" :class="[type == 'xs' ? 'btn-sm' : 'btn-md']"
              @click="goToUploadPage({ child_id: doc.id, parent_id: doc.parent_id })" :disabled="false">
              Replace
            </button>
          </div>
        </div>
      </div>
    </template>
  </ModalComp>

  <ModalComp :show="openReplaceDoc" :size="'modal-sm'" :header="false" :footer="false" @close="openReplaceDoc = false">
    <template #body>
      <div class="my-2">
        <h4 class="text-darker">Replace document</h4>
        <p>
          This will take you back to the document upload page. Are you sure you want to
          proceed?
        </p>
      </div>

      <div class="mb-1">
        <button class="btn border me-1" @click="openReplaceDoc = false">Cancel</button>
        <button class="btn btn-danger" @click="handleSaveParentId">Yes</button>
      </div>
    </template>
  </ModalComp>

  <ModalComp :show="openApproveModal" :size="'modal-sm'" :header="false" :footer="false" :closeBtn="false">
    <template #body>
      <div class="mt-2 mb-3">
        <h3 class="text-darker mb-1">Approve document</h3>
        <p>Are you sure you want to proceed?</p>
      </div>

      <div class="mb-1">
        <button class="btn border me-1" @click="openApproveModal = false">Cancel</button>
        <button class="btn btn-primary" @click="handleApprover" :disabled="isDecline">
          <span v-show="isDecline" class="spinner-border spinner-border-sm"></span>
          <template v-if="!isDecline">Yes</template>
          <template v-else> Processing...</template>
        </button>
      </div>
    </template>
  </ModalComp>

  <ModalComp :show="isDecline" :header="false" :footer="false" :size="'modal-sm'" @close="closCommentModal">
    <template #body>
      <div class="text-center py-2">
        <img src="https://skoutwatch.com/static/media/logo.1af99f8777344173aa7f.png" width="70" alt="Icon" class="img-fluid" />

        <h3 class="text-darker my-1">
          You've successfully {{ approveOrDecline }} the document
        </h3>
        <p class="mb-3">
          <Icon icon="bxs:file-pdf" class="text-danger" style="font-size: 2rem" />
          {{ userDocument.title }}
        </p>

        <a href="/" class="btn btn-primary">Upload</a>
      </div>
    </template>
  </ModalComp>

  <ModalComp :show="openActivityModal" :header="false" :footer="false" :size="'modal-sm'"
    @close="openActivityModal = false">
    <template #body>
      <h3 class="text-darker my-2">Activities</h3>

      <UserActivities />

      <div class="modal-footer border-0 pe-0">
        <button class="btn border" @click="openActivityModal = false">Close</button>
      </div>
    </template>
  </ModalComp>

  <ModalComp :show="openDeclineModal" :size="'modal-sm'" :header="false" :footer="false"
    @close="openDeclineModal = false">
    <template #body>
      <div class="my-2">
        <h3 class="text-darker mb-1">
          {{ signerRole == "Approver" ? "Reject approval" : "Decline to sign" }}
        </h3>
        <p>
          {{
            signerRole == "Approver"
            ? "Are you sure you want to proceed with the rejection?"
            : "Are you sure you want to proceed with declining to sign this Note?"
          }}
        </p>
      </div>

      <div class="mb-1">
        <button class="btn border me-1" @click="openDeclineModal = false">Cancel</button>
        <button class="btn btn-outline-danger" @click="isDeclineToggle = !isDeclineToggle">
          Yes, Decline
          <Icon icon="tabler:chevron-down" />
        </button>

        <div class="border rounded-3 p-1 mt-1 fades" :class="[isDeclineToggle ? 'd-block' : 'd-none']">
          <p v-if="role == 'Approver'" class="d-flex justify-content-between text-danger mb-1">
            <Icon icon="material-symbols:info-outline" style="font-size: 1.5rem; width: 50px; margin-right: 0.6rem" />
            This action will clear all filled fields in the document and deny all
            participant access to the document.
          </p>

          <div class="form-group mb-1">
            <label for="reason" class="form-label text-darker">Type reason</label>
            <textarea rows="5" v-model="commentReport" id="reason" class="form-control rounded-3" style="resize: none"
              placeholder="Enter reason for declining..."></textarea>
          </div>

          <button class="btn" :class="[commentReport == '' ? 'btn-outline-danger' : 'btn-danger']"
            @click="handleDeclineReport" :disabled="isDecline || commentReport == ''">
            <span v-show="isDecline" class="spinner-border spinner-border-sm"></span>
            <template v-if="!isDecline">Decline and Submit Report</template>
            <template v-else> Processing...</template>
          </button>
        </div>
      </div>
    </template>
  </ModalComp>

  <ModalComp :show="emailModal" :header="false" :footer="false" @close="emailModal = false">
    <template #body>
      <h3 class="modal-title text-darker my-2">Invite participants</h3>

      <div class="row">
        <div class="col-12">
          <h3 class="text-darker my-2">
            The following people will be invited to this document
          </h3>
        </div>
      </div>
      <MailToParticipant @close="emailModal = false" :isLoading="loading" />
    </template>
  </ModalComp>

  <ModalComp :show="openNotificationModal" :size="'modal-md'" :header="false" :closeBtn="false">
    <template #body>
      <div>
        <h5 class="my-2 text-darker">Feedback</h5>

        <div class="d-flex align-items-center">
          <div class="rounded-circle alert alert-success mb-0" style="padding: 8px">
            <Icon icon="game-icons:check-mark" style="font-size: 1.5rem" />
          </div>
          <div class="ms-1">
            <h3 class="text-darker">Your document has been sent</h3>
            <span>Your feedback is very important to us. It gives us the opportunity to serve
              you better.</span>
          </div>
        </div>

        <hr />

        <div class="mb-2">
          <p class="text-darker">How was your experience?</p>
          <StarRating :star-size="30" :increment="0.5" active-color="#ffc107" :show-rating="false"
            v-model:rating="rating" />

          <div class="d-flex justify-content-between align-items-center" style="width: 235px">
            <span class="text-secondary">Bad</span>
            <span class="text-secondary">Excellent</span>
          </div>
        </div>

        <h6>Do you have any thought you'd like to share?</h6>
      </div>

      <textarea class="form-control mb-1" rows="4" v-model="feedback" placeholder="Enter a comment..."></textarea>
    </template>
    <template #footer>
      <button class="btn btn-outline-secondary" @click="skipFeedback">Skip</button>
      <button class="btn btn-primary" @click="sendRatedFeedback">Send</button>
    </template>
  </ModalComp>

  <ModalComp :show="openComment" :header="false" :footer="false" :size="'modal-sm'" :closeBtn="false">
    <template #body>
      <div class="text-center py-2">
        <img src="https://skoutwatch.com/static/media/logo.1af99f8777344173aa7f.png" width="70" alt="Icon" class="img-fluid" />

        <h3 class="text-darker my-1">Thank you for letting us know</h3>
        <p>Your feedback will help us improve the quality of the service</p>
      </div>
    </template>
  </ModalComp>

  <ModalComp :show="affixModal" :header="false" :footer="false" :size="'modal-sm'" @close="affixModal = false">
    <template #body>
      <h3 class="modal-title text-darker my-2">My Signatures</h3>

      <div class="row">
        <div class="col-md-4 ms-auto">
          <button @click="updateModal" class="float-end btn btn-outline-secondary btn-sm waves-effect"
            id="updateSignature">
            <EditIcon />
            Edit
          </button>
        </div>
      </div>

      <div class="divider"></div>

      <SignaturePrint @selectedSignature="savePrint" />
    </template>
  </ModalComp>

  <ModalComp :show="updateSignatureModal" :size="'modal-lg'" :header="false" :footer="false"
    @close="updateSignatureModal = false">
    <template #body>
      <h3 class="text-darker my-2">Create Signature</h3>

      <TopTabWrapper>
        <TopTabList title="Draw">
          <SignaturePad @close="updateSignatureModal = false" />
        </TopTabList>

        <TopTabList title="Select">
          <SignatureSelectFull @close="updateSignatureModal = false" />
        </TopTabList>

        <TopTabList title="Upload">
          <div class="row">
            <div class="col-md-12 mx-auto position-relative">
              <SignatureUpload @close="updateSignatureModal = false" />
            </div>
          </div>
        </TopTabList>
      </TopTabWrapper>
    </template>
  </ModalComp>

  <ModalComp :show="sealModal" :header="false" :footer="false" :size="'modal-md'" @close="sealModal = false">
    <template #body>
      <h3 class="modal-title text-darker my-2">My Seal</h3>

      <div class="row">
        <div class="col-md-4 ms-auto">
          <button @click="updateSeal" class="float-end btn btn-outline-secondary btn-sm waves-effect">
            <SealIcon />
            Manage
          </button>
        </div>
      </div>

      <div class="divider"></div>

      <SealList />
    </template>
  </ModalComp>

  <ModalComp :show="stampModal" :header="false" :footer="false" :size="'modal-md'" @close="stampModal = false">
    <template #body>
      <h3 class="modal-title text-darker my-2">My Stamp</h3>

      <div class="row">
        <div class="col-md-4 ms-auto">
          <button @click="updateStamp" class="float-end btn btn-outline-secondary btn-sm waves-effect">
            <StampIcon />
            Manage
          </button>
        </div>
      </div>

      <div class="divider"></div>

      <StampList />
    </template>
  </ModalComp>

  <ModalComp :show="createStampModal" :header="false" :footer="false" :size="'modal-md'"
    @close="createStampModal = false">
    <template #body>
      <h3 class="modal-title text-darker my-2">Manage a stamp</h3>

      <StampCreate @close="createStampModal = false" />
    </template>
  </ModalComp>

  <ModalComp :show="createSealModal" :header="false" :footer="false" :size="'modal-lg'" @close="createSealModal = false">
    <template #body>
      <h3 class="modal-title text-darker my-2">Manage a seal</h3>

      <SealDigitalCreate @close="createSealModal = false" />
    </template>
  </ModalComp>

  <ModalComp :show="downloadModal" :header="false" :footer="false" :size="'modal-sm'" :closeBtn="false">
    <template #body>
      <p class="my-2 text-center">Download processing...</p>
    </template>
  </ModalComp>

  <ModalComp :show="doneModal" :size="'modal-sm'" :header="false" @close="doneModal = false">
    <template #body>
      <p class="text-center mt-3 mb-2">
        Please confirm that you are done signing<br />
        <span v-if="isOwner">No participants will receive this document.</span>
      </p>
    </template>

    <template #footer>
      <button class="btn border me-1" @click="doneModal = false">Cancel</button>
      <button class="btn btn-primary" @click="confirmEdit" :disabled="doneBtn">
        <span v-show="doneBtn" class="spinner-border spinner-border-sm"></span>
        <template v-if="!doneBtn">Confirm</template>
        <template v-else> Processing...</template>
      </button>
    </template>
  </ModalComp>

  <ModalComp :show="cancelModal" :size="'modal-sm'" :header="false" @close="cancelModal = false">
    <template #body>
      <div class="my-2">
        <h3 class="text-center">Are you sure?</h3>
        <p class="text-center"><i>Changes will not be saved!</i></p>
      </div>
    </template>

    <template #footer>
      <button class="btn border me-1" @click="cancelModal = false">Cancel</button>
      <button class="btn btn-danger" @click="deletePermanently">
        <span v-show="loading" class="spinner-border spinner-border-sm"></span>
        Proceed
      </button>
    </template>
  </ModalComp>

  <ModalComp :show="confirmGuest" :size="'modal-lg'" :header="false" :footer="false" @close="closeGuest">
    <template #body>
      <UserResetPassword @save="closeGuest" />
    </template>
  </ModalComp>

  <Teleport to="body">
    <ModalComp :show="openErrorModal" :size="'sm'" :header="false" :footer="false" @close="participantError">
      <template #body>
        <h3 class="modal-title text-darker my-2">Participant limit reached</h3>

        <template v-if="planned == 'Basic'">
          <p>
            You have hit your limit of 1 Participant.<br />
            Upgrade to our Pro or Business plan to enjoy larger participant limits.
          </p>
        </template>
        <template v-else-if="planned == 'Pro'">
          <p>
            You have hit your limit of 5 Participants.<br />
            Upgrade to our Business plan to enjoy larger participant limits.
          </p>
        </template>
        <template v-else>
          <p>
            You have hit your limit of 20 Participants. <br />
            Contact support to discuss getting a custom participant limit.
          </p>
        </template>

        <div class="modal-footer justify-content-start border-0 ps-0">
          <button @click="participantError" class="btn btn-outline-secondary">
            Cancel
          </button>
          <button @click="handleUpgradeRedirect" class="btn btn-primary">Upgrade</button>
        </div>
      </template>
    </ModalComp>
  </Teleport>
</template>

<script setup>
import { Icon } from "@iconify/vue";
// import VLazyImage from "v-lazy-image";
import EditIcon from "@/icons/EditIcon.vue";
import SettingIcon from "@/icons/SettingIcon.vue";
import PlusIcon from "@/icons/PlusIcon.vue";
import VerticalEllipsis from "@/icons/VerticalEllipsis.vue";
import SealIcon from "@/icons/SealIcon.vue";
import StampIcon from "@/icons/StampIcon.vue";
import StarRating from "vue-star-rating";

import ModalComp from "@/components/ModalComp.vue";
import AddMoreDocument from "@/components/AddMoreDocument.vue";
import UserActivities from "@/components/UserActivities.vue";
import ClearAllTools from "@/components/ClearAllTools.vue";
import UserAvatar from "@/components/Document/Edit/Left/UserAvatar.vue";
import NextButton from "@/components/Document/Edit/Main/NextButton.vue";
// import UserSelect from "@/components/Document/Edit/Left/UserSelect.vue";
import DropdownUserSelect from "@/components/DropdownUserSelect.vue";
import UserResetPassword from "@/components/Auth/UserResetPassword.vue";
import AsideLeft from "@/components/Document/Edit/Left/AsideLeft.vue";
import AsideRight from "@/components/Document/Edit/Right/AsideRight.vue";
import MainContent from "@/components/Document/Edit/Main/MainContent.vue";

import AddSelfToSignatories from "@/components/Document/Edit/Left/AddSelfToSignatories.vue";
import AsideBottom from "@/components/Document/Edit/Mobile/AsideBottom.vue";

import MailToParticipant from "@/components/Document/Edit/MailToParticipant.vue";

import TopTabWrapper from "@/components/Tab/TabTopNav/TopTabWrapper.vue";
import TopTabList from "@/components/Tab/TabTopNav/TopTabList.vue";

import SignaturePrint from "@/components/Signature/SignaturePrint.vue";
import SignaturePad from "@/components/Signature/SignaturePad.vue";

import SignatureSelectFull from "@/components/Signature/SignatureSelectFull.vue";
import SignatureUpload from "@/components/Signature/SignatureUpload.vue";

import SealDigitalCreate from "@/components/Notary/Seal/SealDigitalCreate.vue";
import SealList from "@/components/Notary/Seal/SealList.vue";

import StampList from "@/components/Notary/Stamp/StampList.vue";
import StampCreate from "@/components/Notary/Stamp/StampCreate.vue";

import { ref, onMounted, watch, onUnmounted, computed } from "vue";

import { useGetters, useActions } from "vuex-composition-helpers/dist";
import { useRouter } from "vue-router";
import { dashboard } from "@/store/dashboard";
import { useBreakpointsComposable } from "@/composables/useBreakpoints";
const { type } = useBreakpointsComposable();

const route = useRouter();

const {
  token,
  profile,
  teams,
  userDocument,
  workingTools,
  isOpenModal,
  canCancel,
  confirmGuest,
  isDocLoading,
  isDoneLoading,
  isDeclineLoading,
  isDownloading,
  participantErrorModal,
} = useGetters({
  token: "auth/token",
  profile: "auth/profile",
  teams: "team/teams",
  userDocument: "document/userDocument",
  workingTools: "document/workingTools",
  isOpenModal: "document/isOpenModal",
  canCancel: "document/canCancel",
  confirmGuest: "document/confirmGuest",
  isDocLoading: "document/isDocLoading",
  isDoneLoading: "document/isDoneLoading",
  isDeclineLoading: "document/isDeclineLoading",
  isDownloading: "document/isDownloading",
  participantErrorModal: "document/participantErrorModal",
});

const {
  sendFeedback,
  removeNotification,
  isGuest,
  removeDocument,
  removeRecentUpload,
  participantAction,
  removeDeclineLoader,
  documentExport,
  storeParentDocumentId,
  clearFlag,
  getUserPrints,
  participantError,
} = useActions({
  sendFeedback: "document/sendFeedback",
  removeNotification: "document/removeNotification",
  isGuest: "document/isGuest",
  removeDocument: "document/removeDocument",
  removeRecentUpload: "document/removeRecentUpload",
  participantAction: "document/participantAction",
  removeDeclineLoader: "document/removeDeclineLoader",
  documentExport: "document/documentExport",
  storeParentDocumentId: "document/storeParentDocumentId",
  clearFlag: "auth/clearFlag",
  getUserPrints: "print/getUserPrints",
  participantError: "document/participantError",
});

const openAddMoreDocUpload = ref(false);
const openReplaceDoc = ref(false);
const openApproveModal = ref(false);
const openActivityModal = ref(false);
const openDeclineModal = ref(false);
const isDeclineToggle = ref(false);
const redirectToUserDashboard = ref("");
const addParticipantModal = ref(false);
const openNotificationModal = ref(false);
const isOpen = ref(false);
const pageId = ref("");
const doneModal = ref(false);
const cancelModal = ref(false);
const emailModal = ref(false);
const affixModal = ref(false);
const updateSignatureModal = ref(false);
const sealModal = ref(false);
const createSealModal = ref(false);
const createStampModal = ref(false);
const stampModal = ref(false);
const loading = ref(false);
const plan = ref(null);
const hasRole = ref(false);
const role = ref(null);
const uri = ref("");
const feedback = ref("");
const rating = ref(0);
const doneBtn = ref(false);
const upgradeUserAccount = ref("");

const openErrorModal = computed(() => participantErrorModal.value);

const handleUpgradeRedirect = () => {
  participantError();
  window.location.href = upgradeUserAccount.value;
};

const planned = computed(() => {
  teams.value.map((team) => {
    if (team.active === true && team.subscription != null) {
      plan.value = team.subscription.plan.name;
    }
  });
  return plan.value;
});

const hasApproverSigned = ref(false);
const signerRole = computed(() => {
  userDocument.value?.participants?.filter((participant) => {
    if (participant?.user?.id == profile.value?.id) {
      role.value = participant.role;
      hasApproverSigned.value = participant.status;
    }

    return role.value;
  });

  return role.value;
});

const canComplete = computed(() => {
  if (userDocument.value?.participants_count != 0) {
    const signerIDs = [];
    userDocument.value?.participants?.map((participant) =>
      signerIDs.push(participant?.user?.id)
    );

    let ownerInclusive = signerIDs.includes(profile.value?.id);
    if (ownerInclusive) dashboard.value.setCanComplete(true);
    else dashboard.value.setCanComplete(false);
  } else dashboard.value.setCanComplete(false);

  return dashboard.value.canComplete;
});

const downloadModal = ref(false);
watch(
  () => [isOpenModal.value, isDoneLoading.value, isDownloading.value],
  ([isOpen, isDone, isNewDownload], [isOldOpen, isOldDone, isOldDownload]) => {
    if (isOpen != isOldOpen) openNotificationModal.value = isOpen;
    if (isDone != isOldDone) doneModal.value = doneBtn.value = isDone;
    if (isNewDownload != isOldDownload) downloadModal.value = isNewDownload;
  }
);

const isDecline = computed(() => isDeclineLoading.value);

const commentReport = ref("");
const approveOrDecline = ref("");
const handleDeclineReport = () => {
  approveOrDecline.value = "declined";
  let dataObj = { status: "Declined", comment: commentReport.value };
  participantAction({ id: uri.value, payload: dataObj });
  setTimeout(() => {
    openDeclineModal.value = false;
    dataObj = "";
  }, 2000);
};

const handleApprover = () => {
  approveOrDecline.value = "approved";
  participantAction({ id: uri.value, payload: { status: "Approved" } });
  setTimeout(() => {
    openApproveModal.value = false;
  }, 2000);
};

const closCommentModal = () => removeDeclineLoader(false);

const closeGuest = () => {
  isGuest({ openGuestModal: false });

  window.location.href = redirectToUserDashboard.value;
};

const parentChildId = ref("");
const goToUploadPage = (params) => {
  parentChildId.value = params;
  openAddMoreDocUpload.value = false;
  openReplaceDoc.value = true;
};

const handleSaveParentId = () => {
  storeParentDocumentId(parentChildId.value);
  route.push({ name: "document.upload" });
};

const open = (params) => (isOpen.value = params);

const cancel = () => (cancelModal.value = true);

const deletePermanently = () => {
  removeDocument({ documents: [{ document_id: uri.value, permanent_delete: true }] });
  route.push({ name: "document.upload" });
};

const getDocId = (params) => (pageId.value = params);

const updateModal = () => {
  affixModal.value = false;
  updateSignatureModal.value = true;
};

const updateSeal = () => {
  sealModal.value = false;
  createSealModal.value = true;
};

const updateStamp = () => {
  stampModal.value = false;
  createStampModal.value = true;
};

const confirmEdit = () => {
  let dataObj = { status: "Signed" };
  participantAction({ id: uri.value, payload: dataObj });
};

const skipFeedback = () => {
  removeNotification(false);
  route.push({ name: "document.upload" });
};

const openComment = ref(false);
const sendRatedFeedback = () => {
  const feedObj = {
    review_id: uri.value,
    review_type: "Document",
    comment: feedback.value,
    rating: rating.value.toString(),
  };

  sendFeedback(feedObj);
  openNotificationModal.value = false;
  openComment.value = true;
  removeNotification(false);
};

const isOwner = computed(() => {
  return userDocument.value.is_the_owner_of_document;
});

const scrollToNextTool = (toolId) => {
  const nextToolElement = document.getElementById(`userTools-${toolId}`);
  if (nextToolElement) {
    nextToolElement.scrollIntoView({
      behavior: "smooth",
      block: "center",
      inline: "nearest",
    });

    const spanElement = nextToolElement.querySelector(".tooltiptext");
    if (spanElement) spanElement.style.visibility = "visible";
  }
};

const toolKitValue = ref({});
const handleToolKitData = (params) => (toolKitValue.value = params);

onMounted(() => {
  removeDeclineLoader(false);

  const AUTH_URL = process.env.VUE_APP_URL_AUTH_LIVE;
  const USER_UPGRADE = process.env.VUE_APP_URL_USER_UPGRADE_LIVE;

  redirectToUserDashboard.value = AUTH_URL;
  upgradeUserAccount.value = USER_UPGRADE;

  uri.value = route.currentRoute.value.params.document_id;


  if (token.value == null) return;
  if (token.value != "" || token.value != null) {
    hasRole.value = true;
    dashboard.value.setToken(token.value);
    getUserPrints(token.value);
  }
});

onUnmounted(() => {
  removeRecentUpload();
  clearFlag();
  isGuest({ openGuestModal: false });
  removeNotification(false);
  removeDeclineLoader(false);
});
</script>

<style scoped>
.v-lazy-image {
  opacity: 0;
  transform: scale3d(0.3, 0.3, 0.3);
  transition: opacity 0.5s, transform 0.5s;
}

.v-lazy-image-loaded {
  opacity: 1;
  transform: translate3d(0, 0, 0);
}

.fades {
  animation: fadeInOut 0.5s ease-in-out;
}

@keyframes fadeInOut {
  0% {
    opacity: 0;
  }

  50% {
    opacity: 1;
  }
}

.overflow-x-scroll {
  overflow-x: scroll !important;
}

.top-100 {
  top: 115% !important;
}

.custom-position {
  position: fixed;
  /* top: 70px; */
  top: 0;
  left: 0;
  width: 100%;
  height: 60px;
  z-index: 101;
}

.extra__button {
  padding: 1rem 0.5rem;
  width: 35px;
  height: 35px;
  border-radius: 50%;
  background-color: #dbe7ff;
  border: none;
  display: inline-flex;
  align-items: center;
  justify-content: space-between;
}

.header-navbar.floating-nav {
  top: 50px;
}

.header-navbar.navbar-shadow {
  box-shadow: none !important;
}

.dropdown-toggle::after,
.dropup .dropdown-toggle::after {
  vertical-align: 0 !important;
  height: 7px !important;
}

.btn-outline-primary:hover:not(.disabled):not(:disabled) {
  background-color: #003bb3;
  color: #fff;
}

.btn-outline-danger:hover:not(.disabled):not(:disabled) {
  background-color: #ea5455;
  color: #fff;
}

.hover-remove.dropdown-item:focus,
.hover-remove.dropdown-item:hover {
  color: #000;
  background-color: #fff;
}

.dropdown-menu-right {
  right: 0 !important;
  left: -130% !important;
}

.dropdown-menu .hover-remove.dropdown-item {
  cursor: default;
}

.is-center {
  transform: translate3d(-45px, 34px, 0px) !important;
}

.btn-close {
  padding: 0.8rem !important;
  background-color: #fff;
  opacity: 1;
  position: relative;
  cursor: pointer;
}

.ttw_button {
  width: 100%;
  height: 100%;
  display: block;
  padding: 0px !important;
  color: #fff;
  background: #003bb3;
  box-shadow: 0px 0px 0px 1px #003bb3;
  border: 2.5px solid white;
}

.custom-sm {
  display: none;
}

.coming-soon {
  display: inline-block;
  padding: 2px 5px;
  border-radius: 5px;
  font-size: 10px;
  font-weight: 700;
}

::-webkit-scrollbar {
  width: 2px;
  height: 2px;
}

::-webkit-scrollbar-track {
  background: #f1f1f1;
}

::-webkit-scrollbar-thumb {
  background: #888;
}

::-webkit-scrollbar-thumb:hover {
  background: #555;
}

.custom-width {
  display: grid;
  place-items: center;
}

@media screen and (max-width: 991.5px) {
  /* .header-navbar {
    display: none !important;
  } */

  .custom-sm {
    display: block;
  }

  .content-area-wrapper {
    margin-top: 1em !important;
    margin-bottom: 1rem !important;
    /* margin-bottom: 7rem !important; */
  }

  .dropdown-menu-right,
  .header-navbar .navbar-container .show~.dropdown-menu-right {
    left: -180% !important;
  }

  .header-navbar .navbar-container .show~.dropdown-menu-left {
    right: 210px !important;
    left: 12px !important;
    top: 30px !important;
    max-width: 12rem !important;
  }
}

/* @media screen and (max-width: 767.98px) {
  .header-navbar .navbar-container .show~.dropdown-menu-right {
    left: -180% !important;
  }
} */
</style>
