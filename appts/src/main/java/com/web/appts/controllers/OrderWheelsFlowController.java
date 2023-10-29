package com.web.appts.controllers;

import java.util.List;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.web.appts.DTO.OrderSMEDto;
import com.web.appts.DTO.OrderSPUDto;
import com.web.appts.services.OrderSMEService;
import com.web.appts.services.OrderSPUService;

@RestController
@RequestMapping({ "/api/wheels/flow" })
@CrossOrigin
public class OrderWheelsFlowController {

	@Autowired
	OrderSPUService orderSPUService;

	@Autowired
	OrderSMEService orderSMEService;

	@PostMapping({ "/sme/save" })
	public ResponseEntity<OrderSMEDto> saveOrderSME(@RequestBody OrderSMEDto orderSMEDto) {
		OrderSMEDto orderSMEDtoReturn = this.orderSMEService.createOrderSME(orderSMEDto);
		return new ResponseEntity<OrderSMEDto>(orderSMEDtoReturn, HttpStatus.CREATED);
	}

	@PutMapping({ "/sme/update" })
	public ResponseEntity<OrderSMEDto> updateOrderSME(@RequestBody OrderSMEDto orderSMEDto) {
		OrderSMEDto orderSMEDtoReturn = this.orderSMEService.updateOrderSME(orderSMEDto);
		return new ResponseEntity<OrderSMEDto>(orderSMEDtoReturn, HttpStatus.CREATED);
	}

	@PostMapping({ "/sme/get" })
	public ResponseEntity<OrderSMEDto> getOrderSME(@RequestBody OrderSMEDto orderSMEDto) {
		OrderSMEDto orderSMEDtoReturn = this.orderSMEService.getOrderSME(orderSMEDto.getOrderNumber(),
				orderSMEDto.getProdNumber());
		if (orderSMEDtoReturn == null) {
			orderSMEDtoReturn = orderSMEDto;
		}
		return ResponseEntity.ok(orderSMEDtoReturn);
	}

	@DeleteMapping({ "/sme/delete/{smeId}" })
	public ResponseEntity<Boolean> deleteOrderSME(@PathVariable("smeId") Long smeId) {
		Boolean isDeleted = this.orderSMEService.deleteOrderSME(smeId);
		return new ResponseEntity<Boolean>(isDeleted, HttpStatus.OK);
	}

	@GetMapping({ "/sme/getAll" })
	public ResponseEntity<List<OrderSMEDto>> getSMEOrders() {
		List<OrderSMEDto> smeList = this.orderSMEService.getAllSme();
		return ResponseEntity.ok(smeList);
	}

	@GetMapping({ "/spu/getAll" })
	public ResponseEntity<List<OrderSPUDto>> getSPUOrders() {
		List<OrderSPUDto> spuList = this.orderSPUService.getAllSpu();
		return ResponseEntity.ok(spuList);
	}

	@GetMapping("/spu/printPdf/{key}")
	public ResponseEntity<byte[]> generateSpuPdf(@PathVariable("key") String key) {

		byte[] pdfBytes = this.orderSPUService.generateSPUPdf(key);

		HttpHeaders headers = new HttpHeaders();
		headers.setContentType(MediaType.APPLICATION_PDF);
		headers.setContentDispositionFormData("attachment", "orderMon.pdf");
		headers.setContentLength(pdfBytes.length);

		return new ResponseEntity<>(pdfBytes, headers, 200);
	}

	@GetMapping("/sme/printPdf/{key}")
	public ResponseEntity<byte[]> generateMonSmePdf(@PathVariable("key") String key) {

		byte[] pdfBytes = this.orderSMEService.generateSMEPdf(key);

		HttpHeaders headers = new HttpHeaders();
		headers.setContentType(MediaType.APPLICATION_PDF);
		headers.setContentDispositionFormData("attachment", "orderMon.pdf");
		headers.setContentLength(pdfBytes.length);

		return new ResponseEntity<>(pdfBytes, headers, 200);
	}

	@PostMapping({ "/spu/save" })
	public ResponseEntity<OrderSPUDto> saveOrderSPU(@RequestBody OrderSPUDto orderSPUDto) {
		OrderSPUDto orderSPUDtoReturn = this.orderSPUService.createOrderSPU(orderSPUDto);
		return new ResponseEntity<OrderSPUDto>(orderSPUDtoReturn, HttpStatus.CREATED);
	}

	@PutMapping({ "/spu/update" })
	public ResponseEntity<OrderSPUDto> updateOrderSPU(@RequestBody OrderSPUDto orderSPUDto) {
		OrderSPUDto orderSPUDtoReturn = this.orderSPUService.updateOrderSPU(orderSPUDto);
		return new ResponseEntity<OrderSPUDto>(orderSPUDtoReturn, HttpStatus.CREATED);
	}

	@PostMapping({ "/spu/get" })
	public ResponseEntity<OrderSPUDto> getOrderSPU(@RequestBody OrderSPUDto orderSPUDto) {
		OrderSPUDto orderSPUDtoReturn = this.orderSPUService.getOrderSPU(orderSPUDto.getOrderNumber(),
				orderSPUDto.getProdNumber());
		if (orderSPUDtoReturn == null) {
			orderSPUDtoReturn = orderSPUDto;
		}
		return ResponseEntity.ok(orderSPUDtoReturn);
	}

	@DeleteMapping({ "/spu/delete/{spuId}" })
	public ResponseEntity<Boolean> deleteOrderSPU(@PathVariable("spuId") Long spuId) {
		Boolean isDeleted = this.orderSPUService.deleteOrderSPU(spuId);
		return new ResponseEntity<Boolean>(isDeleted, HttpStatus.OK);
	}

}
