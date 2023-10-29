import { myAxios } from "./helper";
import { privateAxios } from "./helper";

export const loadAllWheelColors = () => {
    return myAxios.get(`/wheels/wheel-color/getAll`)
      .then((response) => response.data);
  };

  export const saveWheelColor = (wheelColorDto) => {
    return privateAxios.post(`/wheels/wheel-color/save`, wheelColorDto)
      .then((response) => response.data);
  };

  export const updateWheelColor = (wheelColorDto) => {
    return privateAxios.put(`/wheels/wheel-color/update`, wheelColorDto)
      .then((response) => response.data);
  };

  export const deleteWheelColor = (wheelColorId) => {
    return privateAxios.delete(`/wheels/wheel-color/delete/${wheelColorId}`)
      .then((response) => response.data);
  };