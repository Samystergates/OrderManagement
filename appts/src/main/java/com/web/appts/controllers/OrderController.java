package com.web.appts.controllers;

import com.web.appts.DTO.OrderDto;
import com.web.appts.services.OrderService;
import java.text.DateFormat;
import java.text.ParseException;
import java.text.SimpleDateFormat;
import java.util.Comparator;
import java.util.Date;
import java.util.List;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping({ "/api/index", "/api/home" })
@CrossOrigin
public class OrderController {
    @Autowired
    private OrderService orderService;
    @Autowired
    private SimpMessagingTemplate messagingTemplate;
    
    @GetMapping({ "", "/" })
    public ResponseEntity<List<OrderDto>> getOrders() {
        List<OrderDto> orderDto = this.orderService.getAllOrders();
        sortUsingDate(orderDto);
        return ResponseEntity.ok(orderDto);
    }

    @GetMapping({ "/refresh/orders" })
    public ResponseEntity<List<OrderDto>> getCrmOrders() {
    	List<OrderDto> orderDto;
    	orderDto = this.orderService.checkMap();
    	if(orderDto == null) {
        orderDto = this.orderService.getCRMOrders();
    	}
        sortUsingDate(orderDto);
        return ResponseEntity.ok(orderDto);
    }

    @GetMapping({ "/search/{userName}" })
    public ResponseEntity<List<OrderDto>> getOrdersByUser(@PathVariable("userName") String userName) {
        List<OrderDto> orderDto = this.orderService.getOrdersByUser(userName);
        sortUsingDate(orderDto);
        return ResponseEntity.ok(orderDto);
    }

    @PutMapping({ "/update/{flowUpdate}" })
    public ResponseEntity<List<OrderDto>> updatingOrder(@RequestBody OrderDto orderDto, @PathVariable("flowUpdate") Boolean flowUpdate) {
    	System.out.println(orderDto+" "+flowUpdate);
        List<OrderDto> updatedOrders = orderService.updateOrder(orderDto, orderDto.getId(), flowUpdate);
        sortUsingDate(updatedOrders);
        messagingTemplate.convertAndSend("/topic/orderUpdate", updatedOrders);
        return ResponseEntity.ok(updatedOrders);
    }

    private void sortUsingDate(List<OrderDto> orderDto) {
        //DateFormat dateFormat = new SimpleDateFormat("yyyy-MM-dd");
        DateFormat dateFormat = new SimpleDateFormat("MM/dd/yyyy");
//        orderDto.sort(Comparator.comparing(OrderDto::getDeliveryDate, (date1, date2) -> {
//            try {
//                Date parsedDate1 = dateFormat.parse(date1);
//                Date parsedDate2 = dateFormat.parse(date2);
//                return parsedDate2.compareTo(parsedDate1);
//            } catch (ParseException e) {
//                e.printStackTrace();
//                return 0;
//            }
//        }));
        
        
        orderDto.sort(Comparator.comparing((OrderDto order) -> {
            String deliveryDate = order.getDeliveryDate();
            return deliveryDate.isEmpty() ? order.getCreationDate() : deliveryDate;
        }, (date1, date2) -> {
            try {
                Date parsedDate1 = dateFormat.parse(date1);
                Date parsedDate2 = dateFormat.parse(date2);
                return parsedDate2.compareTo(parsedDate1);
            } catch (ParseException e) {
                e.printStackTrace();
                return 0;
            }
        }));
    }
}