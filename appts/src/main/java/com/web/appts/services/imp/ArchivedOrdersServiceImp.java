package com.web.appts.services.imp;

import com.web.appts.DTO.ArchivedOrdersDto;
import com.web.appts.DTO.OrderDto;
import com.web.appts.entities.ArchivedOrders;
import com.web.appts.exceptions.ResourceNotFoundException;
import com.web.appts.repositories.ArchivedOrderRepo;
import com.web.appts.services.ArchivedOrdersService;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;
import org.modelmapper.ModelMapper;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

@Service
public class ArchivedOrdersServiceImp implements ArchivedOrdersService {

  Map<String, ArchivedOrdersDto> archivedOrdersMap = new HashMap<>();

  List<ArchivedOrdersDto> archivedOrderDtoList;

  String lastOrder;

  @Autowired
  private ModelMapper modelMapper;
  @Autowired
  private ArchivedOrderRepo archivedOrdersRepo;

  public Boolean createArchivedOrder(OrderDto orderDto) {
    ArchivedOrders archivedOrder = orderDtoToArchivedOrder(orderDto);
    ArchivedOrders savedArchivedOrder = (ArchivedOrders) this.archivedOrdersRepo.save(archivedOrder);
    ArchivedOrdersDto archivedOrdersDto = archivedOrderToDto(archivedOrder);
    this.archivedOrdersMap.put(orderDto.getOrderNumber() + "," + orderDto.getProduct(), archivedOrdersDto);
    return Boolean.valueOf((savedArchivedOrder != null));
  }

  public ArchivedOrdersDto getArchivedOrderById(Long orderId) {
    ArchivedOrders order = (ArchivedOrders) this.archivedOrdersRepo.findById(orderId)
        .orElseThrow(() -> new ResourceNotFoundException("User", "id", orderId.intValue()));
    return archivedOrderToDto(order);
  }

  public List<ArchivedOrdersDto> getArchivedOrdersByUser(String user) {
    if (this.archivedOrdersMap.isEmpty()) {
      List<ArchivedOrders> archivedOrdersByUser = this.archivedOrdersRepo.findByUser(user);

      List<ArchivedOrdersDto> archivedOrderDtos = (List<ArchivedOrdersDto>) archivedOrdersByUser
          .stream().map(order -> archivedOrderToDto(order)).collect(Collectors.toList());
      if (archivedOrderDtos.isEmpty() || archivedOrderDtos == null) {
        return new ArrayList<>();
      }
      return archivedOrderDtos;
    }
    this.archivedOrderDtoList = new ArrayList<>();
    for (Map.Entry<String, ArchivedOrdersDto> entry : this.archivedOrdersMap.entrySet()) {
      if (((ArchivedOrdersDto) entry.getValue()).getUser().equals(user)) {
        ArchivedOrdersDto archivedOrdersDto = entry.getValue();
        this.archivedOrderDtoList.add(archivedOrdersDto);
      }
    }

    return this.archivedOrderDtoList;
  }

  public List<ArchivedOrdersDto> getAllArchivedOrders() {
    if (this.archivedOrdersMap.isEmpty()) {
      List<ArchivedOrders> allArchivedOrders = this.archivedOrdersRepo.findAll();
      if (allArchivedOrders.isEmpty() || allArchivedOrders == null) {
        return new ArrayList<>();
      }

      List<ArchivedOrdersDto> archivedOrderDtos = (List<ArchivedOrdersDto>) allArchivedOrders
          .stream().map(order -> archivedOrderToDto(order)).collect(Collectors.toList());
      for (ArchivedOrdersDto archivedOrderDto : archivedOrderDtos) {
        this.archivedOrdersMap
            .put(archivedOrderDto.getOrderNumber() + "," + archivedOrderDto.getProduct(),
                archivedOrderDto);
      }
    }
    this.archivedOrderDtoList = new ArrayList<>();
    for (Map.Entry<String, ArchivedOrdersDto> entry : this.archivedOrdersMap.entrySet()) {
      ArchivedOrdersDto archivedOrderDto = entry.getValue();
      this.archivedOrderDtoList.add(archivedOrderDto);
    }

    return this.archivedOrderDtoList;
  }

  public ArchivedOrders dtoToArchivedOrder(ArchivedOrdersDto archivedOrderDto) {
    ArchivedOrders archivedOrder = (ArchivedOrders) this.modelMapper.map(archivedOrderDto,
        ArchivedOrders.class);
    return archivedOrder;
  }

  public ArchivedOrders orderDtoToArchivedOrder(OrderDto orderDto) {
    ArchivedOrders archivedOrder = (ArchivedOrders) this.modelMapper.map(orderDto,
        ArchivedOrders.class);
    return archivedOrder;
  }

  public ArchivedOrdersDto archivedOrderToDto(ArchivedOrders archivedOrder) {
    ArchivedOrdersDto archivedOrderDto = (ArchivedOrdersDto) this.modelMapper
        .map(archivedOrder, ArchivedOrdersDto.class);
    return archivedOrderDto;
  }
}
