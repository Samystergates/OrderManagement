package com.web.appts.services.imp;

import java.util.ArrayList;
import java.util.List;
import java.util.stream.Collectors;

import org.modelmapper.ModelMapper;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import com.web.appts.DTO.WheelColorDto;
import com.web.appts.DTO.WheelMachineSizeDto;
import com.web.appts.entities.WheelColor;
import com.web.appts.entities.WheelMachineSize;
import com.web.appts.exceptions.ResourceNotFoundException;
import com.web.appts.repositories.WheelColorRepo;
import com.web.appts.repositories.WheelMachineSizeRepo;
import com.web.appts.services.WheelColorService;
import com.web.appts.services.WheelMachineSizeService;

@Service
public class WheelServices implements WheelMachineSizeService, WheelColorService {

	@Autowired
	WheelColorRepo wheelColorRepo;
	@Autowired
	WheelMachineSizeRepo wheelMachineSizeRepo;
	@Autowired
	private ModelMapper modelMapper;

	List<WheelMachineSizeDto> machineList = new ArrayList<>();
	List<WheelColorDto> colorList = new ArrayList<>();

	@Override
	public WheelMachineSizeDto createWheelMachineSize(WheelMachineSizeDto wheelMachineSizeDto) {
		WheelMachineSize wheelMachineSize = dtoToMachine(wheelMachineSizeDto);
		WheelMachineSize savedWheelMachineSize = (WheelMachineSize) this.wheelMachineSizeRepo.save(wheelMachineSize);
		if (!machineList.isEmpty()) {
			boolean idExists = machineList.stream().anyMatch(size -> size.getId() == savedWheelMachineSize.getId());
			if (!idExists) {
				machineList.add(machineToDto(savedWheelMachineSize));
			}
		}
		return machineToDto(savedWheelMachineSize);
	}

	@Override
	public WheelMachineSizeDto updateWheelMachineSize(WheelMachineSizeDto wheelMachineSizeDto) {
		WheelMachineSize wheelMachineSize = dtoToMachine(wheelMachineSizeDto);
		WheelMachineSize savedWheelMachineSize = (WheelMachineSize) this.wheelMachineSizeRepo.save(wheelMachineSize);
		List<WheelMachineSizeDto> filteredList = machineList.stream()
				.filter(size -> size.getId() != wheelMachineSizeDto.getId()).collect(Collectors.toList());
		machineList.clear();
		machineList.addAll(filteredList);
		machineList.add(machineToDto(savedWheelMachineSize));
		return machineToDto(savedWheelMachineSize);
	}

	@Override
	public Boolean deleteWheelMachineSize(Long wheelMachineSizeId) {
		WheelMachineSize wheelMachineSize = this.wheelMachineSizeRepo.findById(wheelMachineSizeId).orElseThrow(
				() -> new ResourceNotFoundException("wheelMachineSize", "id", wheelMachineSizeId.intValue()));
		wheelMachineSizeRepo.delete(wheelMachineSize);
		List<WheelMachineSizeDto> filteredList = machineList.stream().filter(size -> size.getId() != wheelMachineSizeId)
				.collect(Collectors.toList());
		machineList.clear();
		machineList.addAll(filteredList);
		return true;
	}

	@Override
	public List<WheelMachineSizeDto> getAllWheelMachineSize() {

		if (this.machineList.isEmpty()) {
			List<WheelMachineSize> allMachines = this.wheelMachineSizeRepo.findAll();

			if (allMachines.isEmpty() || allMachines == null) {
				return null;
			}
			machineList = allMachines.stream().map(machine -> machineToDto(machine)).collect(Collectors.toList());
		}
		return this.machineList;
	}

	@Override
	public WheelColorDto createWheelColor(WheelColorDto wheelColorDto) {
		WheelColor wheelColor = dtoToColor(wheelColorDto);
		WheelColor savedWheelColor = (WheelColor) this.wheelColorRepo.save(wheelColor);
		if (!colorList.isEmpty()) {
			boolean idExists = colorList.stream().anyMatch(color -> color.getId() == wheelColorDto.getId());
			if (!idExists) {
				colorList.add(colorToDto(savedWheelColor));
			}
		}
		return colorToDto(savedWheelColor);

	}

	@Override
	public WheelColorDto updateWheelColor(WheelColorDto wheelColorDto) {
		WheelColor wheelColor = dtoToColor(wheelColorDto);
		WheelColor savedWheelColor = (WheelColor) this.wheelColorRepo.save(wheelColor);
		List<WheelColorDto> filteredList = colorList.stream().filter(color -> color.getId() != wheelColorDto.getId())
				.collect(Collectors.toList());
		colorList.clear();
		colorList.addAll(filteredList);
		colorList.add(colorToDto(savedWheelColor));
		return colorToDto(savedWheelColor);
	}

	@Override
	public Boolean deleteWheelColor(Long wheelColorId) {
		WheelColor wheelColor = this.wheelColorRepo.findById(wheelColorId)
				.orElseThrow(() -> new ResourceNotFoundException("WheelColor", "id", wheelColorId.intValue()));
		wheelColorRepo.delete(wheelColor);
		List<WheelColorDto> filteredList = colorList.stream().filter(color -> color.getId() != wheelColorId)
				.collect(Collectors.toList());
		colorList.clear();
		colorList.addAll(filteredList);
		return true;
	}

	@Override
	public List<WheelColorDto> getAllWheelColors() {

		if (this.colorList.isEmpty()) {
			List<WheelColor> allColors = this.wheelColorRepo.findAll();

			if (allColors.isEmpty() || allColors == null) {
				return null;
			}
			colorList = allColors.stream().map(color -> colorToDto(color)).collect(Collectors.toList());
		}
		return this.colorList;
	}

	public WheelMachineSize dtoToMachine(WheelMachineSizeDto wheelMachineSizeDto) {
		WheelMachineSize wheelMachineSize = (WheelMachineSize) this.modelMapper.map(wheelMachineSizeDto,
				WheelMachineSize.class);
		return wheelMachineSize;
	}

	public WheelMachineSizeDto machineToDto(WheelMachineSize wheelMachineSize) {
		WheelMachineSizeDto wheelMachineSizeDto = (WheelMachineSizeDto) this.modelMapper.map(wheelMachineSize,
				WheelMachineSizeDto.class);
		return wheelMachineSizeDto;
	}

	public WheelColor dtoToColor(WheelColorDto wheelColorDto) {
		WheelColor WheelColor = (WheelColor) this.modelMapper.map(wheelColorDto, WheelColor.class);
		return WheelColor;
	}

	public WheelColorDto colorToDto(WheelColor wheelColor) {
		WheelColorDto wheelColorDto = (WheelColorDto) this.modelMapper.map(wheelColor, WheelColorDto.class);
		return wheelColorDto;
	}
}
