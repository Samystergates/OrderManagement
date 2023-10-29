package com.web.appts.services.imp;

import com.web.appts.DTO.OrderDto;
import com.web.appts.entities.Order;
import com.web.appts.entities.OrderDepartment;
import com.web.appts.exceptions.ResourceNotFoundException;
import com.web.appts.repositories.OrderRepo;
import com.web.appts.services.ArchivedOrdersService;
import com.web.appts.services.OrderService;

import java.sql.Connection;
import java.sql.DriverManager;
import java.sql.ResultSet;
import java.sql.SQLException;
import java.sql.Statement;
import java.util.ArrayList;
import java.util.Comparator;
import java.util.HashMap;
import java.util.Iterator;
import java.util.List;
import java.util.Map;
import java.util.regex.Matcher;
import java.util.regex.Pattern;
import java.util.stream.Collectors;
import java.util.stream.IntStream;

import javax.transaction.Transactional;

import org.modelmapper.ModelMapper;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

@Service
public class OrderServiceImp implements OrderService {

	Map<String, OrderDto> ordersMap = new HashMap<>();
	Map<String, OrderDto> archivedOrdersMap = new HashMap<>();

	List<OrderDto> orderDtoList;

	@Autowired
	private ModelMapper modelMapper;

	@Autowired
	private OrderRepo orderRepo;

	@Autowired
	private ArchivedOrdersService archivedOrdersService;

	public Map<String, OrderDto> getMap() {
		if (ordersMap.isEmpty() || ordersMap == null) {
			List<Order> allOrders = this.orderRepo.findAll();
			List<OrderDto> orderDtos = (List<OrderDto>) allOrders.stream().map(order -> {
				order.getDepartments().sort(Comparator.comparingInt(OrderDepartment::getDepId));
				OrderDto sortedDeps = orderToDto(order);
				return sortedDeps;
			}).collect(Collectors.toList());
			for (OrderDto orderDto : orderDtos) {
				this.ordersMap.put(orderDto.getOrderNumber() + "," + orderDto.getProduct(), orderDto);
			}
		}
		return ordersMap;
	}

	public Boolean createOrder(OrderDto orderDto) {
		Order order = dtoToOrder(orderDto);
		Order savedOrder = this.orderRepo.save(order);
		return Boolean.valueOf((savedOrder != null));
	}

	public Boolean archiveOrder(OrderDto orderDto) {
		return this.archivedOrdersService.createArchivedOrder(orderDto);
	}

	public void moveToArchive(List<Integer> ids) {
		Boolean isMoved = false;
		Iterator<Map.Entry<String, OrderDto>> iterator = ordersMap.entrySet().iterator();

		while (iterator.hasNext()) {
			Map.Entry<String, OrderDto> entry = iterator.next();
			OrderDto orderDto = entry.getValue();

			if (ids.contains(orderDto.getId())) {
				isMoved = archiveOrder(orderDto).booleanValue();
				if (isMoved) {
					iterator.remove();
				}
			}
		}
		if (isMoved) {
			deleteOrderData(ids);
		}
	}

	public void deleteOrderData(List<Integer> ids) {
		orderRepo.deleteODForIds(ids);
		orderRepo.deleteOrdersByIds(ids);
	}

	@Transactional
	public List<OrderDto> updateOrder(OrderDto orderDto, Integer orderId, Boolean flowUpdate) {
		Order order = (Order) this.orderRepo.findById(orderId)
				.orElseThrow(() -> new ResourceNotFoundException("Order", "id", orderId.intValue()));

		order.setDeliveryDate(orderDto.getDeliveryDate());
		order.setReferenceInfo(orderDto.getReferenceInfo());

		if (flowUpdate.booleanValue() == true) {
			if (order.hasOnlyOneDifference(dtoToOrder(orderDto))) {
				updatingFlow(order, orderDto);
			} else {
				return new ArrayList<OrderDto>();
			}
		}
		if (order.getCompleted() == null) {
			order.setCompleted("");
		}

		Order updatedOrder = (Order) this.orderRepo.save(order);

		OrderDto updatedOrderDto = orderToDto(updatedOrder);
		this.ordersMap.put(updatedOrderDto.getOrderNumber() + "," + updatedOrderDto.getProduct(), updatedOrderDto);

		boolean allOrdersComplete = ordersMap.values().stream()
				.filter(ord -> ord.getOrderNumber().equals(updatedOrderDto.getOrderNumber())
						&& !(updatedOrderDto.getId() == ord.getId()))
				.allMatch(ord -> "C".equals(ord.getCompleted()));

		if (updatedOrder.getCompleted().equals("C") && allOrdersComplete) {
			List<Integer> idList = ordersMap.values().stream()
					.filter(ord -> ord.getOrderNumber().equals(updatedOrderDto.getOrderNumber())).map(OrderDto::getId)
					.collect(Collectors.toList());
			this.moveToArchive(idList);
			this.orderDtoList = new ArrayList<>();
			for (Map.Entry<String, OrderDto> entry : this.ordersMap.entrySet()) {
				OrderDto orderDto2 = entry.getValue();
				orderDto2.getDepartments().sort(Comparator.comparingInt(OrderDepartment::getDepId));
				this.orderDtoList.add(orderDto2);
			}
			return this.orderDtoList;
		}

		this.orderDtoList = new ArrayList<>();
		for (Map.Entry<String, OrderDto> entry : this.ordersMap.entrySet()) {
			OrderDto orderDto2 = entry.getValue();
			orderDto2.getDepartments().sort(Comparator.comparingInt(OrderDepartment::getDepId));
			this.orderDtoList.add(orderDto2);
		}
		return this.orderDtoList;
	}

	public void deleteOrder(Integer orderId) {
		Order order = (Order) this.orderRepo.findById(orderId)
				.orElseThrow(() -> new ResourceNotFoundException("Order", "id", orderId.intValue()));
		this.orderRepo.delete(order);
	}

	public OrderDto getOrderById(Integer orderId) {
		Order order = (Order) this.orderRepo.findById(orderId)
				.orElseThrow(() -> new ResourceNotFoundException("User", "id", orderId.intValue()));
		return orderToDto(order);
	}

	public List<OrderDto> getOrdersByUser(String user) {
		if (this.ordersMap.isEmpty()) {
			List<Order> ordersByUser = this.orderRepo.findByUser(user);
			List<OrderDto> orderDtos = (List<OrderDto>) ordersByUser.stream().map(order -> orderToDto(order))
					.collect(Collectors.toList());
			return orderDtos;
		}
		this.orderDtoList = new ArrayList<>();
		for (Map.Entry<String, OrderDto> entry : this.ordersMap.entrySet()) {
			if (((OrderDto) entry.getValue()).getUser().equals(user)) {
				OrderDto orderDto = entry.getValue();
				this.orderDtoList.add(orderDto);
			}
		}
		return this.orderDtoList;
	}

	public List<OrderDto> getAllOrders() {
		if (this.ordersMap.isEmpty()) {
			List<Order> allOrders = this.orderRepo.findAll();
			if (allOrders.isEmpty() || allOrders == null) {
				return getCRMOrders();
			}
			List<OrderDto> orderDtos = (List<OrderDto>) allOrders.stream().map(order -> {
				order.getDepartments().sort(Comparator.comparingInt(OrderDepartment::getDepId));
				OrderDto sortedDeps = orderToDto(order);
				return sortedDeps;
			}).collect(Collectors.toList());
			for (OrderDto orderDto : orderDtos) {
				this.ordersMap.put(orderDto.getOrderNumber() + "," + orderDto.getProduct(), orderDto);
			}
			return orderDtos;
		}
		this.orderDtoList = new ArrayList<>();
		for (Map.Entry<String, OrderDto> entry : this.ordersMap.entrySet()) {
			OrderDto orderDto = entry.getValue();
			orderDto.getDepartments().sort(Comparator.comparingInt(OrderDepartment::getDepId));
			this.orderDtoList.add(orderDto);
		}
		return this.orderDtoList;
	}

