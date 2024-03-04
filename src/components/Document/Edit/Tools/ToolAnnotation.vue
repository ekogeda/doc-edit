<!-- eslint-disable vue/valid-v-model -->
<!-- eslint-disable vue/no-mutating-props -->
<template>
  <template
    v-if="profile.id == tool.user_id || owner.isOwner || tool.append_print != null"
  >
    <Vue3DraggableResizable
      v-if="
        tool.append_print == null &&
        !['Textarea', 'Fullname', 'Date'].includes(tool.tool_name)
      "
      :key="tool.id"
      :initH="tool.tool_name == 'Photograph' ? 100 : 30"
      :initW="tool.tool_name == 'Photograph' ? 100 : Number(tool.tool_width)"
      :x="Number(tool.tool_pos_left)"
      :y="Number(tool.tool_pos_top)"
      v-model:w="w"
      v-model:h="h"
      v-model:x="x"
      v-model:y="y"
      v-model:active="active"
      :parent="true"
      :draggable="owner.isOwner"
      :resizable="false"
      @activated="toolActivated({ tool: tool, user: hex })"
      @drag-end="dragEnd($event, tool)"
      class="image-area"
      :class="tool.tool_class"
    >
      <div
        class="h-100"
        :style="{
          'pointer-events': isToolLoading.id == tool.id ? 'none' : '',
          outline:
            '2px solid ' +
            (owner.isOwner && profile.id == tool.user_id
              ? '#28C76F!important'
              : hex.code + '!important'),
        }"
        @click="getUserId(tool)"
      >
        <div
          v-if="tool.tool_name == 'Photograph'"
          :id="`${'userTools-'}` + tool.id"
          class="toNotetip"
        >
          <img src="@/assets/noimage.png" class="img-fluid" alt="Preview" />
          <div
            v-if="isToolLoading.id == tool.id"
            class="grid"
            style="position: absolute; top: 0"
          >
            <span class="spinner-border" role="status"></span>
          </div>
          <span
            v-if="profile.id == tool.user_id"
            class="tooltiptext"
            style="visibility: hidden"
            :style="{
              backgroundColor:
                owner.isOwner && profile.id == tool.user_id
                  ? '#28C76F!important'
                  : hex.code + '!important',
            }"
            >Click me!</span
          >
        </div>
        <div
          v-else
          :id="`${'userTools-'}` + tool.id"
          class="bg-fill toNotetip w-100 h-100 d-flex justify-content-center align-items-center"
        >
          {{ tool.tool_name }} &nbsp;
          <span
            v-if="isToolLoading.id == tool.id"
            class="spinner-border"
            role="status"
          ></span>
          <span
            v-if="profile.id == tool.user_id"
            class="tooltiptext"
            style="visibility: hidden"
            :style="{
              backgroundColor:
                owner.isOwner && profile.id == tool.user_id
                  ? '#28C76F!important'
                  : hex.code + '!important',
            }"
            >{{ tool.tool_name == "Signature" ? "Sign here" : "Click me!" }}</span
          >
        </div>
      </div>

      <template v-if="profile.id == tool.user_id || owner.isOwner == true">
        <div class="drag-me position-relative">
          <DropdownMenu
            v-if="owner.isOwner"
            @editUserTool="getUserId(tool)"
            @deleteTool="remove({ toolId: tool.id })"
            :tool="tool"
            :user="hex"
          />
        </div>
      </template>
      <ParticipantName :userId="tool.user_id" @code="code" />
    </Vue3DraggableResizable>
    <template v-else>
      <template v-if="['Textarea', 'Fullname', 'Date']?.includes(tool.tool_name)">
        <Vue3DraggableResizable
          :initW="Number(tool.tool_width)"
          :initH="Number(tool.tool_height)"
          :minW="95"
          :minH="18"
          :x="Number(tool.tool_pos_left)"
          :y="Number(tool.tool_pos_top)"
          v-model:w="textWidth"
          v-model:h="tool.tool_height"
          :parent="true"
          v-model:x="x"
          v-model:y="y"
          v-model:active="active"
          @drag-end="dragEnd($event, tool)"
          @resize-end="resizeEnd($event, tool)"
          @activated="getUserId(tool)"
          :draggable="owner.isOwner || profile.id == tool.user_id"
          :resizable="profile.id == tool.user_id || owner.isOwner"
          :handles="['tl', 'tr', 'bl', 'br']"
          class="text-wrapper toNotetip z-indexed"
          :id="`${'userTools-'}` + tool.id"
          :data-tool-id="tool.id"
          class-name-active="active-class"
          class-name-dragging="dragging-class"
          class-name-handle="handle-class"
          class-name-resizing="resizing-class"
        >
          <div :id="'tool-' + tool.id" :style="{ height: h + 'px' }">
            <span
              v-if="textValue == '' || textValue == null"
              class="span-text"
              :style="{
                outline:
                  '2px solid ' +
                  (owner.isOwner && profile.id == tool.user_id
                    ? '#28C76F!important'
                    : hex.code + '!important'),
              }"
            >
              {{
                tool.tool_name == "Fullname"
                  ? "Full name"
                  : tool.tool_name == "Date"
                  ? "Date"
                  : "Input text here"
              }}
            </span>
            <template v-else>{{ textValue }}</template>
            <span
              v-if="!tool.signed && profile.id == tool.user_id"
              class="tooltiptext"
              style="visibility: hidden"
              :style="{
                backgroundColor:
                  owner.isOwner && profile.id == tool.user_id
                    ? '#28C76F!important'
                    : hex.code + '!important',
              }"
              >Click me!</span
            >
          </div>

          <template v-if="profile.id == tool.user_id || owner.isOwner == true">
            <div class="drag-me position-relative">
              <DropdownMenu
                @swapUserData="handleToolKitData"
                @editUserTool="onTaskActivated(tool)"
                @deleteTool="remove({ toolId: tool.id })"
                :tool="tool"
                :user="hex"
              />
            </div>
          </template>
          <ParticipantName :userId="tool.user_id" @code="code" />
        </Vue3DraggableResizable>
      </template>
      <Vue3DraggableResizable
        v-else
        :initW="Number(tool.tool_width)"
        :initH="Number(tool.tool_height)"
        :x="Number(tool.tool_pos_left)"
        :y="Number(tool.tool_pos_top)"
        :parent="true"
        v-model:x="x"
        v-model:y="y"
        v-model:w="tool.tool_width"
        v-model:h="h"
        v-model:active="active"
        @drag-end="dragEnd($event, tool)"
        @resize-end="resizeEnd($event, tool)"
        :draggable="owner.isOwner || profile.id == tool.user_id"
        :resizable="profile.id == tool.user_id"
        :lockAspectRatio="
          ['Seal', 'Stamp', 'Photograph', 'Signature', 'Initial'].includes(tool.tool_name)
            ? true
            : false
        "
        :handles="['tl', 'tr', 'bl', 'br']"
        class="image-area"
        class-name-active="active-class"
        class-name-dragging="dragging-class"
        class-name-handle="handle-class"
        class-name-resizing="resizing-class"
      >
        <div class="grid" v-if="isToolLoading.id == tool.id && isToolLoading.active">
          <span class="spinner-border" role="status"></span>
        </div>
        <div v-else :id="`${'userTools-'}` + tool.id" class="toNotetip">
          <div class="grid" v-if="b64 == ''">
            <span class="spinner-border" role="status"></span>
          </div>
          <template v-else>
            <template v-if="tool.append_print.type == 'Camera'">
              <img
                :src="b64"
                @contextmenu.prevent="false"
                class="img-fluid transformed"
              />
            </template>
            <template v-else>
              <img
                :src="b64"
                @contextmenu.prevent="false"
                class="img-fluid"
                style="object-fit: scale-down; height: -webkit-fill-available"
              />
            </template>
          </template>
        </div>

        <template v-if="profile.id == tool.user_id || owner.isOwner == true">
          <span class="drag-me position-relative">
            <DropdownMenu
              @swapUserData="handleToolKitData"
              @editUserTool="getUserId(tool)"
              :appendPrintId="tool.append_print.id"
              @deleteTool="remove({ printId: tool.append_print.id, toolId: tool.id })"
              :tool="tool"
              :user="hex"
            />
          </span>
        </template>
        <ParticipantName :userId="tool.user_id" @code="code" />
      </Vue3DraggableResizable>
    </template>
  </template>

  <!-- <Teleport to="body"> -->
  <ModalComp
    :show="txtModal"
    :header="false"
    :footer="true"
    :size="'modal-sm'"
    :closeBtn="false"
  >
    <template #body>
      <h3 class="modal-title text-darker my-2">
        {{ tool.tool_name == "Date" ? "Date" : "Text" }}
      </h3>

      <div class="row">
        <div class="form-group">
          <template v-if="tool.tool_name == 'Date'">
            <label for="date" class="form-label"> Enter a date</label>
            <input type="date" v-model="textValue" class="form-control" />
          </template>
          <template v-else>
            <label class="form-label">Enter your text</label>
            <textarea
              :style="{
                '--placeholder-color':
                  owner.isOwner && profile.id == tool.user_id ? '#28C76F' : hex.code,
              }"
              v-model="textValue"
              class="textareaTools form-control"
              :id="'text-' + tool.id"
              placeholder="Input text here"
              :disabled="
                comp == 'audit' ? true : tool.user_id != profile.id ? true : false
              "
            ></textarea>
          </template>
        </div>
      </div>
    </template>

    <template #footer>
      <button class="btn btn-sm btn-primary ms-auto" @click="textInput(tool)">
        Done
      </button>
    </template>
  </ModalComp>
  <!-- </Teleport> -->

  <Teleport to="body">
    <ModalComp
      :show="affixModal"
      :header="false"
      :footer="false"
      :size="'modal-md'"
      @close="affixModal = false"
    >
      <template #body>
        <h3 class="modal-title text-darker my-2">Signature box</h3>
        <SignaturePrintFull
          @selectedSignature="savePrint"
          @closeModal="affixModal = false"
        />
      </template>
    </ModalComp>
  </Teleport>

  <Teleport to="body">
    <ModalComp
      :show="initialModal"
      :header="false"
      :footer="false"
      :size="'modal-md'"
      @close="initialModal = false"
    >
      <template #body>
        <h3 class="modal-title text-darker my-2">Initial</h3>

        <SignaturePrintInitial
          @selectedSignature="savePrint"
          @closeModal="initialModal = false"
        />
      </template>
    </ModalComp>
  </Teleport>

  <Teleport to="body">
    <ModalComp
      :show="sealModal"
      :header="false"
      :footer="false"
      :size="'modal-md'"
      @close="sealModal = false"
    >
      <template #body>
        <h3 class="modal-title text-darker my-2">Seal box</h3>

        <SealAppend @close="sealModal = false" @selectedSeal="savePrint" />
      </template>
    </ModalComp>
  </Teleport>

  <Teleport to="body">
    <ModalComp
      :show="stampModal"
      :header="false"
      :footer="false"
      :size="'modal-md'"
      @close="stampModal = false"
    >
      <template #body>
        <h3 class="modal-title text-darker my-2">Stamp box</h3>

        <StampAppend @close="stampModal = false" @selectedStamp="savePrint" />
      </template>
    </ModalComp>
  </Teleport>

  <Teleport to="body">
    <ModalComp
      :show="uploadImage"
      :header="false"
      :footer="false"
      :size="'modal-lg'"
      @close="uploadImage = false"
    >
      <template #body>
        <h3 class="modal-title text-darker my-2">Image</h3>

        <PassportPhotograph
          @closeInitialModal="closeUploadImage"
          @close="uploadImage = false"
          @selectedPassport="savePrint"
        />
      </template>
    </ModalComp>
  </Teleport>
