import { myAxios } from "./helper";
import { privateAxios } from "./helper";

export const loadSme = (smeDto) => {
    return privateAxios.post(`/wheels/flow/sme/get`, smeDto)
      .then((response) => response.data);
  };

  export const saveSme = (smeDto) => {
    return privateAxios.post(`/wheels/flow/sme/save`, smeDto)
      .then((response) => response.data);
  };

  export const updateSme = (smeDto) => {
    return privateAxios.put(`/wheels/flow/sme/update`, smeDto)
      .then((response) => response.data);
  };

  export const deleteSme = (smeId) => {
    return privateAxios.delete(`/wheels/flow/sme/delete/${smeId}`)
      .then((response) => response.data);
  };