	public List<OrderDto> checkMap() {
		if (this.ordersMap.isEmpty()) {
			List<Order> allOrders = this.orderRepo.findAll();
			if (allOrders.isEmpty() || allOrders == null) {
				return getCRMOrders();
			}
			List<OrderDto> orderDtos = (List<OrderDto>) allOrders.stream().map(order -> {
				order.getDepartments().sort(Comparator.comparingInt(OrderDepartment::getDepId));
				OrderDto sortedDeps = orderToDto(order);
				return sortedDeps;
			}).collect(Collectors.toList());
			for (OrderDto orderDto : orderDtos) {
				this.ordersMap.put(orderDto.getOrderNumber() + "," + orderDto.getProduct(), orderDto);
			}
			return orderDtos;
		} else {
			List<Order> allOrders = this.orderRepo.findAll();
			List<OrderDto> mapOrders = new ArrayList<>(this.ordersMap.values());
			if (allOrders.size() != mapOrders.size()) {

				ordersMap.clear();

				List<OrderDto> orderDtos = (List<OrderDto>) allOrders.stream().map(order -> {
					order.getDepartments().sort(Comparator.comparingInt(OrderDepartment::getDepId));
					OrderDto sortedDeps = orderToDto(order);
					return sortedDeps;
				}).collect(Collectors.toList());
				for (OrderDto orderDto : orderDtos) {
					this.ordersMap.put(orderDto.getOrderNumber() + "," + orderDto.getProduct(), orderDto);
				}

				this.orderDtoList = new ArrayList<>();
				for (Map.Entry<String, OrderDto> entry : this.ordersMap.entrySet()) {
					OrderDto orderDto = entry.getValue();
					orderDto.getDepartments().sort(Comparator.comparingInt(OrderDepartment::getDepId));
					this.orderDtoList.add(orderDto);
				}
				return this.orderDtoList;
			} else {
				return null;
			}
		}

	}

	@Transactional
	public List<OrderDto> getCRMOrders() {

		try {
			String driver = "sun.jdbc.odbc.JdbcOdbcDriver";

			String connectionString = "jdbc:odbc:\"DRIVER={MySQL ODBC 8.0 Unicode Driver};DSN=refdemdata1;Trusted_Connection=Yes;";
			String query = "SELECT\r\n  demotable2.Verkooporder,\r\n  demotable2.Ordersoort,\r\n  demotable2.Backorder,\r\n  demotable2.Gebruiker_I,\r\n  "
					+ "demotable2.Organisatie,\r\n  demotable2.Naam,\r\n  demotable2.Postcode,\r\n  demotable2.Plaats,\r\n  demotable2.Land,\r\n  demotable2.Leverdatum,\r\n "
					+ " demotable2.Referentie,\r\n  demotable2.Datum_order,\r\n  demotable2.Datum_laatste_wijziging,\r\n  demotable2.Regel,\r\n  demotable2.Aantal_besteld,\r\n "
					+ " demotable2.Product,\r\n demotable2.cdprodgrp,\r\n demotable2.Omschrijving,\r\n  demotable2.Gebruiker_L FROM demotesttable.demotable2";
			Connection connection = null;
			Statement statement = null;
			try {
				Class.forName(driver);
				connection = DriverManager.getConnection(connectionString);
				statement = connection.createStatement();
				if (statement != null) {
					ResultSet resultSet = statement.executeQuery(query);

					while (resultSet.next()) {
						String orderNumber = resultSet.getString("Verkooporder");
						String orderType = resultSet.getString("Ordersoort");
						String backOrder = resultSet.getString("Backorder");
						String user = resultSet.getString("Gebruiker_I");
						String organization = resultSet.getString("Organisatie");
						String customerName = resultSet.getString("Naam");
						String postCode = resultSet.getString("Postcode");
						String city = resultSet.getString("Plaats");
						String country = resultSet.getString("Land");
						String deliveryDate = resultSet.getString("Leverdatum");
						String referenceInfo = resultSet.getString("Referentie");
						String creationDate = resultSet.getString("Datum_order");
						String modificationDate = resultSet.getString("Datum_laatste_wijziging");
						String verifierUser = resultSet.getString("Gebruiker_L");
						String regel = resultSet.getString("Regel");
						String aantal = resultSet.getString("Aantal_besteld");
						String product = resultSet.getString("Product");
						String omsumin = resultSet.getString("Omschrijving");
						String cdProdGrp = resultSet.getString("cdprodgrp");
			
			
//			String connectionString = "jdbc:odbc:DRIVER={Progress OpenEdge 11.6 Driver};DSN=AGRPROD;UID=ODBC;PWD=ODBC;HOST=W2K16DMBBU4;PORT=12501;DB=data;Trusted_Connection=Yes;";
//
//			String query = "SELECT \"va-210\".\"cdorder\" AS 'Verkooporder', \"va-210\".\"cdordsrt\" AS 'Ordersoort', \"va-211\".\"cdborder\" AS 'Backorder',"
//					+ " \"va-210\".\"cdgebruiker-init\" AS 'Gebruiker (I)', \"va-210\".\"cddeb\" AS 'Organisatie', \"ba-001\".\"naamorg\" AS 'Naam',"
//					+ " \"ba-012\".\"postcode\" AS 'Postcode', \"ba-012\".\"plaats\" AS 'Plaats', \"ba-012\".\"cdland\" AS 'Land', \"va-210\".\"datum-lna\" AS 'Leverdatum',"
//					+ " \"va-210\".\"opm-30\" AS 'Referentie', \"va-210\".\"datum-order\" AS 'Datum order', \"va-210\".\"SYS-DATE\" AS 'Datum laatste wijziging',"
//					+ " \"va-210\".\"cdgebruiker\" AS 'Gebruiker (L)', \"va-211\".\"nrordrgl\" AS 'Regel', \"va-211\".\"aantbest\" AS 'Aantal besteld',"
//					+ " \"va-211\".\"aanttelev\" AS 'Aantal geleverd', \"va-211\".\"cdprodukt\" AS 'Product', \"af-801\".\"tekst\" AS 'Omschrijving',"
//					+ " \"va-211\".\"volgorde\" AS 'regelvolgorde', \"bb-043\".\"cdprodgrp\" FROM DATA.PUB.\"af-801\" , DATA.PUB.\"ba-001\" , DATA.PUB.\"ba-012\" ,"
//					+ " DATA.PUB.\"bb-043\" , DATA.PUB.\"va-210\" , DATA.PUB.\"va-211\" WHERE \"ba-001\".\"cdorg\" = \"va-210\".\"cdorg\" "
//					+ "AND \"va-211\".\"cdadmin\" = \"va-210\".\"cdadmin\" AND \"va-211\".\"cdorder\" = \"va-210\".\"cdorder\" AND \"va-211\".\"cdorg\" = \"ba-001\".\"cdorg\" AND"
//					+ " \"va-211\".\"cdprodukt\" = \"af-801\".\"cdsleutel1\" AND \"ba-012\".\"id-cdads\" = \"va-211\".\"id-cdads\" AND \"bb-043\".\"cdprodukt\" = \"va-211\".\"cdprodukt\""
//					+ " AND ((\"af-801\".\"cdtabel\"='bb-062') AND (\"va-210\".\"cdadmin\"='01') AND (\"va-211\".\"cdadmin\"='01') AND (\"va-210\".\"cdvestiging\"='ree') AND "
//					+ "(\"va-210\".\"cdstatus\" <> 'Z' And \"va-210\".\"cdstatus\" <> 'B') AND (\"bb-043\".\"cdprodcat\"='pro'))";
//
//			Connection connection = null;
//			Statement statement = null;
//			try {
//				Class.forName(driver);
//				connection = DriverManager.getConnection(connectionString);
//				statement = connection.createStatement();
//				if (statement != null) {
//					ResultSet resultSet = statement.executeQuery(query);
//
//					while (resultSet.next()) {
//						String orderNumber = resultSet.getString("Verkooporder");
//						String orderType = resultSet.getString("Ordersoort");
//						String backOrder = resultSet.getString("Backorder");
//						String user = resultSet.getString("Gebruiker (I)");
//						String organization = resultSet.getString("Organisatie");
//						String customerName = resultSet.getString("Naam");
//						String postCode = resultSet.getString("Postcode");
//						String city = resultSet.getString("Plaats");
//						String country = resultSet.getString("Land");
//						String deliveryDate = resultSet.getString("Leverdatum");
//						String referenceInfo = resultSet.getString("Referentie");
//						String creationDate = resultSet.getString("Datum order");
//						String modificationDate = resultSet.getString("Datum laatste wijziging");
//						String verifierUser = resultSet.getString("Gebruiker (L)");
//						String regel = resultSet.getString("Regel");
//						String aantal = resultSet.getString("Aantal besteld");
//						String product = resultSet.getString("Product");
//						String omsumin = resultSet.getString("Omschrijving");
//						String cdProdGrp = resultSet.getString("cdprodgrp");

						String deliveryDate2 = "";
						if (!this.ordersMap.containsKey(orderNumber + "," + product)
								&& !this.archivedOrdersService.getAllArchivedOrders().stream()
										.anyMatch(obj -> obj.getOrderNumber().equals(orderNumber))) {

							OrderDto orderDto = new OrderDto();
							if (!this.ordersMap.entrySet().stream()
									.anyMatch(obj -> obj.getValue().getOrderNumber().equals(orderNumber))) {
								orderDto.setIsParent(1);
							} else {
								orderDto.setIsParent(0);
							}
							int maxId = ordersMap.values().stream().mapToInt(OrderDto::getId).max().orElse(0);
							orderDto.setId(++maxId);
							orderDto.setOrderNumber(orderNumber);
							orderDto.setOrderType(orderType);
							orderDto.setBackOrder(backOrder);
							orderDto.setCdProdGrp(cdProdGrp);
							settingUpFlow(orderDto);
							orderDto.setUser(user);
							orderDto.setOrganization(organization);
							orderDto.setCustomerName(customerName);
							orderDto.setPostCode(postCode);
							orderDto.setCity(city);
							orderDto.setCountry(country);
							if(deliveryDate == null) {
								orderDto.setDeliveryDate("");
							}
							else {
								orderDto.setDeliveryDate(deliveryDate);
							}
							orderDto.setReferenceInfo(referenceInfo);
							orderDto.setCreationDate(creationDate);
							orderDto.setModificationDate(modificationDate);
							orderDto.setVerifierUser(verifierUser);
							orderDto.setRegel(regel);
							orderDto.setAantal(aantal);
							orderDto.setProduct(product);
							orderDto.setOmsumin(omsumin);

							deliveryDate2 = orderDto.getDeliveryDate();
							System.out.println(deliveryDate2);
							if (!createOrder(orderDto).booleanValue()) {
								System.out.println("Failed to create record in app");
							} else {
								this.ordersMap.put(orderNumber + "," + product, orderDto);
							}
						}

						if (this.ordersMap.containsKey(orderNumber + "," + product) && !this.ordersMap
								.get(orderNumber + "," + product).getDeliveryDate().equals(deliveryDate2)
								&& !deliveryDate2.equals("")) {
							OrderDto orderDtoMap = this.ordersMap.get(orderNumber + "," + product);

							System.out.println("again");
							System.out.println(deliveryDate2);
							orderDtoMap.setDeliveryDate(deliveryDate2);
							orderDtoMap.setReferenceInfo(referenceInfo);
							updateOrder(orderDtoMap,
									Integer.valueOf(
											((OrderDto) this.ordersMap.get(orderNumber + "," + product)).getId()),
									Boolean.valueOf(false));
						}
					}
					resultSet.close();
					statement.close();
					connection.close();
				}
			} catch (SQLException e) {
				e.printStackTrace();
				new ResourceNotFoundException("Order", "CRM", "N/A");
				return null;
			} catch (ClassNotFoundException e) {
				e.printStackTrace();
				new ResourceNotFoundException("Order", "CRM", "N/A");
				return null;
			} catch (Exception e) {
				e.printStackTrace();
				new ResourceNotFoundException("Order", "CRM", "N/A");
				return null;
			} finally {
				if (connection != null) {
					connection.close();
				}
			}

			ordersMap.clear();
			List<OrderDto> orderList = this.getAllOrders();
			orderDtoList = orderList;
			return this.orderDtoList;
		} catch (Exception e) {
			e.printStackTrace();
			new ResourceNotFoundException("Order", "CRM", "N/A");
			return null;
		}
	}

