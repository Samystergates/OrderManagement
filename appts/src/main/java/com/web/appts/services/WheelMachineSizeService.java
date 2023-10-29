package com.web.appts.services;

import java.util.List;

import com.web.appts.DTO.WheelMachineSizeDto;

public interface WheelMachineSizeService {

	WheelMachineSizeDto createWheelMachineSize(WheelMachineSizeDto wheelMachineSizeDto);

	List<WheelMachineSizeDto> getAllWheelMachineSize();

	WheelMachineSizeDto updateWheelMachineSize(WheelMachineSizeDto wheelMachineSizeDto);

	Boolean deleteWheelMachineSize(Long wheelMachineSizeId);

}
