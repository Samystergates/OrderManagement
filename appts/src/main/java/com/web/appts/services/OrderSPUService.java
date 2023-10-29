package com.web.appts.services;

import java.util.List;

import com.web.appts.DTO.OrderSPUDto;

public interface OrderSPUService {
	OrderSPUDto createOrderSPU(OrderSPUDto orderSPUDto);

	OrderSPUDto updateOrderSPU(OrderSPUDto orderSPUDto);

	Boolean deleteOrderSPU(Long orderSPUId);

	OrderSPUDto getOrderSPU(String orderNumber, String prodNumber);
	
	List<OrderSPUDto> getAllSpu();
	
	byte[] generateSPUPdf(String key);
}