	@Transactional
	private void settingUpFlow(OrderDto orderDto) {
		String orderType = orderDto.getOrderType();
		List<OrderDepartment> depList = new ArrayList<>();
		// List<OrderDeps> depList2 = new ArrayList<>();
		String wheelOrder = orderDto.getCdProdGrp();

		String pattern = "(182|183|184|440|820|821|822|823|824|825|826|850|851)";

		Pattern compiledPattern = Pattern.compile(pattern);
		Matcher matcher = compiledPattern.matcher(wheelOrder);

		if (matcher.find()) {
			orderDto.setSme("");
			orderDto.setSpu("");

			depList.add(new OrderDepartment(2, "SME", "", dtoToOrder(orderDto)));
			depList.add(new OrderDepartment(3, "SPU", "", dtoToOrder(orderDto)));
		}
		if (orderType.equals("LOS")) {
			orderDto.setTra("R");
			depList.add(new OrderDepartment(8, "TRA", "R", dtoToOrder(orderDto)));
		}
		if (orderType.equals("LAS")) {
			orderDto.setExp("R");
			depList.add(new OrderDepartment(9, "EXP", "R", dtoToOrder(orderDto)));
		}
		if (orderType.equals("LSO")) {
			orderDto.setSer("R");
			depList.add(new OrderDepartment(7, "SER", "R", dtoToOrder(orderDto)));
		}
		if (orderType.equals("MAO")) {
			orderDto.setMonLb("R");
			orderDto.setExp("R");
			depList.add(new OrderDepartment(4, "MONLB", "R", dtoToOrder(orderDto)));
			depList.add(new OrderDepartment(9, "EXP", "R", dtoToOrder(orderDto)));
		}
		if (orderType.equals("MLO")) {
			orderDto.setMonLb("R");
			orderDto.setTra("R");
			depList.add(new OrderDepartment(4, "MONLB", "R", dtoToOrder(orderDto)));
			depList.add(new OrderDepartment(8, "TRA", "R", dtoToOrder(orderDto)));
		}
		if (orderType.equals("MWO")) {
			orderDto.setMwe("R");
			depList.add(new OrderDepartment(6, "MWE", "R", dtoToOrder(orderDto)));
		}
		if (orderType.equals("MSO")) {
			orderDto.setMonLb("R");
			orderDto.setSer("R");
			depList.add(new OrderDepartment(4, "MONLB", "R", dtoToOrder(orderDto)));
			depList.add(new OrderDepartment(7, "SER", "R", dtoToOrder(orderDto)));
		}
		if (orderType.equals("MLT")) {
			orderDto.setMonTr("R");
			orderDto.setTra("R");
			depList.add(new OrderDepartment(5, "MONTR", "R", dtoToOrder(orderDto)));
			depList.add(new OrderDepartment(8, "TRA", "R", dtoToOrder(orderDto)));
		}
		if (orderType.equals("MST")) {
			orderDto.setMonTr("R");
			orderDto.setSer("R");
			depList.add(new OrderDepartment(5, "MONTR", "R", dtoToOrder(orderDto)));
			depList.add(new OrderDepartment(7, "SER", "R", dtoToOrder(orderDto)));
		}
		if (orderType.equals("LOP")) {
			orderDto.setTra("R");
			depList.add(new OrderDepartment(8, "TRA", "R", dtoToOrder(orderDto)));
		}
		if (orderType.equals("LAP")) {
			orderDto.setExp("R");
			depList.add(new OrderDepartment(9, "EXP", "R", dtoToOrder(orderDto)));
		}
		if (orderType.equals("LSP")) {
			orderDto.setSer("R");
			depList.add(new OrderDepartment(7, "SER", "R", dtoToOrder(orderDto)));
		}
		if (orderType.equals("MAP")) {
			orderDto.setMonLb("R");
			orderDto.setExp("R");
			depList.add(new OrderDepartment(4, "MONLB", "R", dtoToOrder(orderDto)));
			depList.add(new OrderDepartment(9, "EXP", "R", dtoToOrder(orderDto)));
		}
		if (orderType.equals("MLP")) {
			orderDto.setMonLb("R");
			orderDto.setTra("R");
			depList.add(new OrderDepartment(4, "MONLB", "R", dtoToOrder(orderDto)));
			depList.add(new OrderDepartment(8, "TRA", "R", dtoToOrder(orderDto)));
		}
		if (orderType.equals("MWP")) {
			orderDto.setMwe("R");
			depList.add(new OrderDepartment(6, "MWE", "R", dtoToOrder(orderDto)));
		}
		if (orderType.equals("MSP")) {
			orderDto.setMonLb("R");
			orderDto.setSer("R");
			depList.add(new OrderDepartment(4, "MONLB", "R", dtoToOrder(orderDto)));
			depList.add(new OrderDepartment(7, "SER", "R", dtoToOrder(orderDto)));
		}
		if (orderType.equals("MSE")) {
			orderDto.setMonTr("R");
			orderDto.setSer("R");
			depList.add(new OrderDepartment(5, "MONTR", "R", dtoToOrder(orderDto)));
			depList.add(new OrderDepartment(7, "SER", "R", dtoToOrder(orderDto)));
		}
		if (orderType.equals("MLE")) {
			orderDto.setMonTr("R");
			orderDto.setTra("R");
			depList.add(new OrderDepartment(5, "MONTR", "R", dtoToOrder(orderDto)));
			depList.add(new OrderDepartment(8, "TRA", "R", dtoToOrder(orderDto)));
		}
		if (orderType.equals("WEB")) {
			orderDto.setTra("R");
			depList.add(new OrderDepartment(8, "TRA", "R", dtoToOrder(orderDto)));
		}
		if (orderType.equals("BBA")) {
			orderDto.setTra("R");
			depList.add(new OrderDepartment(8, "TRA", "R", dtoToOrder(orderDto)));
		}

		orderDto.setDepartments(depList);

	}

