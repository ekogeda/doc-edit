import { ref } from "vue";

export const dashboard = ref({
  token: null,
  status: 'New',
  canComplete: false,
  plan: '',
  image: null,
  isOpened: false,
  annotationData: null,
  isLoadTable: false,

  setToken(value) { this.token = value },
  setStatus(value) { this.status = value },
  setCanComplete(value) { this.canComplete = value }, 
  setIsOpened(value) { this.isOpened = value },
  setPlan(value) { this.plan = value },
  setAvatar(value) { this.image = value },
  setAnnotationData(value) { this.annotationData = value },
  setIsLoadTable(value) { this.isLoadTable = value; },
})