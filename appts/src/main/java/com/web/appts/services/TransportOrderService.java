package com.web.appts.services;

import java.util.List;

import com.web.appts.DTO.DriverInfoDto;
import com.web.appts.DTO.RouteInfoDto;
import com.web.appts.DTO.TrailerInfoDto;
import com.web.appts.DTO.TruckInfoDto;

public interface TransportOrderService {

	 List<RouteInfoDto> getAllRoutes();
	 List<DriverInfoDto> getAllDrivers();
	 List<TrailerInfoDto> getAllTrailers();
	 List<TruckInfoDto> getAllTrucks();
	
}
