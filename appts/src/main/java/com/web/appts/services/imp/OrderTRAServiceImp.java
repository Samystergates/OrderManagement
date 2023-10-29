package com.web.appts.services.imp;

import java.io.ByteArrayOutputStream;
import java.io.IOException;
import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.ArrayList;
import java.util.Arrays;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.function.Function;
import java.util.stream.Collectors;

import org.modelmapper.ModelMapper;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import com.itextpdf.text.BaseColor;
import com.itextpdf.text.Chunk;
import com.itextpdf.text.Document;
import com.itextpdf.text.DocumentException;
import com.itextpdf.text.Element;
import com.itextpdf.text.Font;
import com.itextpdf.text.FontFactory;
import com.itextpdf.text.Paragraph;
import com.itextpdf.text.Phrase;
import com.itextpdf.text.Rectangle;
import com.itextpdf.text.pdf.PdfPCell;
import com.itextpdf.text.pdf.PdfPTable;
import com.itextpdf.text.pdf.PdfWriter;
import com.itextpdf.text.pdf.draw.LineSeparator;
import com.web.appts.DTO.OrderDto;
import com.web.appts.DTO.OrderTRADto;
import com.web.appts.entities.OrderTRA;
import com.web.appts.exceptions.ResourceNotFoundException;
import com.web.appts.repositories.OrderTRARepo;
import com.web.appts.services.OrderTRAService;

@Service
public class OrderTRAServiceImp implements OrderTRAService {

	@Autowired
	OrderTRARepo orderTRARepo;
	@Autowired
	private ModelMapper modelMapper;
	@Autowired
	OrderServiceImp orderServiceImp;

	Map<String, OrderTRADto> traOrdersMap = new HashMap<>();

	@Override
	public OrderTRADto createOrderTRA(OrderTRADto orderTRADto) {
		OrderTRA orderTRA = dtoToTra(orderTRADto);
		OrderTRA savedOrderTRA = (OrderTRA) this.orderTRARepo.save(orderTRA);
		if (!traOrdersMap.isEmpty()) {
			boolean idExists = traOrdersMap.values().stream().anyMatch(val -> val.getId() == orderTRADto.getId());
			if (!idExists) {
				this.traOrdersMap.put(
						savedOrderTRA.getId() + "," + savedOrderTRA.getRouteDate() + "," + savedOrderTRA.getRoute(),
						traToDto(savedOrderTRA));
			}
		}
		return traToDto(savedOrderTRA);
	}

	@Override
	public OrderTRADto updateOrderTRA(OrderTRADto orderTRADto) {
		OrderTRA orderTRA = dtoToTra(orderTRADto);
		OrderTRA savedOrderTRA = this.orderTRARepo.save(orderTRA);
		Map<String, OrderTRADto> filteredMap = traOrdersMap.values().stream()
				.filter(val -> val.getId() != orderTRADto.getId()).collect(Collectors.toMap(
						val -> val.getId() + "," + val.getRouteDate() + "," + val.getRoute(), Function.identity()));
		traOrdersMap.clear();
		traOrdersMap.putAll(filteredMap);
		traOrdersMap.put(savedOrderTRA.getId() + "," + savedOrderTRA.getRouteDate() + "," + savedOrderTRA.getRoute(),
				traToDto(savedOrderTRA));
		return traToDto(savedOrderTRA);
	}

	@Override
	public Boolean deleteOrderTRA(Long orderTRAId) {
		OrderTRA orderTRA = this.orderTRARepo.findById(orderTRAId)
				.orElseThrow(() -> new ResourceNotFoundException("orderTRA", "id", orderTRAId.intValue()));
		orderTRARepo.delete(orderTRA);
		Map<String, OrderTRADto> filteredMap = traOrdersMap.values().stream()
				.filter(val -> val.getId() != orderTRA.getId()).collect(Collectors.toMap(
						val -> val.getId() + "," + val.getRouteDate() + "," + val.getRoute(), Function.identity()));
		traOrdersMap.clear();
		traOrdersMap.putAll(filteredMap);
		return true;
	}

	@Override
	public OrderTRADto getOrderTRA(Long orderTRAId) {
		OrderTRA orderTRA = this.orderTRARepo.findById(orderTRAId)
				.orElseThrow(() -> new ResourceNotFoundException("orderTRA", "id", orderTRAId.intValue()));
		return traToDto(orderTRA);
	}

