import { myAxios } from "./helper";
import { privateAxios } from "./helper";

export const loadAllWheelMachineSize = () => {
    return myAxios.get(`/wheels/machine-size/getAll`)
      .then((response) => response.data);
  };

  export const saveMachineSize = (wheelMachineSizeDto) => {
    return privateAxios.post(`/wheels/machine-size/save`, wheelMachineSizeDto)
      .then((response) => response.data);
  };

  export const updateMachineSize = (wheelMachineSizeDto) => {
    return privateAxios.put(`/wheels/machine-size/update`, wheelMachineSizeDto)
      .then((response) => response.data);
  };

  export const deleteMachineSize = (wheelMachineSizeId) => {
    return privateAxios.delete(`/wheels/machine-size/delete/${wheelMachineSizeId}`)
      .then((response) => response.data);
  };