</template>

<script setup>
import ModalComp from "@/components/ModalComp.vue";
import SealAppend from "@/components/Notary/Seal/SealAppend.vue";
import StampAppend from "@/components/Notary/Stamp/StampAppend.vue";
import SignaturePrintFull from "@/components/Signature/SignaturePrintFull.vue";
import SignaturePrintInitial from "@/components/Signature/SignaturePrintInitial.vue";
import PassportPhotograph from "@/components/Passport/PassportPhotograph.vue";
import DropdownMenu from "@/components/DropdownMenu.vue";
import ParticipantName from "@/components/Document/Edit/ParticipantName.vue";

import moment from "moment";
import { ref, defineProps, watch, onMounted } from "vue";
import { useActions, useGetters } from "vuex-composition-helpers/dist";
import { useToast } from "vue-toast-notification";
import { useDragResizeComposable } from "@/composables/useDragResize";
import { useConvertToBase64Composable } from "@/composables/useDataURL";
const { dragEnd, resizeEnd } = useDragResizeComposable();
import { useRouter } from "vue-router";

const route = useRouter();

const { toBase64 } = useConvertToBase64Composable();

const toast = useToast();
const props = defineProps({ tool: Object, owner: Object, comp: String });

const { profile, isToolLoading, workingTools } = useGetters({
  profile: "auth/profile",
  isToolLoading: "document/isToolLoading",
  workingTools: "document/workingTools",
  isLoading: "document/isLoading",
});