	public Map<String, OrderTRADto> getAllTraOrders() {
		if (this.traOrdersMap.isEmpty()) {
			List<OrderTRA> allTraOrders = this.orderTRARepo.findAll();
			if (allTraOrders.isEmpty() || allTraOrders == null) {
				return null;
			}
			for (OrderTRA orderTRA : allTraOrders) {
				this.traOrdersMap.put(orderTRA.getId() + "," + orderTRA.getRouteDate() + "," + orderTRA.getRoute(),
						traToDto(orderTRA));
			}
			return this.traOrdersMap;
		}
		return this.traOrdersMap;
	}

	public OrderTRA dtoToTra(OrderTRADto orderTRADto) {
		OrderTRA trailerInfo = this.modelMapper.map(orderTRADto, OrderTRA.class);
		return trailerInfo;
	}

	public OrderTRADto traToDto(OrderTRA orderTRA) {
		OrderTRADto orderTRADto = this.modelMapper.map(orderTRA, OrderTRADto.class);
		return orderTRADto;
	}

	@Override
	public Boolean updateOrderTRAColors(String orderTRAIds, Long id) {
		return orderServiceImp.updateTraColors(orderTRAIds, id);
	}

	public byte[] generateTRAPdf(OrderTRADto orderTRADto) {
		List<Integer> idList = new ArrayList<>();

		String[] idArray = orderTRADto.getOrderIds().split(",");
		for (String id : idArray) {
			String trimmedId = id.trim();
			if (!trimmedId.isEmpty()) {
				int parsedId = Integer.parseInt(trimmedId);
				idList.add(parsedId);
			}
		}

		Map<String, OrderDto> ordersMap = orderServiceImp.getMap();
		List<OrderDto> objects = ordersMap.values().stream().filter(orderDto -> idList.contains(orderDto.getId()))
				.collect(Collectors.toList());

		try (ByteArrayOutputStream outputStream = new ByteArrayOutputStream()) {

			Document document = new Document();
			PdfWriter.getInstance(document, outputStream);
			document.open();

			addHeadingAndAddress(document, "Dagrapport");

			addAdditionalInformation(document, orderTRADto);

			addOrdersTable(document, objects);

			System.out.println("Closing Document");
			document.close();

			return outputStream.toByteArray();
		} catch (DocumentException | IOException e) {
			e.printStackTrace();
			return new byte[0];
		}
	}

	private void addHeadingAndAddress(Document document, String heading) throws DocumentException {
		Font font = new Font(Font.FontFamily.HELVETICA, 18, Font.BOLD);
		Font font2 = new Font(Font.FontFamily.HELVETICA, 10);
		Font font3 = new Font(Font.FontFamily.HELVETICA, 10, Font.BOLD);
		Font font4 = new Font(Font.FontFamily.HELVETICA, 10);

		PdfPTable mainTable = new PdfPTable(3);
		mainTable.setWidthPercentage(100);

		PdfPCell cell1 = new PdfPCell();
		Paragraph paragraph = new Paragraph("", font);
		paragraph.setAlignment(Element.ALIGN_RIGHT);
		cell1.addElement(paragraph);
		cell1.setBorder(Rectangle.NO_BORDER);
		mainTable.addCell(cell1);
		// First column:
		PdfPCell cell2 = new PdfPCell();
		Paragraph paragraph2 = new Paragraph(heading, font);
		Paragraph paragraph22 = new Paragraph("Divers", font2);
		paragraph2.setAlignment(Element.ALIGN_CENTER);
		paragraph22.setAlignment(Element.ALIGN_CENTER);
		cell2.addElement(paragraph2);
		cell2.addElement(paragraph22);
		cell2.setBorder(Rectangle.NO_BORDER);
		mainTable.addCell(cell2);

		// Second column:
		PdfPCell cell3 = new PdfPCell();
		Paragraph paragraph3 = new Paragraph("De Molen Banden B.V.", font3);
		Paragraph paragraph4 = new Paragraph("Rustvenseweg 2" + "\n" + "5375 KW REEK", font4);
		paragraph3.setAlignment(Element.ALIGN_RIGHT);
		paragraph4.setAlignment(Element.ALIGN_RIGHT);
		cell3.addElement(paragraph3);
		cell3.addElement(paragraph4);
		cell3.setBorder(Rectangle.NO_BORDER);
		mainTable.addCell(cell3);

		mainTable.setSpacingAfter(10);
		document.add(mainTable);
	}

