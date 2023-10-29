package com.web.appts.services;

import java.util.List;

import com.web.appts.DTO.WheelColorDto;

public interface WheelColorService {

	WheelColorDto createWheelColor(WheelColorDto WheelColorDto);

	WheelColorDto updateWheelColor(WheelColorDto WheelColorDto);

	Boolean deleteWheelColor(Long wheelColorId);

	List<WheelColorDto> getAllWheelColors();
}