const { editTools, removeTool, activatedTool } = useActions({
  editTools: "document/editTools",
  removeTool: "document/removeTool",
  activatedTool: "document/activatedTool",
});

const hex = ref("");
const b64 = ref("");
const code = (params) => (hex.value = params);

const closeUploadImage = () => {
  uploadImage.value = false;
  setTimeout(() => (uploadImage.value = true), 200);
};

watch(
  () => props.tool,
  (newTool, oldTool) => {
    if (newTool != oldTool) {
      textValue.value = newTool.value;
      w.value = textWidth.value = Number(newTool.tool_width);
      h.value = textHeight.value = Number(newTool.tool_height);
      if (newTool.append_print != null) {
        toBase64(newTool.append_print.file, (dataUrl) => {
          if (dataUrl != "") b64.value = dataUrl;
        });
      }
    }
  },
  { deep: true }
);

const toolKit = ref({});
const handleToolKitData = (params) => {
  toolKit.value = params;
  const swapUserObj = {
    category: "",
    document_upload_id: props.tool.document_upload_id,
    document_id: uri.value,
    tool_class: props.tool.tool_class,
    tool_height: props.tool.tool_height,
    tool_name: props.tool.tool_name,
    tool_pos_left: props.tool.tool_pos_left,
    tool_pos_top: props.tool.tool_pos_top,
    tool_width: props.tool.tool_width,
    type: "",
    user_id: toolKit.value.userId,
    value: props.tool.tool_name == "Fullname" ? toolKit.value.userFullName : "",
  };

  editTools({ id: props.tool.id, payload: swapUserObj });
};

