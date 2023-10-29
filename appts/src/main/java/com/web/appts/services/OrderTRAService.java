package com.web.appts.services;

import java.util.Map;

import com.web.appts.DTO.OrderTRADto;

public interface OrderTRAService {

	OrderTRADto createOrderTRA(OrderTRADto orderTRADto);

	OrderTRADto updateOrderTRA(OrderTRADto orderTRADto);

	Boolean deleteOrderTRA(Long orderTRAId);

	OrderTRADto getOrderTRA(Long orderTRAId);
	
	Boolean updateOrderTRAColors(String orderTRAIds, Long Id);

	Map<String, OrderTRADto> getAllTraOrders();
	
	byte[] generateTRAPdf(OrderTRADto orderTRADto);
}
