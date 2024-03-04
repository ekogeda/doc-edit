import Api from "./Api";

const END_POINT = "prints";

const PRINT_DEFAULT = "prints-set-default";

export default {
  all(token) {
    return Api.get(`${END_POINT}`, token);
  },

  show(id) {
    return Api.get(`${END_POINT}/${id}`);
  },

  defaultPrint(id) {
    return Api.get(`${PRINT_DEFAULT}/${id}`);
  },

  store(data) {
    return Api.post(END_POINT, data);
  },

  update(data) {
    return Api.put(`${END_POINT}/${data.id}`, data.payload);
  },

  deletePrint(printId) {
    return Api.delete(`${END_POINT}/${printId}`);
  },
};