const x = ref(Number(props.tool.tool_pos_left));
const y = ref(Number(props.tool.tool_pos_top));
const w = ref(Number(props.tool.tool_width));
const h = ref(Number(props.tool.tool_height));
const active = ref(false);

// const documentId = ref(null);
const txtModal = ref(false);
const sealModal = ref(false);
const stampModal = ref(false);
const initialModal = ref(false);
const affixModal = ref(false);
const uploadImage = ref(false);
const toolId = ref(null);
const uri = ref("");

const onTaskActivated = (params) => {
  if (params.user_id != profile.value.id) {
    return toast.error("Sorry, you cannot type here", {
      timeout: 5000,
      position: "top-right",
    });
  }
  txtModal.value = true;
  setTimeout(() => {
    if (props.tool.tool_name != "Date") autoResize.init(params.id);
  }, 500);
};

const toolActivated = (params) => activatedTool(params);

const getUserId = (params) => {
  if (props.comp == "audit") return;
  const toaster = (message) => {
    toast.error(message, {
      timeout: 5000,
      position: "top-right",
    });
  };

  if (params.user_id != profile.value.id) {
    if (params.tool_name == "Signature" || params.tool_name == "Initial")
      return toaster("Sorry, you are not permitted to sign here");
    if (params.tool_name == "Seal") return toaster("Sorry, you cannot upload this seal");
    if (params.tool_name == "Stamp")
      return toaster("Sorry, you cannot upload this stamp");
    if (params.tool_name == "Photograph")
      return toaster("Sorry, you cannot upload this passport");
  }

  if (params.tool_name == "Seal") sealModal.value = true;
  if (params.tool_name == "Stamp") stampModal.value = true;
  if (params.tool_name == "Initial") initialModal.value = true;
  if (params.tool_name == "Signature") affixModal.value = true;
  if (params.tool_name == "Photograph") uploadImage.value = true;

  // documentId.value = params.document_upload_id;
  toolId.value = params.id;
};