	private void addAdditionalInformation(Document document, OrderTRADto orderTRADto) throws DocumentException {

		LocalDateTime dateTime = LocalDateTime.parse(orderTRADto.getRouteDate(), DateTimeFormatter.ISO_DATE_TIME);

		DateTimeFormatter dateFormatter = DateTimeFormatter.ofPattern("yyyy-MM-dd");
		String formattedDate = dateTime.format(dateFormatter);

		Font font = new Font(Font.FontFamily.HELVETICA, 10);
		PdfPTable mainTable = new PdfPTable(2);
		mainTable.setWidthPercentage(100);
		PdfPCell cell1 = new PdfPCell();
		Paragraph paragraphL1 = new Paragraph(String.format("%-30s%-30s", "Datum:", formattedDate), font);
		Paragraph paragraphL2 = new Paragraph(
				String.format("\n" + "%-29s%-29s", "Chauffeur:", orderTRADto.getChauffeur()), font);
		Paragraph paragraphL3 = new Paragraph(String.format("\n" + "%-28s%-28s", "Kenteken:", "____________________"),
				font);
		Paragraph paragraphL4 = new Paragraph(String.format("\n" + "%-30s%-30s", "Oplegger:", orderTRADto.getTrailer()),
				font);
		Paragraph paragraphL5 = new Paragraph(
				String.format("\n" + "%-25s%-25s", "Aavang weektijd", "____________________"), font);
		Paragraph paragraphL6 = new Paragraph(
				String.format("\n" + "%-27s%-27s", "Einde weektijd:", "____________________"), font);

		paragraphL1.setAlignment(Element.ALIGN_LEFT);
		paragraphL2.setAlignment(Element.ALIGN_LEFT);
		paragraphL3.setAlignment(Element.ALIGN_LEFT);
		paragraphL4.setAlignment(Element.ALIGN_LEFT);
		paragraphL5.setAlignment(Element.ALIGN_LEFT);
		paragraphL6.setAlignment(Element.ALIGN_LEFT);

		cell1.addElement(paragraphL1);
		cell1.addElement(paragraphL2);
		cell1.addElement(paragraphL3);
		cell1.addElement(paragraphL4);
		cell1.addElement(paragraphL5);
		cell1.addElement(paragraphL6);

		cell1.setBorder(Rectangle.NO_BORDER);
		mainTable.addCell(cell1);

		// second column
		PdfPCell cell2 = new PdfPCell();
		Paragraph paragraph2 = new Paragraph(String.format("%-10s%-10s", "Eindstand KM:", "________________________"),
				font);
		Paragraph paragraph3 = new Paragraph(
				String.format("\n" + "%-10s%-10s", "Beginstand KM:", "________________________"), font);
		Paragraph paragraph4 = new Paragraph(
				String.format("\n" + "%-10s%-10s", "Aantal KM:", "________________________"), font);
		Paragraph paragraph5 = new Paragraph(String.format("\n" + "%-10s%-10s", "Kosten:", "________________________"),
				font);
		Paragraph paragraph6 = new Paragraph(
				String.format("\n" + "%-10s%-10s", "Aanvang pauze:", "________________________"), font);
		Paragraph paragraph7 = new Paragraph(
				String.format("\n" + "%-10s%-10s", "Einde pauze:", "________________________"), font);

		paragraph2.setAlignment(Element.ALIGN_RIGHT);
		paragraph3.setAlignment(Element.ALIGN_RIGHT);
		paragraph4.setAlignment(Element.ALIGN_RIGHT);
		paragraph5.setAlignment(Element.ALIGN_RIGHT);
		paragraph6.setAlignment(Element.ALIGN_RIGHT);
		paragraph7.setAlignment(Element.ALIGN_RIGHT);

		cell2.addElement(paragraph2);
		cell2.addElement(paragraph3);
		cell2.addElement(paragraph4);
		cell2.addElement(paragraph5);
		cell2.addElement(paragraph6);
		cell2.addElement(paragraph7);

		cell2.setBorder(Rectangle.NO_BORDER);
		mainTable.addCell(cell2);

		mainTable.setSpacingAfter(40);
		document.add(mainTable);
	}