	private void updatingFlow(Order order, OrderDto orderDto) {

		String orderTypeDto = orderDto.getOrderType();
		String orderType = order.getOrderType();
		List<OrderDepartment> depList = order.getDepartments();
		List<OrderDepartment> depListDto = orderDto.getDepartments();

		if (depList != null) {
			depList.sort(Comparator.comparingInt(OrderDepartment::getDepId));
		}
		if (orderDto.getCompleted() == null) {
			orderDto.setCompleted("");
		}
		if (orderDto.getCompleted().equals("C")) {
			order.setCompleted("C");
		}

		if (orderType.equals(orderTypeDto) && orderType.equals("LOS")) {
			order.setTra(orderDto.getTra());
			int index = IntStream.range(0, depList.size())
					.filter(i -> (((OrderDepartment) depList.get(i)).getDepId() == 8)).findFirst().orElse(-1);
			if (index != -1) {
				if (depList.get(index).getPrevStatus() == null) {
					depList.get(index).setPrevStatus("n");
				}
				if (depListDto.get(index).getPrevStatus() == null) {
					depListDto.get(index).setPrevStatus("n");
				}
				if (!depList.get(index).getPrevStatus().equals(depListDto.get(index).getPrevStatus())) {
					depList.get(index).setPrevStatus(depList.get(index).getStatus());
				}
				if (!depList.get(index).getStatus().equals(orderDto.getTra())) {
					((OrderDepartment) depList.get(index)).setStatus(orderDto.getTra());
				}
			}
		}

		if (orderType.equals(orderTypeDto) && orderType.equals("LAS")) {
			order.setExp(orderDto.getExp());
			int index = IntStream.range(0, depList.size())
					.filter(i -> (((OrderDepartment) depList.get(i)).getDepId() == 9)).findFirst().orElse(-1);
			if (index != -1) {
				if (depList.get(index).getPrevStatus() == null) {
					depList.get(index).setPrevStatus("n");
				}
				if (depListDto.get(index).getPrevStatus() == null) {
					depListDto.get(index).setPrevStatus("n");
				}
				if (!depList.get(index).getPrevStatus().equals(depListDto.get(index).getPrevStatus())) {
					depList.get(index).setPrevStatus(depList.get(index).getStatus());
				}
				if (!depList.get(index).getStatus().equals(orderDto.getExp())) {
					((OrderDepartment) depList.get(index)).setStatus(orderDto.getExp());
				}
			}
		}

		if (orderType.equals(orderTypeDto) && orderType.equals("LSO")) {
			order.setSer(orderDto.getSer());
			int index = IntStream.range(0, depList.size())
					.filter(i -> (((OrderDepartment) depList.get(i)).getDepId() == 7)).findFirst().orElse(-1);
			if (index != -1) {
				if (depList.get(index).getPrevStatus() == null) {
					depList.get(index).setPrevStatus("n");
				}
				if (depListDto.get(index).getPrevStatus() == null) {
					depListDto.get(index).setPrevStatus("n");
				}
				if (!depList.get(index).getPrevStatus().equals(depListDto.get(index).getPrevStatus())) {
					depList.get(index).setPrevStatus(depList.get(index).getStatus());
				}
				if (!depList.get(index).getStatus().equals(orderDto.getSer())) {
					((OrderDepartment) depList.get(index)).setStatus(orderDto.getSer());
				}
			}
		}

		if (orderType.equals(orderTypeDto) && orderType.equals("MAO")) {
			order.setMonLb(orderDto.getMonLb());
			order.setExp(orderDto.getExp());
			int monLbIndex = IntStream.range(0, depList.size())
					.filter(i -> (((OrderDepartment) depList.get(i)).getDepId() == 4)).findFirst().orElse(-1);
			if (monLbIndex != -1) {
				if (depList.get(monLbIndex).getPrevStatus() == null) {
					depList.get(monLbIndex).setPrevStatus("n");
				}
				if (depListDto.get(monLbIndex).getPrevStatus() == null) {
					depListDto.get(monLbIndex).setPrevStatus("n");
				}
				if (!depList.get(monLbIndex).getPrevStatus().equals(depListDto.get(monLbIndex).getPrevStatus())) {
					depList.get(monLbIndex).setPrevStatus(depList.get(monLbIndex).getStatus());
				}
				if (!depList.get(monLbIndex).getStatus().equals(orderDto.getMonLb())) {
					((OrderDepartment) depList.get(monLbIndex)).setStatus(orderDto.getMonLb());
				}
			}
			int expIndex = IntStream.range(0, depList.size())
					.filter(i -> (((OrderDepartment) depList.get(i)).getDepId() == 9)).findFirst().orElse(-1);
			if (expIndex != -1) {
				if (depList.get(expIndex).getPrevStatus() == null) {
					depList.get(expIndex).setPrevStatus("n");
				}
				if (depListDto.get(expIndex).getPrevStatus() == null) {
					depListDto.get(expIndex).setPrevStatus("n");
				}
				if (!depList.get(expIndex).getPrevStatus().equals(depListDto.get(expIndex).getPrevStatus())) {
					depList.get(expIndex).setPrevStatus(depList.get(expIndex).getStatus());
				}
				if (!depList.get(expIndex).getStatus().equals(orderDto.getExp())) {
					((OrderDepartment) depList.get(expIndex)).setStatus(orderDto.getExp());
				}
			}
		}
		if (orderType.equals(orderTypeDto) && orderType.equals("MLO")) {
			order.setMonLb(orderDto.getMonLb());

			int monLbIndex = IntStream.range(0, depList.size())
					.filter(i -> (((OrderDepartment) depList.get(i)).getDepId() == 4)).findFirst().orElse(-1);
			if (monLbIndex != -1) {
				if (depList.get(monLbIndex).getPrevStatus() == null) {
					depList.get(monLbIndex).setPrevStatus("n");
				}
				if (depListDto.get(monLbIndex).getPrevStatus() == null) {
					depListDto.get(monLbIndex).setPrevStatus("n");
				}
				if (!depList.get(monLbIndex).getPrevStatus().equals(depListDto.get(monLbIndex).getPrevStatus())) {
					depList.get(monLbIndex).setPrevStatus(depList.get(monLbIndex).getStatus());
				}
				if (!depList.get(monLbIndex).getStatus().equals(orderDto.getMonLb())) {
					((OrderDepartment) depList.get(monLbIndex)).setStatus(orderDto.getMonLb());
				}
			}

			int traIndex = IntStream.range(0, depList.size())
					.filter(i -> (((OrderDepartment) depList.get(i)).getDepId() == 8)).findFirst().orElse(-1);
			if (traIndex != -1) {
				if (depList.get(traIndex).getPrevStatus() == null) {
					depList.get(traIndex).setPrevStatus("n");
				}
				if (depListDto.get(traIndex).getPrevStatus() == null) {
					depListDto.get(traIndex).setPrevStatus("n");
				}
				if (!depList.get(traIndex).getPrevStatus().equals(depListDto.get(traIndex).getPrevStatus())) {
					depList.get(traIndex).setPrevStatus(depList.get(traIndex).getStatus());
				}
				if (!depList.get(traIndex).getStatus().equals(orderDto.getTra())) {
					((OrderDepartment) depList.get(traIndex)).setStatus(orderDto.getTra());
				}
			}
		}

		if (orderType.equals(orderTypeDto) && orderType.equals("MWO")) {
			order.setMwe(orderDto.getMwe());

			int index = IntStream.range(0, depList.size())
					.filter(i -> (((OrderDepartment) depList.get(i)).getDepId() == 6)).findFirst().orElse(-1);
			if (index != -1) {
				if (depList.get(index).getPrevStatus() == null) {
					depList.get(index).setPrevStatus("n");
				}
				if (depListDto.get(index).getPrevStatus() == null) {
					depListDto.get(index).setPrevStatus("n");
				}
				if (!depList.get(index).getPrevStatus().equals(depListDto.get(index).getPrevStatus())) {
					depList.get(index).setPrevStatus(depList.get(index).getStatus());
				}
				if (!depList.get(index).getStatus().equals(orderDto.getMwe())) {
					((OrderDepartment) depList.get(index)).setStatus(orderDto.getMwe());
				}
			}
		}

		if (orderType.equals(orderTypeDto) && orderType.equals("MSO")) {
			order.setMonLb(orderDto.getMonLb());
			order.setSer(orderDto.getSer());

			int monLbIndex = IntStream.range(0, depList.size())
					.filter(i -> (((OrderDepartment) depList.get(i)).getDepId() == 4)).findFirst().orElse(-1);
			if (monLbIndex != -1) {
				if (depList.get(monLbIndex).getPrevStatus() == null) {
					depList.get(monLbIndex).setPrevStatus("n");
				}
				if (depListDto.get(monLbIndex).getPrevStatus() == null) {
					depListDto.get(monLbIndex).setPrevStatus("n");
				}
				if (!depList.get(monLbIndex).getPrevStatus().equals(depListDto.get(monLbIndex).getPrevStatus())) {
					depList.get(monLbIndex).setPrevStatus(depList.get(monLbIndex).getStatus());
				}
				if (!depList.get(monLbIndex).getStatus().equals(orderDto.getMonLb())) {
					((OrderDepartment) depList.get(monLbIndex)).setStatus(orderDto.getMonLb());
				}
			}

			int serIndex = IntStream.range(0, depList.size())
					.filter(i -> (((OrderDepartment) depList.get(i)).getDepId() == 7)).findFirst().orElse(-1);
			if (serIndex != -1) {
				if (depList.get(serIndex).getPrevStatus() == null) {
					depList.get(serIndex).setPrevStatus("n");
				}
				if (depListDto.get(serIndex).getPrevStatus() == null) {
					depListDto.get(serIndex).setPrevStatus("n");
				}
				if (!depList.get(serIndex).getPrevStatus().equals(depListDto.get(serIndex).getPrevStatus())) {
					depList.get(serIndex).setPrevStatus(depList.get(serIndex).getStatus());
				}
				if (!depList.get(serIndex).getStatus().equals(orderDto.getSer())) {
					((OrderDepartment) depList.get(serIndex)).setStatus(orderDto.getSer());
				}
			}
		}

		if (orderType.equals(orderTypeDto) && orderType.equals("MLT")) {
			order.setMonTr(orderDto.getMonTr());
			order.setTra(orderDto.getTra());

			int monTrIndex = IntStream.range(0, depList.size())
					.filter(i -> (((OrderDepartment) depList.get(i)).getDepId() == 5)).findFirst().orElse(-1);
			if (monTrIndex != -1) {
				if (depList.get(monTrIndex).getPrevStatus() == null) {
					depList.get(monTrIndex).setPrevStatus("n");
				}
				if (depListDto.get(monTrIndex).getPrevStatus() == null) {
					depListDto.get(monTrIndex).setPrevStatus("n");
				}
				if (!depList.get(monTrIndex).getPrevStatus().equals(depListDto.get(monTrIndex).getPrevStatus())) {
					depList.get(monTrIndex).setPrevStatus(depList.get(monTrIndex).getStatus());
				}
				if (!depList.get(monTrIndex).getStatus().equals(orderDto.getMonTr())) {
					((OrderDepartment) depList.get(monTrIndex)).setStatus(orderDto.getMonTr());
				}
			}

			int traIndex = IntStream.range(0, depList.size())
					.filter(i -> (((OrderDepartment) depList.get(i)).getDepId() == 8)).findFirst().orElse(-1);
			if (traIndex != -1) {
				if (depList.get(traIndex).getPrevStatus() == null) {
					depList.get(traIndex).setPrevStatus("n");
				}
				if (depListDto.get(traIndex).getPrevStatus() == null) {
					depListDto.get(traIndex).setPrevStatus("n");
				}
				if (!depList.get(traIndex).getPrevStatus().equals(depListDto.get(traIndex).getPrevStatus())) {
					depList.get(traIndex).setPrevStatus(depList.get(traIndex).getStatus());
				}
				if (!depList.get(traIndex).getStatus().equals(orderDto.getTra())) {
					((OrderDepartment) depList.get(traIndex)).setStatus(orderDto.getTra());
				}
			}
		}
		if (orderType.equals(orderTypeDto) && orderType.equals("MST")) {
			order.setMonTr(orderDto.getMonTr());
			order.setSer(orderDto.getSer());

			int monTrIndex = IntStream.range(0, depList.size())
					.filter(i -> (((OrderDepartment) depList.get(i)).getDepId() == 5)).findFirst().orElse(-1);
			if (monTrIndex != -1) {
				if (depList.get(monTrIndex).getPrevStatus() == null) {
					depList.get(monTrIndex).setPrevStatus("n");
				}
				if (depListDto.get(monTrIndex).getPrevStatus() == null) {
					depListDto.get(monTrIndex).setPrevStatus("n");
				}
				if (!depList.get(monTrIndex).getPrevStatus().equals(depListDto.get(monTrIndex).getPrevStatus())) {
					depList.get(monTrIndex).setPrevStatus(depList.get(monTrIndex).getStatus());
				}
				if (!depList.get(monTrIndex).getStatus().equals(orderDto.getMonTr())) {
					((OrderDepartment) depList.get(monTrIndex)).setStatus(orderDto.getMonTr());
				}
			}

			int serIndex = IntStream.range(0, depList.size())
					.filter(i -> (((OrderDepartment) depList.get(i)).getDepId() == 7)).findFirst().orElse(-1);
			if (serIndex != -1) {
				if (depList.get(serIndex).getPrevStatus() == null) {
					depList.get(serIndex).setPrevStatus("n");
				}
				if (depListDto.get(serIndex).getPrevStatus() == null) {
					depListDto.get(serIndex).setPrevStatus("n");
				}
				if (!depList.get(serIndex).getPrevStatus().equals(depListDto.get(serIndex).getPrevStatus())) {
					depList.get(serIndex).setPrevStatus(depList.get(serIndex).getStatus());
				}
				if (!depList.get(serIndex).getStatus().equals(orderDto.getSer())) {
					((OrderDepartment) depList.get(serIndex)).setStatus(orderDto.getSer());
				}
			}
		}

		if (orderType.equals(orderTypeDto) && orderType.equals("LOP")) {
			order.setTra(orderDto.getTra());

			int index = IntStream.range(0, depList.size())
					.filter(i -> (((OrderDepartment) depList.get(i)).getDepId() == 8)).findFirst().orElse(-1);
			if (index != -1) {
				if (depList.get(index).getPrevStatus() == null) {
					depList.get(index).setPrevStatus("n");
				}
				if (depListDto.get(index).getPrevStatus() == null) {
					depListDto.get(index).setPrevStatus("n");
				}
				if (!depList.get(index).getPrevStatus().equals(depListDto.get(index).getPrevStatus())) {
					depList.get(index).setPrevStatus(depList.get(index).getStatus());
				}
				if (!depList.get(index).getStatus().equals(orderDto.getTra())) {
					((OrderDepartment) depList.get(index)).setStatus(orderDto.getTra());
				}
			}
		}

		if (orderType.equals(orderTypeDto) && orderType.equals("LAP")) {
			order.setExp(orderDto.getExp());

			int expIndex = IntStream.range(0, depList.size())
					.filter(i -> (((OrderDepartment) depList.get(i)).getDepId() == 9)).findFirst().orElse(-1);
			if (expIndex != -1) {
				if (depList.get(expIndex).getPrevStatus() == null) {
					depList.get(expIndex).setPrevStatus("n");
				}
				if (depListDto.get(expIndex).getPrevStatus() == null) {
					depListDto.get(expIndex).setPrevStatus("n");
				}
				if (!depList.get(expIndex).getPrevStatus().equals(depListDto.get(expIndex).getPrevStatus())) {
					depList.get(expIndex).setPrevStatus(depList.get(expIndex).getStatus());
				}
				if (!depList.get(expIndex).getStatus().equals(orderDto.getExp())) {
					((OrderDepartment) depList.get(expIndex)).setStatus(orderDto.getExp());
				}
			}
		}

		if (orderType.equals(orderTypeDto) && orderType.equals("LSP")) {
			order.setSer(orderDto.getSer());

			int serIndex = IntStream.range(0, depList.size())
					.filter(i -> (((OrderDepartment) depList.get(i)).getDepId() == 7)).findFirst().orElse(-1);
			if (serIndex != -1) {
				if (depList.get(serIndex).getPrevStatus() == null) {
					depList.get(serIndex).setPrevStatus("n");
				}
				if (depListDto.get(serIndex).getPrevStatus() == null) {
					depListDto.get(serIndex).setPrevStatus("n");
				}
				if (!depList.get(serIndex).getPrevStatus().equals(depListDto.get(serIndex).getPrevStatus())) {
					depList.get(serIndex).setPrevStatus(depList.get(serIndex).getStatus());
				}
				if (!depList.get(serIndex).getStatus().equals(orderDto.getSer())) {
					((OrderDepartment) depList.get(serIndex)).setStatus(orderDto.getSer());
				}
			}
		}

		if (orderType.equals(orderTypeDto) && orderType.equals("MAP")) {
			order.setMonLb(orderDto.getMonLb());
			order.setExp(orderDto.getExp());

			int index = IntStream.range(0, depList.size())
					.filter(i -> (((OrderDepartment) depList.get(i)).getDepId() == 4)).findFirst().orElse(-1);
			if (index != -1) {
				if (depList.get(index).getPrevStatus() == null) {
					depList.get(index).setPrevStatus("n");
				}
				if (depListDto.get(index).getPrevStatus() == null) {
					depListDto.get(index).setPrevStatus("n");
				}
				if (!depList.get(index).getPrevStatus().equals(depListDto.get(index).getPrevStatus())) {
					depList.get(index).setPrevStatus(depList.get(index).getStatus());
				}
				if (!depList.get(index).getStatus().equals(orderDto.getMonLb())) {
					((OrderDepartment) depList.get(index)).setStatus(orderDto.getMonLb());
				}
			}

			int expIndex = IntStream.range(0, depList.size())
					.filter(i -> (((OrderDepartment) depList.get(i)).getDepId() == 9)).findFirst().orElse(-1);
			if (expIndex != -1) {
				if (depList.get(expIndex).getPrevStatus() == null) {
					depList.get(expIndex).setPrevStatus("n");
				}
				if (depListDto.get(expIndex).getPrevStatus() == null) {
					depListDto.get(expIndex).setPrevStatus("n");
				}
				if (!depList.get(expIndex).getPrevStatus().equals(depListDto.get(expIndex).getPrevStatus())) {
					depList.get(expIndex).setPrevStatus(depList.get(expIndex).getStatus());
				}
				if (!depList.get(expIndex).getStatus().equals(orderDto.getExp())) {
					((OrderDepartment) depList.get(expIndex)).setStatus(orderDto.getExp());
				}
			}
		}

		if (orderType.equals(orderTypeDto) && orderType.equals("MLP")) {
			order.setMonLb(orderDto.getMonLb());
			order.setTra(orderDto.getTra());

			int index = IntStream.range(0, depList.size())
					.filter(i -> (((OrderDepartment) depList.get(i)).getDepId() == 4)).findFirst().orElse(-1);
			if (index != -1) {
				if (depList.get(index).getPrevStatus() == null) {
					depList.get(index).setPrevStatus("n");
				}
				if (depListDto.get(index).getPrevStatus() == null) {
					depListDto.get(index).setPrevStatus("n");
				}
				if (!depList.get(index).getPrevStatus().equals(depListDto.get(index).getPrevStatus())) {
					depList.get(index).setPrevStatus(depList.get(index).getStatus());
				}
				if (!depList.get(index).getStatus().equals(orderDto.getMonLb())) {
					((OrderDepartment) depList.get(index)).setStatus(orderDto.getMonLb());
				}
			}

			int index2 = IntStream.range(0, depList.size())
					.filter(i -> (((OrderDepartment) depList.get(i)).getDepId() == 8)).findFirst().orElse(-1);
			if (index2 != -1) {
				if (depList.get(index2).getPrevStatus() == null) {
					depList.get(index2).setPrevStatus("n");
				}
				if (depListDto.get(index2).getPrevStatus() == null) {
					depListDto.get(index2).setPrevStatus("n");
				}
				if (!depList.get(index2).getPrevStatus().equals(depListDto.get(index2).getPrevStatus())) {
					depList.get(index2).setPrevStatus(depList.get(index2).getStatus());
				}
				if (!depList.get(index2).getStatus().equals(orderDto.getTra())) {
					((OrderDepartment) depList.get(index2)).setStatus(orderDto.getTra());
				}
			}
		}

		if (orderType.equals(orderTypeDto) && orderType.equals("MWP")) {
			order.setMwe(orderDto.getMwe());

			int index = IntStream.range(0, depList.size())
					.filter(i -> (((OrderDepartment) depList.get(i)).getDepId() == 6)).findFirst().orElse(-1);
			if (index != -1) {
				if (depList.get(index).getPrevStatus() == null) {
					depList.get(index).setPrevStatus("n");
				}
				if (depListDto.get(index).getPrevStatus() == null) {
					depListDto.get(index).setPrevStatus("n");
				}
				if (!depList.get(index).getPrevStatus().equals(depListDto.get(index).getPrevStatus())) {
					depList.get(index).setPrevStatus(depList.get(index).getStatus());
				}
				if (!depList.get(index).getStatus().equals(orderDto.getMwe())) {
					((OrderDepartment) depList.get(index)).setStatus(orderDto.getMwe());
				}
			}
		}

		if (orderType.equals(orderTypeDto) && orderType.equals("MSP")) {
			order.setMonLb(orderDto.getMonLb());
			order.setSer(orderDto.getSer());

			int index = IntStream.range(0, depList.size())
					.filter(i -> (((OrderDepartment) depList.get(i)).getDepId() == 4)).findFirst().orElse(-1);
			if (index != -1) {
				if (depList.get(index).getPrevStatus() == null) {
					depList.get(index).setPrevStatus("n");
				}
				if (depListDto.get(index).getPrevStatus() == null) {
					depListDto.get(index).setPrevStatus("n");
				}
				if (!depList.get(index).getPrevStatus().equals(depListDto.get(index).getPrevStatus())) {
					depList.get(index).setPrevStatus(depList.get(index).getStatus());
				}
				if (!depList.get(index).getStatus().equals(orderDto.getMonLb())) {
					((OrderDepartment) depList.get(index)).setStatus(orderDto.getMonLb());
				}
			}

			int serIndex = IntStream.range(0, depList.size())
					.filter(i -> (((OrderDepartment) depList.get(i)).getDepId() == 7)).findFirst().orElse(-1);
			if (serIndex != -1) {
				if (depList.get(serIndex).getPrevStatus() == null) {
					depList.get(serIndex).setPrevStatus("n");
				}
				if (depListDto.get(serIndex).getPrevStatus() == null) {
					depListDto.get(serIndex).setPrevStatus("n");
				}
				if (!depList.get(serIndex).getPrevStatus().equals(depListDto.get(serIndex).getPrevStatus())) {
					depList.get(serIndex).setPrevStatus(depList.get(serIndex).getStatus());
				}
				if (!depList.get(serIndex).getStatus().equals(orderDto.getSer())) {
					((OrderDepartment) depList.get(serIndex)).setStatus(orderDto.getSer());
				}
			}
		}

		if (orderType.equals(orderTypeDto) && orderType.equals("MSE")) {
			order.setMonTr(orderDto.getMonTr());
			order.setSer(orderDto.getSer());

			int index = IntStream.range(0, depList.size())
					.filter(i -> (((OrderDepartment) depList.get(i)).getDepId() == 5)).findFirst().orElse(-1);
			if (index != -1) {
				if (depList.get(index).getPrevStatus() == null) {
					depList.get(index).setPrevStatus("n");
				}
				if (depListDto.get(index).getPrevStatus() == null) {
					depListDto.get(index).setPrevStatus("n");
				}
				if (!depList.get(index).getPrevStatus().equals(depListDto.get(index).getPrevStatus())) {
					depList.get(index).setPrevStatus(depList.get(index).getStatus());
				}
				if (!depList.get(index).getStatus().equals(orderDto.getMonTr())) {
					((OrderDepartment) depList.get(index)).setStatus(orderDto.getMonTr());
				}
			}

			int serIndex = IntStream.range(0, depList.size())
					.filter(i -> (((OrderDepartment) depList.get(i)).getDepId() == 7)).findFirst().orElse(-1);
			if (serIndex != -1) {
				if (depList.get(serIndex).getPrevStatus() == null) {
					depList.get(serIndex).setPrevStatus("n");
				}
				if (depListDto.get(serIndex).getPrevStatus() == null) {
					depListDto.get(serIndex).setPrevStatus("n");
				}
				if (!depList.get(serIndex).getPrevStatus().equals(depListDto.get(serIndex).getPrevStatus())) {
					depList.get(serIndex).setPrevStatus(depList.get(serIndex).getStatus());
				}
				if (!depList.get(serIndex).getStatus().equals(orderDto.getSer())) {
					((OrderDepartment) depList.get(serIndex)).setStatus(orderDto.getSer());
				}
			}
		}

		if (orderType.equals(orderTypeDto) && orderType.equals("MLE")) {
			order.setMonTr(orderDto.getMonTr());
			order.setTra(orderDto.getTra());

			int index = IntStream.range(0, depList.size())
					.filter(i -> (((OrderDepartment) depList.get(i)).getDepId() == 5)).findFirst().orElse(-1);
			if (index != -1) {
				if (depList.get(index).getPrevStatus() == null) {
					depList.get(index).setPrevStatus("n");
				}
				if (depListDto.get(index).getPrevStatus() == null) {
					depListDto.get(index).setPrevStatus("n");
				}
				if (!depList.get(index).getPrevStatus().equals(depListDto.get(index).getPrevStatus())) {
					depList.get(index).setPrevStatus(depList.get(index).getStatus());
				}
				if (!depList.get(index).getStatus().equals(orderDto.getMonTr())) {
					((OrderDepartment) depList.get(index)).setStatus(orderDto.getMonTr());
				}
			}

			int index2 = IntStream.range(0, depList.size())
					.filter(i -> (((OrderDepartment) depList.get(i)).getDepId() == 8)).findFirst().orElse(-1);
			if (index2 != -1) {
				if (depList.get(index2).getPrevStatus() == null) {
					depList.get(index2).setPrevStatus("n");
				}
				if (depListDto.get(index2).getPrevStatus() == null) {
					depListDto.get(index2).setPrevStatus("n");
				}
				if (!depList.get(index2).getPrevStatus().equals(depListDto.get(index2).getPrevStatus())) {
					depList.get(index2).setPrevStatus(depList.get(index2).getStatus());
				}
				if (!depList.get(index2).getStatus().equals(orderDto.getTra())) {
					((OrderDepartment) depList.get(index2)).setStatus(orderDto.getTra());
				}
			}
		}

		if (orderType.equals(orderTypeDto) && orderType.equals("WEB")) {
			order.setTra(orderDto.getTra());

			int index = IntStream.range(0, depList.size())
					.filter(i -> (((OrderDepartment) depList.get(i)).getDepId() == 8)).findFirst().orElse(-1);
			if (index != -1) {
				if (depList.get(index).getPrevStatus() == null) {
					depList.get(index).setPrevStatus("n");
				}
				if (depListDto.get(index).getPrevStatus() == null) {
					depListDto.get(index).setPrevStatus("n");
				}
				if (!depList.get(index).getPrevStatus().equals(depListDto.get(index).getPrevStatus())) {
					depList.get(index).setPrevStatus(depList.get(index).getStatus());
				}
				if (!depList.get(index).getStatus().equals(orderDto.getTra())) {
					((OrderDepartment) depList.get(index)).setStatus(orderDto.getTra());
				}
			}
		}

		if (orderType.equals(orderTypeDto) && orderType.equals("BBA")) {
			order.setTra(orderDto.getTra());

			int index = IntStream.range(0, depList.size())
					.filter(i -> (((OrderDepartment) depList.get(i)).getDepId() == 8)).findFirst().orElse(-1);
			if (index != -1) {
				if (depList.get(index).getPrevStatus() == null) {
					depList.get(index).setPrevStatus("n");
				}
				if (depListDto.get(index).getPrevStatus() == null) {
					depListDto.get(index).setPrevStatus("n");
				}
				if (!depList.get(index).getPrevStatus().equals(depListDto.get(index).getPrevStatus())) {
					depList.get(index).setPrevStatus(depList.get(index).getStatus());
				}
				if (!depList.get(index).getStatus().equals(orderDto.getTra())) {
					((OrderDepartment) depList.get(index)).setStatus(orderDto.getTra());
				}
			}
		}

		if (order.getExclamation() == null) {
			order.setExclamation("");
		}
		if (orderDto.getExclamation() == null) {
			orderDto.setExclamation("");
		}

		if (order.getExclamation().equals("JA") && orderDto.getExclamation().equals("NEE")) {
			order.setExclamation("NEE");
		}

		if ((order.getExclamation().equals("NEE") || order.getExclamation().equals(""))
				&& orderDto.getExclamation().equals("JA")) {
			order.setExclamation("JA");
		}

		if (depList != null) {
			if (orderDto.getBackOrder() == null) {
				orderDto.setBackOrder("");
			}
			if (orderDto.getBackOrder() != null && !orderDto.getBackOrder().equals("")
					&& !orderDto.getBackOrder().equals("O")) {
				order.setBackOrder(orderDto.getBackOrder());
			} else if ((orderDto.getBackOrder() == null || orderDto.getBackOrder().equals("")
					|| orderDto.getBackOrder().equals("O"))
					&& (order.getBackOrder() != null || !order.getBackOrder().equals("")
							|| !order.getBackOrder().equals("O"))) {
				order.setBackOrder("O");
			}

			if (orderDto.getSme() != null) {
				if (orderDto.getSme() != null || orderDto.getSme() != "") {
					order.setSme(orderDto.getSme());
					if (!depList.stream().anyMatch(dep -> (dep.getDepId() == 2))) {
						if (!depList.stream().anyMatch(dep -> (dep.getDepId() == 1))) {
							depList.add(0, new OrderDepartment(2, "SME", "R", dtoToOrder(orderDto)));
						} else {
							depList.add(1, new OrderDepartment(2, "SME", "R", dtoToOrder(orderDto)));
						}
					} else {
						int index = IntStream.range(0, depList.size())
								.filter(i -> (((OrderDepartment) depList.get(i)).getDepId() == 2)).findFirst()
								.orElse(-1);
						if (index != -1) {
							if (depList.get(index).getPrevStatus() == null) {
								depList.get(index).setPrevStatus("n");
							}
							if (depListDto.get(index).getPrevStatus() == null) {
								depListDto.get(index).setPrevStatus("n");
							}
							if (!depList.get(index).getPrevStatus().equals(depListDto.get(index).getPrevStatus())) {
								depList.get(index).setPrevStatus(depList.get(index).getStatus());
							}
							if (!depList.get(index).getStatus().equals(orderDto.getSme())) {
								((OrderDepartment) depList.get(index)).setStatus(orderDto.getSme());
							}
						}
					}
				} else if ((orderDto.getSme() == null || orderDto.getSme().equals(""))
						&& (order.getSme() != null || !order.getSme().equals(""))) {
					int index = IntStream.range(0, depList.size())
							.filter(i -> (((OrderDepartment) depList.get(i)).getDepId() == 2)).findFirst().orElse(-1);
					if (index != -1) {
						if (depList.get(index).getPrevStatus() == null) {
							depList.get(index).setPrevStatus("n");
						}
						if (depListDto.get(index).getPrevStatus() == null) {
							depListDto.get(index).setPrevStatus("n");
						}
						if (!depList.get(index).getPrevStatus().equals(depListDto.get(index).getPrevStatus())) {
							depList.get(index).setPrevStatus(depList.get(index).getStatus());
						}
						if (!depList.get(index).getStatus().equals(orderDto.getSme())) {
							((OrderDepartment) depList.get(index)).setStatus(orderDto.getSme());
						}
					}
				}

				if (orderDto.getSpu() == null) {
					orderDto.setSpu("");
				}
				if (orderDto.getSpu() != null || orderDto.getSpu() != "") {
					order.setSpu(orderDto.getSpu());
					if (!depList.stream().anyMatch(dep -> (dep.getDepId() == 3))) {
						if (!depList.stream().anyMatch(dep -> (dep.getDepId() == 1))
								&& !depList.stream().anyMatch(dep -> (dep.getDepId() == 2))) {
							depList.add(0, new OrderDepartment(3, "SPU", "R", dtoToOrder(orderDto)));
						} else if (depList.stream().anyMatch(dep -> (dep.getDepId() == 1))
								&& depList.stream().anyMatch(dep -> (dep.getDepId() == 2))) {
							depList.add(2, new OrderDepartment(3, "SPU", "R", dtoToOrder(orderDto)));
						} else if (depList.stream().anyMatch(dep -> (dep.getDepId() == 1))
								|| depList.stream().anyMatch(dep -> (dep.getDepId() == 2))) {
							depList.add(1, new OrderDepartment(3, "SPU", "R", dtoToOrder(orderDto)));
						}
					} else {
						int index = IntStream.range(0, depList.size())
								.filter(i -> (((OrderDepartment) depList.get(i)).getDepId() == 3)).findFirst()
								.orElse(-1);
						if (index != -1) {
							if (depList.get(index).getPrevStatus() == null) {
								depList.get(index).setPrevStatus("n");
							}
							if (depListDto.get(index).getPrevStatus() == null) {
								depListDto.get(index).setPrevStatus("n");
							}
							if (!depList.get(index).getPrevStatus().equals(depListDto.get(index).getPrevStatus())) {
								depList.get(index).setPrevStatus(depList.get(index).getStatus());
							}
							if (!depList.get(index).getStatus().equals(orderDto.getSpu())) {
								((OrderDepartment) depList.get(index)).setStatus(orderDto.getSpu());
							}
						}
					}
				} else if ((orderDto.getSpu() == null || orderDto.getSpu().equals(""))
						&& (order.getSme() != null || !order.getSme().equals(""))) {
					int index = IntStream.range(0, depList.size())
							.filter(i -> (((OrderDepartment) depList.get(i)).getDepId() == 3)).findFirst().orElse(-1);
					if (index != -1) {
						if (depList.get(index).getPrevStatus() == null) {
							depList.get(index).setPrevStatus("n");
						}
						if (depListDto.get(index).getPrevStatus() == null) {
							depListDto.get(index).setPrevStatus("n");
						}
						if (!depList.get(index).getPrevStatus().equals(depListDto.get(index).getPrevStatus())) {
							depList.get(index).setPrevStatus(depList.get(index).getStatus());
						}
						if (!depList.get(index).getStatus().equals(orderDto.getSpu())) {
							((OrderDepartment) depList.get(index)).setStatus(orderDto.getSpu());
						}
					}
				}
			}
		}
		order.setDepartments(depList);

		boolean allStatusGOrEmpty = orderDto.getDepartments().stream()
				.allMatch(department -> "G".equals(department.getStatus()) || "".equals(department.getStatus()));
		if (allStatusGOrEmpty) {
			order.setCompleted("C");
			orderDto.setCompleted("C");
		}
	}