const textValue = ref("");

const textHeight = ref(18);
const textInput = (params) => {
  txtModal.value = false;
  const data = {
    append_print_id: null,
    category: "Type",
    document_upload_id: params.document_upload_id,
    document_id: uri.value,
    tool_class: props.tool.tool_class,
    tool_height: textHeight.value.toString(),
    tool_name: props.tool.tool_name,
    tool_pos_left: props.tool.tool_pos_left,
    tool_pos_top: props.tool.tool_pos_top,
    tool_width: textWidth.value.toString(),
    type: "Text",
    user_id: props.tool.user_id,
    value:
      props.tool.tool_name == "Date"
        ? moment(textValue.value).format("DD-MM-YYYY")
        : textValue.value,
  };

  editTools({ id: params.id, payload: data });
};

const savePrint = (params) => {
  const dataObj = {
    append_print_id: params.append_print_id,
    append_print: {
      category: params.category,
      file: params.file,
      id: params.append_print_id,
      type: params.type,
      user_id: props.tool.user_id,
    },
    category: params.category,
    document_upload_id: props.tool.document_upload_id,
    document_id: uri.value,
    tool_class: params.tool_class,
    tool_height: params.tool_height,
    tool_name: params.tool_name,
    tool_pos_left: props.tool.tool_pos_left,
    tool_pos_top: props.tool.tool_pos_top,
    tool_width: params.tool_width,
    type: params.type,
    user_id: props.tool.user_id,
    value: "",
  };

  if (params.is_auto_fill) {
    workingTools.value.map((item) => {
      if (item.tool_name === params.tool_name && profile.value.id === item.user_id) {
        dataObj.tool_pos_left = item.tool_pos_left;
        dataObj.tool_pos_top = item.tool_pos_top;
        (dataObj.document_upload_id = item.document_upload_id),
          editTools({ id: item.id, payload: dataObj });
      }
    });
  } else {
    editTools({ id: toolId.value, payload: dataObj });
  }
};

const remove = (params) => removeTool(params);

