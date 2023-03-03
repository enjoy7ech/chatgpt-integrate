import axios from "axios";
import qs from "qs";

const instance = axios.create({
  baseURL: "http://144.34.183.196:3000",
});

// 统一添加时间戳，解决IE缓存问题
instance.interceptors.request.use(
  function (config) {
    const { apiKey } = qs.parse(location.search.slice(1));
    if (!apiKey) {
      return Promise.reject({
        message: "apiKey not found",
      });
    }
    config.headers.token = apiKey;

    return config;
  },
  (error) => {
    return Promise.reject(error.response);
  }
);

// 错误处理
instance.interceptors.response.use(
  function (response) {
    return response.data;
  },
  (error) => {
    return Promise.reject(error.response);
  }
);

export default instance;