	@Override
	@Transactional
	public Boolean updateTraColors(String ids, Long entryId) {
		String color = "";
		String prev = "";
		List<Integer> idList = new ArrayList<>();

		String[] idArray = ids.split(",");
		for (String id : idArray) {
			String trimmedId = id.trim();
			if (!trimmedId.isEmpty()) {
				int parsedId = Integer.parseInt(trimmedId);
				idList.add(parsedId);
			}
		}
		for (String key : ordersMap.keySet()) {

			OrderDto orderDto = ordersMap.get(key);

			if (idList.contains(orderDto.getId())) {
				if ("R".equals(orderDto.getTra())) {
					orderDto.setTra("Y");
					color = "Y";
				} else if ("Y".equals(orderDto.getTra())) {
					orderDto.setTra("G");
					color = "G";
				}

				List<OrderDepartment> depList = orderDto.getDepartments();
				for (OrderDepartment dep : depList) {
					if ("TRA".equals(dep.getDepName())) {
						if ("R".equals(dep.getStatus())) {
							dep.setStatus("Y");
							dep.setPrevStatus("R");

							prev = dep.getPrevStatus();
						} else if ("Y".equals(dep.getStatus())) {
							dep.setStatus("G");
							dep.setPrevStatus("Y");

							prev = dep.getPrevStatus();
						}
					}
				}

				boolean allStatusGOrEmpty = orderDto.getDepartments().stream().allMatch(
						department -> "G".equals(department.getStatus()) || "".equals(department.getStatus()));

				if (allStatusGOrEmpty) {
					orderDto.setCompleted("C");
				}
				ordersMap.put(key, orderDto);
			}
		}

		if (color.equals("Y")) {

			orderRepo.updateFieldForRIds(color, idList);
			orderRepo.updateOrderDepartmentStatusR(color, prev, idList);
			return true;
		}

		else if (color.equals("G")) {

			orderRepo.updateFieldForYIds(color, idList);
			orderRepo.updateOrderDepartmentStatusY(color, prev, idList);

			this.moveToArchive(idList);

			return true;
			// new OrderTRAServiceImp().deleteOrderTRA(entryId);

		} else {
			return false;
		}
	}

	public Order dtoToOrder(OrderDto orderDto) {
		Order order = (Order) this.modelMapper.map(orderDto, Order.class);
		return order;
	}

	public OrderDto orderToDto(Order order) {
		OrderDto orderDto = (OrderDto) this.modelMapper.map(order, OrderDto.class);
		return orderDto;
	}

}
