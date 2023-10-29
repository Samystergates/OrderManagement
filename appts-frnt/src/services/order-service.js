import { privateAxios } from "./helper";
import { myAxios } from "./helper";

//get all orders

export const loadAllOrders = () => {
    return myAxios.get(`/index/`)
      .then((response) => response.data);
  };

  export const loadCRMOrders = () => {
    return myAxios.get(`/index/refresh/orders`)
      .then((response) => response.data);
  };

  export const loadOrdersByUsers = (user) => {
    return myAxios.get(`/index/search/`,user)
      .then((response) => response.data);
  };

  export const loadArchivedOrders = () => {
    return myAxios.get(`/archive/`)
      .then((response) => response.data);
  };

  export const updateOrders = (flowUpdate, orderDto) => {
    return privateAxios.put(`/index/update/${flowUpdate}`, orderDto)
      .then((response) => response.data);
  };