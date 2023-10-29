import { myAxios } from "./helper";
import { privateAxios } from "./helper";

export const loadSpu = (spuDto) => {
    return privateAxios.post(`/wheels/flow/spu/get`, spuDto)
      .then((response) => response.data);
  };

  export const saveSpu = (spuDto) => {
    return privateAxios.post(`/wheels/flow/spu/save`, spuDto)
      .then((response) => response.data);
  };

  export const updateSpu = (spuDto) => {
    return privateAxios.put(`/wheels/flow/spu/update`, spuDto)
      .then((response) => response.data);
  };

  export const deleteSpu = (spuId) => {
    return privateAxios.delete(`/wheels/flow/spu/delete/${spuId}`)
      .then((response) => response.data);
  };