	private void addOrdersTable(Document document, List<OrderDto> objects) throws DocumentException {
		PdfPTable table = new PdfPTable(6);
		table.setWidthPercentage(100);

		float[] columnWidths = { 10f, 35f, 10f, 19f, 7f, 19f };
		table.setWidths(columnWidths);

		table.setSpacingBefore(3f);
		table.setSpacingAfter(3f);

		Font font2 = new Font(Font.FontFamily.HELVETICA, 10);
		Font font3 = new Font(Font.FontFamily.HELVETICA, 10, Font.BOLD);

		PdfPCell headerCell = createHeaderCell("Order", font3);
		PdfPCell headerCell2 = createHeaderCell("Naam", font3);
		PdfPCell headerCell3 = createHeaderCell("Postcode", font3);
		PdfPCell headerCell4 = createHeaderCell("Plaat", font3);
		PdfPCell headerCell5 = createHeaderCell("Land", font3);
		PdfPCell headerCell6 = createHeaderCell("Opmerking", font3);

		table.addCell(headerCell);
		table.addCell(headerCell2);
		table.addCell(headerCell3);
		table.addCell(headerCell4);
		table.addCell(headerCell5);
		table.addCell(headerCell6);

		for (int i = 0; i < 20; i++) {
			if (i < objects.size()) {
				PdfPCell cell1 = createCell(objects.get(i).getOrderNumber(), font2);
				PdfPCell cell2 = createCell(objects.get(i).getCustomerName(), font2);
				PdfPCell cell3 = createCell(objects.get(i).getPostCode(), font2);
				PdfPCell cell4 = createCell(objects.get(i).getCity(), font2);
				PdfPCell cell5 = createCell(objects.get(i).getCountry(), font2);
				PdfPCell cell6 = createCell("", font2);

				table.addCell(cell1);
				table.addCell(cell2);
				table.addCell(cell3);
				table.addCell(cell4);
				table.addCell(cell5);
				table.addCell(cell6);

				cell1.setFixedHeight(20f);
				cell2.setFixedHeight(20f);
				cell3.setFixedHeight(20f);
				cell4.setFixedHeight(20f);
				cell5.setFixedHeight(20f);
				cell6.setFixedHeight(20f);
			} else {
				if(objects.size() < 10) {
				for (int j = 0; j < 6; j++) {
					PdfPCell cell = createCell("", font2);
					cell.setFixedHeight(20f);
					table.addCell(cell);
				}
				}
			}
		}

		document.add(table);
	}

	private PdfPCell createHeaderCell(String text, Font font) {
		PdfPCell headerCell = new PdfPCell(new Phrase(text, font));
		headerCell.setBackgroundColor(BaseColor.LIGHT_GRAY);
		headerCell.setHorizontalAlignment(Element.ALIGN_CENTER);
		headerCell.setBorderWidth(0.3f); // Set the border width to a thinner value
		headerCell.setPadding(2f); // Set padding inside the cell
		return headerCell;
	}

	private PdfPCell createCell(String text, Font font) {
		PdfPCell cell = new PdfPCell(new Phrase(text, font));
		cell.setHorizontalAlignment(Element.ALIGN_CENTER);
		cell.setVerticalAlignment(Element.ALIGN_MIDDLE);
		cell.setBorderWidth(0.3f); // Set the border width to a thinner value
		cell.setPadding(2f); // Set padding inside the cell
		return cell;
	}
//
//	private void addSeparatorLine(Document document) throws DocumentException {
//		System.out.println("Adding Separator Line - Start");
//		LineSeparator line = new LineSeparator();
//		addEmptyLine(document, 1); // Add some space before the line
//		document.add(new Chunk(line));
//		addEmptyLine(document, 1); // Add some space after the line
//		System.out.println("Adding Separator Line - End");
//	}

//	private void addEmptyLine(Document document, int lines) throws DocumentException {
//		for (int i = 0; i < lines; i++) {
//			document.add(Chunk.NEWLINE);
//		}
//	}

}