const textWidth = ref(110);
const autoResize = {
  minWidth: 95,
  maxWidth: 600,
  buffer: 50,

  resize: function (el) {
    const test = document.createElement("pre");
    test.className = "input-test";
    test.innerHTML = el.value;
    el.parentNode.appendChild(test);

    let numberOfLineBreaks = (el.value.match(/\n/g) || []).length;
    // min - height + lines x line - height + padding + border
    let newHeight = 12 + numberOfLineBreaks * 26 + 12 + 2;

    const calculatedWidth = Math.min(test.offsetWidth + this.buffer, this.maxWidth);
    // el.style.width = calculatedWidth + "px";
    textWidth.value = calculatedWidth;

    const calculatedHeight = el.scrollHeight < 26 ? newHeight : el.scrollHeight;
    el.style.height = calculatedHeight + "px";

    el.parentNode.removeChild(test);
  },

  init: function (id) {
    // let el = document.getElementsByClassName("textareaTools")
    let el = document.getElementById("text-" + id);
    let tl = document.getElementById("tool-" + id);
    el.addEventListener(
      "keydown",
      function () {
        autoResize.resize(this);
        textHeight.value = tl.clientHeight;
      },
      false
    );

    el.addEventListener(
      "keyup",
      function () {
        autoResize.resize(this);
        textHeight.value = tl.clientHeight;
      },
      false
    );

    this.resize(el);

    // while (i--) {
    //   els[i].addEventListener(
    //     "keydown",
    //     function () {
    //       autoResize.resize(this);
    //     },
    //     false
    //   );

    //   els[i].addEventListener(
    //     "keyup",
    //     function () {
    //       autoResize.resize(this);
    //     },
    //     false
    //   );

    //   this.resize(els[i]);
    // }
  },
};

onMounted(() => {
  uri.value = route.currentRoute.value.params.document_id;
  activatedTool(null);
  // autoResize.init();

  if (props.tool.append_print != null) {
    textWidth.value = Number(props.tool.tool_width);
    textHeight.value = Number(props.tool.tool_height);
    if (props.tool.append_print != null) {
      toBase64(props.tool.append_print.file, (dataUrl) => {
        if (dataUrl != "") b64.value = dataUrl;
      });
    }
  } else {
    if (["Textarea", "Fullname", "Date"].includes(props.tool.tool_name)) {
      textValue.value = props.tool.value;
    }
  }
});
</script>

<style>
.input-test {
  display: inline;
  visibility: hidden;
}
</style>

<style scoped>
textarea::-webkit-input-placeholder {
  color: var(--placeholder-color);
}

textarea:-moz-placeholder {
  color: var(--placeholder-color);
}

textarea::-moz-placeholder {
  color: var(--placeholder-color);
}

textarea:-ms-input-placeholder {
  color: var(--placeholder-color);
}

.centralized {
  display: flex;
  align-items: center;
  justify-content: center;
  height: inherit;
}

.toNotetip .tooltiptext {
  /* visibility: hidden; Show the tooltip by default */
  width: 95px;
  background-color: #333;
  color: #fff;
  text-align: center;
  border-radius: 6px;
  padding: 5px;
  font-weight: normal;
  position: absolute;
  z-index: 1;
  top: 120%;
  left: 50%;
  transform: translateX(-50%);
  opacity: 0;
  animation: tooltipPop 1s ease-in-out infinite;
  /* Continuous animation to draw attention */
}

/* Arrow for the tooltip */
/* .toNotetip .tooltiptext::after {
  content: "";
  position: absolute;
  bottom: 100%;
  left: 50%;
  margin-left: -5px;
  border-width: 5px;
  border-style: solid;
  border-color: transparent transparent #333 transparent;
} */

/* Keyframes for the tooltip animation */
@keyframes tooltipPop {
  0%,
  100% {
    opacity: 0;
    transform: translateX(-50%) scale(0.8);
  }

  50% {
    opacity: 1;
    transform: translateX(-50%) scale(1.1);
  }
}

.span-text {
  display: block;
  font-weight: 500;
  color: #000 !important;
  /* padding: 1px 0; */
  /* line-height: 1.5; */
}

.task-inactive {
  position: absolute;
}

.z-indexed {
  z-index: 1;
}

.transformed {
  object-fit: scale-down;
  -webkit-transform: scaleX(-1);
  transform: scaleX(-1);
  height: -webkit-fill-available;
  padding-bottom: 3px;
}

.btn:focus,
.btn-xs:focus,
.btn-outline-primary:focus {
  outline: none !important;
  box-shadow: none !important;
}

.dropdown-menu {
  margin-top: 0 !important;
}

.grid {
  width: 100%;
  height: 100%;
  display: grid;
  place-items: center;
}

.spinner-border {
  width: 1rem;
  height: 1rem;
  font-size: 12px;
}
</style>
