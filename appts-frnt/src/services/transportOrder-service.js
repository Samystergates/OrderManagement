import { myAxios } from "./helper";

import { privateAxios } from "./helper";

export const loadAllRoutes = () => {
    return myAxios.get(`/transport/routes`)
      .then((response) => response.data);
  };

  export const loadAllDrivers = () => {
    return myAxios.get(`/transport/drivers`)
      .then((response) => response.data);
  };

  export const loadAllTrucks = () => {
    return myAxios.get(`/transport/trucks`)
      .then((response) => response.data);
  };

  export const loadAllTrailers = () => {
    return myAxios.get(`/transport/trailers`)
      .then((response) => response.data);
  };

  export const loadAllTraOrders = () => {
    return myAxios.get(`/transport/route/orders`)
      .then((response) => response.data);
  };

  export const loadTra = (traId) => {
    return myAxios.get(`/transport/route/order/${traId}`)
      .then((response) => response.data);
  };

  export const saveTra = (traDto) => {
    return privateAxios.post(`/transport/route/orders/save`, traDto)
      .then((response) => response.data);
  };

  export const updateTra = (traDto) => {
    return privateAxios.put(`/transport/route/orders/update`, traDto)
      .then((response) => response.data);
  };

  export const updateTraColors = (traIds, entryId) => {
    return privateAxios.put(`/transport/route/orders/save/colors/${entryId}`, traIds)
      .then((response) => response.data);
  };

  export const deleteTra = (traId) => {
    return privateAxios.delete(`/transport/route/orders/delete/${traId}`)
      .then((response) => response.data);
  };