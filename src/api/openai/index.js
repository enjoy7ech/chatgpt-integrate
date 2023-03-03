import instance from "../index";

export default {
  listModels() {
    return instance.get("/listModels");
  },
};
