package com.web.appts.services.imp;

import java.io.ByteArrayOutputStream;
import java.io.IOException;
import java.text.SimpleDateFormat;
import java.util.Date;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

import org.modelmapper.ModelMapper;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import com.itextpdf.text.BaseColor;
import com.itextpdf.text.Document;
import com.itextpdf.text.DocumentException;
import com.itextpdf.text.Element;
import com.itextpdf.text.Font;
import com.itextpdf.text.Image;
import com.itextpdf.text.Paragraph;
import com.itextpdf.text.Phrase;
import com.itextpdf.text.Rectangle;
import com.itextpdf.text.pdf.Barcode128;
import com.itextpdf.text.pdf.ColumnText;
import com.itextpdf.text.pdf.PdfContentByte;
import com.itextpdf.text.pdf.PdfPCell;
import com.itextpdf.text.pdf.PdfPTable;
import com.itextpdf.text.pdf.PdfWriter;
import com.web.appts.DTO.OrderDto;
import com.web.appts.DTO.OrderSMEDto;
import com.web.appts.DTO.OrderSPUDto;
import com.web.appts.DTO.WheelColorDto;
import com.web.appts.DTO.WheelMachineSizeDto;
import com.web.appts.entities.OrderSME;
import com.web.appts.entities.OrderSPU;
import com.web.appts.exceptions.ResourceNotFoundException;
import com.web.appts.repositories.OrderSMERepo;
import com.web.appts.repositories.OrderSPURepo;
import com.web.appts.services.OrderSMEService;
import com.web.appts.services.OrderSPUService;

@Service
public class OrderWheelsFlowService implements OrderSMEService, OrderSPUService {

	@Autowired
	OrderSPURepo orderSPURepo;
	@Autowired
	OrderSMERepo orderSMERepo;

	@Autowired
	OrderServiceImp orderServiceImp;
	@Autowired
	WheelServices wheelServices;

	Map<String, OrderSMEDto> orderSMEMap = new HashMap<>();
	Map<String, OrderSPUDto> orderSPUMap = new HashMap<>();

	@Autowired
	private ModelMapper modelMapper;

	@Override
	public OrderSPUDto createOrderSPU(OrderSPUDto orderSPUDto) {
		OrderSPUDto orderSPUDtoMapVal = getOrderSPU(orderSPUDto.getOrderNumber(), orderSPUDto.getProdNumber());
		if (orderSPUDtoMapVal == null) {
			OrderDto orderDto = orderServiceImp.getMap()
					.get(orderSPUDto.getOrderNumber() + "," + orderSPUDto.getProdNumber());
			orderDto.setSpu("R");
			orderServiceImp.updateOrder(orderDto, orderDto.getId(), true);
			OrderSPU orderSPUSaved = this.orderSPURepo.save(this.dtoToSPU(orderSPUDto));
			orderSPUMap.put(orderSPUSaved.getOrderNumber() + " - " + orderSPUSaved.getProdNumber(),
					this.spuToDto(orderSPUSaved));
			return this.spuToDto(orderSPUSaved);
		} else {
			orderSPUDto.setId(orderSPUDtoMapVal.getId());
			return updateOrderSPU(orderSPUDto);
		}
	}

	@Override
	public OrderSPUDto updateOrderSPU(OrderSPUDto orderSPUDto) {
		OrderSPU orderSPUUpdated = this.orderSPURepo.save(this.dtoToSPU(orderSPUDto));
		orderSPUMap.put(orderSPUUpdated.getOrderNumber() + " - " + orderSPUUpdated.getProdNumber(), orderSPUDto);
		return this.spuToDto(orderSPUUpdated);
	}

	@Override
	public Boolean deleteOrderSPU(Long orderSPUId) {
		OrderSPU orderSPU = this.orderSPURepo.findById(orderSPUId)
				.orElseThrow(() -> new ResourceNotFoundException("orderSPU", "id", orderSPUId.intValue()));
		OrderDto orderDto = orderServiceImp.getMap().get(orderSPU.getOrderNumber() + "," + orderSPU.getProdNumber());
		orderDto.setSpu("");
		orderServiceImp.updateOrder(orderDto, orderDto.getId(), true);
		orderSPUMap.remove(orderSPU.getOrderNumber() + " - " + orderSPU.getProdNumber());
		orderSPURepo.delete(orderSPU);
		return true;
	}

	@Override
	public OrderSPUDto getOrderSPU(String orderNumber, String prodNumber) {
		if (this.orderSPUMap.isEmpty() || !this.orderSPUMap.containsKey(orderNumber + " - " + prodNumber)) {
			OrderSPU orderSPU = orderSPURepo.findByOrderNumberAndProdNumber(orderNumber, prodNumber);
			if (orderSPU == null) {
				return null;
			}
			return this.spuToDto(orderSPU);
		} else {
			return this.orderSPUMap.get(orderNumber + " - " + prodNumber);
		}
	}

	@Override
	public OrderSMEDto createOrderSME(OrderSMEDto orderSMEDto) {
		OrderSMEDto orderSMEDtoMapVal = getOrderSME(orderSMEDto.getOrderNumber(), orderSMEDto.getProdNumber());
		if (orderSMEDtoMapVal == null) {
			OrderDto orderDto = orderServiceImp.getMap()
					.get(orderSMEDto.getOrderNumber() + "," + orderSMEDto.getProdNumber());
			orderDto.setSme("R");
			orderServiceImp.updateOrder(orderDto, orderDto.getId(), true);
			OrderSME orderSMESaved = this.orderSMERepo.save(this.dtoToSME(orderSMEDto));
			orderSMEMap.put(orderSMESaved.getOrderNumber() + " - " + orderSMESaved.getProdNumber(),
					this.smeToDto(orderSMESaved));
			return this.smeToDto(orderSMESaved);
		} else {
			orderSMEDto.setId(orderSMEDtoMapVal.getId());
			return updateOrderSME(orderSMEDto);
		}
	}

	@Override
	public OrderSMEDto updateOrderSME(OrderSMEDto orderSMEDto) {
		OrderSME orderSMEUpdated = this.orderSMERepo.save(this.dtoToSME(orderSMEDto));
		orderSMEMap.put(orderSMEUpdated.getOrderNumber() + " - " + orderSMEUpdated.getProdNumber(), orderSMEDto);
		return this.smeToDto(orderSMEUpdated);
	}

	@Override
	public Boolean deleteOrderSME(Long orderSMEId) {
		OrderSME orderSME = this.orderSMERepo.findById(orderSMEId)
				.orElseThrow(() -> new ResourceNotFoundException("orderSme", "id", orderSMEId.intValue()));
		Map<String, OrderDto> map = orderServiceImp.getMap();
		System.out.println(map);
		OrderDto orderDto = orderServiceImp.getMap().get(orderSME.getOrderNumber() + "," + orderSME.getProdNumber());
		orderDto.setSme("");
		orderServiceImp.updateOrder(orderDto, orderDto.getId(), true);
		orderSMEMap.remove(orderSME.getOrderNumber() + " - " + orderSME.getProdNumber());
		orderSMERepo.delete(orderSME);
		return true;
	}

	@Override
	public OrderSMEDto getOrderSME(String orderNumber, String prodNumber) {
		if (this.orderSMEMap.isEmpty() || !this.orderSMEMap.containsKey(orderNumber + " - " + prodNumber)) {
			OrderSME orderSME = orderSMERepo.findByOrderNumberAndProdNumber(orderNumber, prodNumber);
			if (orderSME == null) {
				return null;
			}
			return this.smeToDto(orderSME);
		} else {
			return this.orderSMEMap.get(orderNumber + " - " + prodNumber);
		}
	}

	@Override
	public List<OrderSPUDto> getAllSpu() {
		List<OrderSPU> listSpu = this.orderSPURepo.findAll();
		return listSpu.stream().map(spu -> spuToDto(spu)).collect(Collectors.toList());
	}

	@Override
	public List<OrderSMEDto> getAllSme() {
		List<OrderSME> listSme = this.orderSMERepo.findAll();
		return listSme.stream().map(sme -> smeToDto(sme)).collect(Collectors.toList());
	}

	public OrderSME dtoToSME(OrderSMEDto orderSMEDto) {
		OrderSME orderSME = (OrderSME) this.modelMapper.map(orderSMEDto, OrderSME.class);
		return orderSME;
	}

	public OrderSMEDto smeToDto(OrderSME orderSME) {
		OrderSMEDto orderSMEDto = (OrderSMEDto) this.modelMapper.map(orderSME, OrderSMEDto.class);
		return orderSMEDto;
	}

	public OrderSPU dtoToSPU(OrderSPUDto orderSPUDto) {
		OrderSPU orderSPU = (OrderSPU) this.modelMapper.map(orderSPUDto, OrderSPU.class);
		return orderSPU;
	}

	public OrderSPUDto spuToDto(OrderSPU orderSPU) {
		OrderSPUDto orderSPUDto = (OrderSPUDto) this.modelMapper.map(orderSPU, OrderSPUDto.class);
		return orderSPUDto;
	}

	public byte[] generateSMEPdf(String key) {

		String[] parts = key.split(",");
		OrderSMEDto orderSMEDto = getOrderSME(parts[0], parts[1]);

		try (ByteArrayOutputStream outputStream = new ByteArrayOutputStream()) {

			Document document = new Document();
			PdfWriter writer = PdfWriter.getInstance(document, outputStream);
			document.open();

			addSMEHeadingAndAddress(document, "Smederij Order");

			addSMEBloeHeadingAndInfo(writer, document, "", orderSMEDto);

			addSMEOptions(writer, document, orderSMEDto);

			addSMESections(writer, document);
			addSMEDatumSections(writer, document);
			System.out.println("Closing Document");
			document.close();

			return outputStream.toByteArray();
		} catch (DocumentException | IOException e) {
			e.printStackTrace();
			return new byte[0];
		}
	}
	private void addSMEHeadingAndAddress(Document document, String heading) throws DocumentException {
		Font font = new Font(Font.FontFamily.HELVETICA, 18, Font.BOLD);
		Font font2 = new Font(Font.FontFamily.COURIER, 25, Font.BOLD);
		Font font22 = new Font(Font.FontFamily.COURIER, 15, Font.BOLD);
		Font font3 = new Font(Font.FontFamily.HELVETICA, 10, Font.BOLD);
		Font font4 = new Font(Font.FontFamily.HELVETICA, 10);

		PdfPTable mainTable = new PdfPTable(3);
		mainTable.setWidthPercentage(100);

		PdfPCell cell1 = new PdfPCell();
		Paragraph paragraph = new Paragraph("DE MOLEN", font2);
		Paragraph paragraphbanden = new Paragraph("    BANDEN", font22);
		paragraph.setAlignment(Element.ALIGN_LEFT);
		paragraphbanden.setAlignment(Element.ALIGN_LEFT);
		cell1.addElement(paragraph);
		cell1.addElement(paragraphbanden);
		cell1.setBorder(Rectangle.NO_BORDER);
		mainTable.addCell(cell1);
		// First column:
		PdfPCell cell2 = new PdfPCell();
		Paragraph paragraph2 = new Paragraph(heading, font);
		paragraph2.setAlignment(Element.ALIGN_CENTER);
		cell2.addElement(paragraph2);
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

	private void addSMEBloeHeadingAndInfo(PdfWriter writer, Document document, String heading, OrderSMEDto orderSMEDto)
			throws DocumentException {
		Font font2 = new Font(Font.FontFamily.HELVETICA, 12);
		Font font4 = new Font(Font.FontFamily.HELVETICA, 10);

		PdfPTable mainTable = new PdfPTable(3);
		mainTable.setWidthPercentage(100);

		PdfPCell cell1 = new PdfPCell();
		Barcode128 barcode = new Barcode128();
		barcode.setCode(orderSMEDto.getOrderNumber());

		barcode.setFont(null);
		barcode.setBaseline(0);
		barcode.setBarHeight(15);

		PdfContentByte cb = writer.getDirectContent();

		Image image = barcode.createImageWithBarcode(cb, BaseColor.BLACK, BaseColor.BLACK);
		image.setAlignment(Element.ALIGN_LEFT);
		image.scalePercent(120);
		cell1.addElement(image);

		Paragraph labelParagraph = new Paragraph(String.format("%-9s%-9s", " ", orderSMEDto.getOrderNumber()), font2);

		labelParagraph.setAlignment(Element.ALIGN_LEFT);
		cell1.addElement(labelParagraph);
		cell1.setBorder(Rectangle.NO_BORDER);
		mainTable.addCell(cell1);

		// First column:
		PdfPCell cell2 = new PdfPCell();
		Paragraph paragraphL1 = new Paragraph(String.format("%-13s%-13s", " Naam Klant:", "De Molen Banden BV"), font4);
		Paragraph paragraphL2 = new Paragraph(String.format("%-16s%-16s", "\n Verkoop order:   ", orderSMEDto.getOrderNumber()), font4);
		Paragraph paragraphL3 = new Paragraph(String.format("%-16s%-16s", " Verkoop order:", ""), font4);
		paragraphL1.setAlignment(Element.ALIGN_LEFT);
		paragraphL2.setAlignment(Element.ALIGN_LEFT);
		paragraphL3.setAlignment(Element.ALIGN_LEFT);
		cell2.addElement(paragraphL1);
		cell2.addElement(paragraphL2);
		cell2.addElement(paragraphL3);
		cell2.setBorder(Rectangle.NO_BORDER);
		mainTable.addCell(cell2);
		
		

		PdfPCell cell3 = new PdfPCell();
		Paragraph paragraphR1 = new Paragraph(String.format(""), font4);
		paragraphR1.setAlignment(Element.ALIGN_CENTER);
		cell3.addElement(paragraphR1);
		cell3.setBorder(Rectangle.NO_BORDER);
		mainTable.addCell(cell3);

		mainTable.setSpacingAfter(30);
		document.add(mainTable);
	}

	private void addSMEOptions(PdfWriter writer, Document document, OrderSMEDto orderSMEDto) throws DocumentException {
		Font font4 = new Font(Font.FontFamily.HELVETICA, 10);
		Font font5 = new Font(Font.FontFamily.HELVETICA, 12);

		if(orderSMEDto.getMerk() == null) {
			orderSMEDto.setMerk("");
		}
		if (orderSMEDto.getModel() == null) {
			orderSMEDto.setModel("");
		}
		if (orderSMEDto.getType() == null) {
			orderSMEDto.setType("");
		}
		if (orderSMEDto.getNaafgat() == null) {
			orderSMEDto.setNaafgat("");
		}
		if (orderSMEDto.getSteek() == null) {
			orderSMEDto.setSteek("");
		}
		if (orderSMEDto.getAantalBoutgat() == null) {
			orderSMEDto.setAantalBoutgat("");
		}
		if (orderSMEDto.getVerdlingBoutgaten() == null) {
			orderSMEDto.setVerdlingBoutgaten("");
		}
		if (orderSMEDto.getDiameter() == null) {
			orderSMEDto.setDiameter("");
		}
		if (orderSMEDto.getTypeBoutgat() == null) {
			orderSMEDto.setTypeBoutgat("");
		}
		if (orderSMEDto.getEt() == null) {
			orderSMEDto.setEt("");
		}
		if (orderSMEDto.getAfstandVV() == null) {
			orderSMEDto.setAfstandVV("");
		}
		if (orderSMEDto.getAfstandVA() == null) {
			orderSMEDto.setAfstandVA("");
		}

		if (orderSMEDto.getDikte() == null) {
			orderSMEDto.setDikte("");
		}
		if (orderSMEDto.getDoorgezet() == null) {
			orderSMEDto.setDoorgezet("");
		}
		if (orderSMEDto.getKoelgaten() == null) {
			orderSMEDto.setKoelgaten("");
		}
		if (orderSMEDto.getVerstevigingsringen() == null) {
			orderSMEDto.setVerstevigingsringen("");
		}
		if (orderSMEDto.getAansluitnippel() == null) {
			orderSMEDto.setAansluitnippel("");
		}
		if (orderSMEDto.getVentielbeschermer() == null) {
			orderSMEDto.setVentielbeschermer("");
		}
		OrderDto orders = orderServiceImp.getMap()
				.get(orderSMEDto.getOrderNumber() + "," + orderSMEDto.getProdNumber());
		if (orders.getOmsumin() == null) {
			orders.setOmsumin("");
		}
		List<WheelMachineSizeDto> list = wheelServices.getAllWheelMachineSize();
		WheelMachineSizeDto wheelColorDto = list.stream()
				.filter(e -> e.getMerk().equals(orderSMEDto.getMerk())
						&& e.getModel().equals(orderSMEDto.getModel()))
				.findFirst().orElse(null);

		Paragraph labelParagraph2 = new Paragraph("Machine:   "+orderSMEDto.getMerk()+"               Model:   "+orderSMEDto.getModel()+"               Type:   "+orderSMEDto.getType(), font5);

		labelParagraph2.setSpacingAfter(7f);
		Paragraph labelParagraph3 = new Paragraph("\n                      Aantal:   " + orders.getAantal()
				+ "\n           Omschrijving:   " + orders.getOmsumin(), font4);
		labelParagraph3.setSpacingAfter(7f);
		Paragraph labelParagraph4 = new Paragraph(
				"\n                   Naafgat:   "+orderSMEDto.getNaafgat()+"      mm                                   Steelcirkel:     "+orderSMEDto.getSteek()+"      mm",font4);
		labelParagraph4.setSpacingAfter(7f);
		Paragraph labelParagraph5 = new Paragraph(
				"    Aantal Boutgaten:   "+orderSMEDto.getAantalBoutgat()+"                                  Verdeling Boutgaten:     "+orderSMEDto.getVerdlingBoutgaten(),font4);
		labelParagraph5.setSpacingAfter(7f);
		Paragraph labelParagraph6 = new Paragraph(
				"    Boutgat Diameter:   "+orderSMEDto.getDiameter()+"      mm               Uitvoering:     "+orderSMEDto.getTypeBoutgat()+""
						+ "        Maat Verzinking:    "+orderSMEDto.getMaatVerzinking()+"      mm",font4);
		labelParagraph6.setSpacingAfter(7f);
		Paragraph labelParagraph7 = new Paragraph(String.format("%-49s%-49s", " \n                           ET:     "+orderSMEDto.getEt(),"mm"), font4);
		labelParagraph7.setSpacingAfter(7f);
		Paragraph labelParagraph8 = new Paragraph(String.format("%-41s%-41s",  "    Afstand Voorzijde:     "+orderSMEDto.getAfstandVV(),"mm"), font4);
		labelParagraph8.setSpacingAfter(7f);
		Paragraph labelParagraph9 = new Paragraph(String.format("%-40s%-40s", " Afstand Achterzijde:     "+orderSMEDto.getAfstandVA(),"mm"), font4);
		labelParagraph9.setSpacingAfter(7f);
		Paragraph labelParagraph10 = new Paragraph(String.format("%-43s%-43s", "              Dikte Schijf:     "+orderSMEDto.getDikte(),"mm                   "
				+ "	                          Doorgezet:       "
				+ "                            Koigaten:  "), font4);
		labelParagraph10.setSpacingAfter(5f);
		Paragraph labelParagraph11 = new Paragraph(String.format("%-43s%-43s", "                                                       "
				+ "                                 Verstevigingsringen:     ","          Nippel (D/W systeem):  "), font4);
		labelParagraph11.setSpacingAfter(5f);
		Paragraph labelParagraph12 = new Paragraph(String.format("%-43s%-43s", "                                                   "
				+ "                                        Vientieleschermer:     "," "), font4);

		PdfContentByte cb = writer.getDirectContent();

		cb.rectangle(380f, 383f, 10f, 10f);
		cb.stroke();

		if (orderSMEDto.getDoorgezet().equals("JA")) {
			cb.moveTo(380f, 383f);
			cb.lineTo(390f, 393f);
			cb.moveTo(380f, 393f);
			cb.lineTo(390f, 383f);
		}

		PdfContentByte cb2 = writer.getDirectContent();

		cb2.rectangle(380f, 363f, 10f, 10f);
		cb2.stroke();

		if (orderSMEDto.getKoelgaten().equals("JA")) {
			cb2.moveTo(380f, 363f);
			cb2.lineTo(390f, 373f);
			cb2.moveTo(380f, 373f);
			cb2.lineTo(390f, 363f);
		}

		PdfContentByte cb3 = writer.getDirectContent();

		cb3.rectangle(380f, 343f, 10f, 10f);
		cb3.stroke();

		if (orderSMEDto.getVerstevigingsringen().equals("JA")) {
			cb3.moveTo(380f, 343f);
			cb3.lineTo(390f, 353f);
			cb3.moveTo(380f, 353f);
			cb3.lineTo(390f, 343f);
		}

		PdfContentByte cb4 = writer.getDirectContent();

		cb4.rectangle(520f, 383f, 10f, 10f);
		cb4.stroke();

		if (orderSMEDto.getAansluitnippel().equals("JA")) {
			cb4.moveTo(520f, 383f);
			cb4.lineTo(530f, 393f);
			cb4.moveTo(520f, 393f);
			cb4.lineTo(530f, 383f);
		}

		PdfContentByte cb5 = writer.getDirectContent();

		cb5.rectangle(520f, 363f, 10f, 10f);
		cb5.stroke();

		if (orderSMEDto.getVentielbeschermer().equals("JA")) {
			cb5.moveTo(520f, 363f);
			cb5.lineTo(530f, 373f);
			cb5.moveTo(520f, 373f);
			cb5.lineTo(530f, 363f);
		}

		labelParagraph12.setSpacingAfter(15f);
		document.add(labelParagraph2);
		document.add(labelParagraph3);
		document.add(labelParagraph4);
		document.add(labelParagraph5);
		document.add(labelParagraph6);
		document.add(labelParagraph7);
		document.add(labelParagraph8);
		document.add(labelParagraph9);
		document.add(labelParagraph10);

		document.add(labelParagraph11);
		document.add(labelParagraph12);
		

	}

	private void addSMESections(PdfWriter writer, Document document) throws DocumentException {
		Font font4 = new Font(Font.FontFamily.HELVETICA, 10);

		PdfPTable table = new PdfPTable(1);
		table.setWidthPercentage(100);

		PdfPCell cell = new PdfPCell();
		cell.setBorder(Rectangle.BOX);
		cell.setBorderColor(BaseColor.BLACK);
		cell.setBorderWidth(1f);

		cell.setMinimumHeight(150f);

		Paragraph textParagraph = new Paragraph("               Opmerking:", font4);
		cell.addElement(textParagraph);

		table.addCell(cell);

		table.setSpacingAfter(10f);

		PdfPTable table2 = new PdfPTable(1);
		table2.setWidthPercentage(100);

		PdfPCell cell2 = new PdfPCell();
		cell2.setBorder(Rectangle.BOX);
		cell2.setBorderColor(BaseColor.BLACK);
		cell2.setBorderWidth(1f);

		cell2.setMinimumHeight(60f);

		Paragraph textParagraph2 = new Paragraph(
				"          Flens voorradig : JA/NEE"
						+ "\n"
						+ "          Flens besteld : JA/NEE",
				font4);
		cell2.addElement(textParagraph2);

		table2.addCell(cell2);
		Date currentDate = new Date();

		SimpleDateFormat sdf = new SimpleDateFormat("MM/dd/yyyy");

		String formattedDate = sdf.format(currentDate);

		Paragraph printedDatePara = new Paragraph("Printed:    " + formattedDate);

		document.add(table);
		document.add(table2);
		document.add(printedDatePara);
	}

	private void addSMEDatumSections(PdfWriter writer, Document document) throws DocumentException {
		PdfPTable table3 = new PdfPTable(1);
		table3.setWidthPercentage(50);
		Font font4 = new Font(Font.FontFamily.HELVETICA, 10);
		PdfPCell cell3 = new PdfPCell();
		cell3.setBorder(Rectangle.BOX);
		cell3.setBorderColor(BaseColor.BLACK);
		cell3.setBorderWidth(1f);
		cell3.setMinimumHeight(50f);

		Paragraph textParagraph3 = new Paragraph("Datum klaar:", font4);
		cell3.addElement(textParagraph3);

		table3.addCell(cell3);
		table3.setSpacingAfter(10f);
		document.add(table3);
	}

	public byte[] generateSPUPdf(String key) {

		String[] parts = key.split(",");
		OrderSPUDto orderSPUDto = getOrderSPU(parts[0], parts[1]);

		try (ByteArrayOutputStream outputStream = new ByteArrayOutputStream()) {

			Document document = new Document();
			PdfWriter writer = PdfWriter.getInstance(document, outputStream);
			document.open();

			addSPUHeadingAndAddress(document, "Spuiterij Order");

			addSPUBloeHeadingAndInfo(writer, document, "", orderSPUDto);

			addSPUOptions(writer, document, orderSPUDto);

			addSPUSections(writer, document);
			addSPUDatumSections(writer, document);
			System.out.println("Closing Document");
			document.close();

			return outputStream.toByteArray();
		} catch (DocumentException | IOException e) {
			e.printStackTrace();
			return new byte[0];
		}
	}

	private void addSPUHeadingAndAddress(Document document, String heading) throws DocumentException {
		Font font = new Font(Font.FontFamily.HELVETICA, 18, Font.BOLD);
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
		paragraph2.setAlignment(Element.ALIGN_CENTER);
		cell2.addElement(paragraph2);
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

	private void addSPUBloeHeadingAndInfo(PdfWriter writer, Document document, String heading, OrderSPUDto orderSPUDto)
			throws DocumentException {
		Font font2 = new Font(Font.FontFamily.HELVETICA, 12);
		Font font3 = new Font(Font.FontFamily.HELVETICA, 10, Font.BOLD);
		Font font4 = new Font(Font.FontFamily.HELVETICA, 10);

		PdfPTable mainTable = new PdfPTable(3);
		mainTable.setWidthPercentage(100);

		PdfPCell cell1 = new PdfPCell();
		Barcode128 barcode = new Barcode128();
		barcode.setCode(orderSPUDto.getOrderNumber());

		barcode.setFont(null);
		barcode.setBaseline(0);
		barcode.setBarHeight(15);

		PdfContentByte cb = writer.getDirectContent();

		Image image = barcode.createImageWithBarcode(cb, BaseColor.BLACK, BaseColor.BLACK);
		image.setAlignment(Element.ALIGN_LEFT);
		image.scalePercent(120);
		cell1.addElement(image);

		Paragraph labelParagraph = new Paragraph(String.format("%-9s%-9s", " ", orderSPUDto.getOrderNumber()), font2);

		labelParagraph.setAlignment(Element.ALIGN_LEFT);
		cell1.addElement(labelParagraph);
		cell1.setBorder(Rectangle.NO_BORDER);
		mainTable.addCell(cell1);

		PdfPCell cell3 = new PdfPCell();
		Paragraph paragraphR1 = new Paragraph(String.format(""), font4);
		paragraphR1.setAlignment(Element.ALIGN_CENTER);
		cell3.addElement(paragraphR1);
		cell3.setBorder(Rectangle.NO_BORDER);
		mainTable.addCell(cell3);

		// First column:
		PdfPCell cell2 = new PdfPCell();
		Paragraph paragraphL1 = new Paragraph(String.format("%-16s%-16s", "Aan:", "vid Hurk Straalbedrijf"), font3);
		Paragraph paragraphL2 = new Paragraph(String.format("%-23s%-23s", "", "Het Geffens Veld 3"), font4);
		Paragraph paragraphL3 = new Paragraph(String.format("%-23s%-23s", "", "5386 LL GEFFEN"), font4);
		paragraphL1.setAlignment(Element.ALIGN_LEFT);
		paragraphL2.setAlignment(Element.ALIGN_LEFT);
		paragraphL3.setAlignment(Element.ALIGN_LEFT);
		cell2.addElement(paragraphL1);
		cell2.addElement(paragraphL2);
		cell2.addElement(paragraphL3);
		cell2.setBorder(Rectangle.NO_BORDER);
		mainTable.addCell(cell2);

		mainTable.setSpacingAfter(30);
		document.add(mainTable);
	}

	private void addSPUOptions(PdfWriter writer, Document document, OrderSPUDto orderSPUDto) throws DocumentException {

		Font font5 = new Font(Font.FontFamily.HELVETICA, 13);

		if(orderSPUDto.getPrijscode() == null) {
			orderSPUDto.setPrijscode("");
		}
		if (orderSPUDto.getAfdeling() == null) {
			orderSPUDto.setAfdeling("");
		}
		if (orderSPUDto.getStralen() == null) {
			orderSPUDto.setStralen("");
		}
		if (orderSPUDto.getStralenGedeeltelijk() == null) {
			orderSPUDto.setStralenGedeeltelijk("");
		}
		if (orderSPUDto.getSchooperen() == null) {
			orderSPUDto.setSchooperen("");
		}
		if (orderSPUDto.getKitten() == null) {
			orderSPUDto.setKitten("");
		}
		if (orderSPUDto.getPrimer() == null) {
			orderSPUDto.setPrimer("");
		}
		if (orderSPUDto.getOntlakken() == null) {
			orderSPUDto.setOntlakken("");
		}
		if (orderSPUDto.getKleurOmschrijving() == null) {
			orderSPUDto.setKleurOmschrijving("");
		}
		if (orderSPUDto.getBlankeLak() == null) {
			orderSPUDto.setBlankeLak("");
		}
		OrderDto orders = orderServiceImp.getMap()
				.get(orderSPUDto.getOrderNumber() + "," + orderSPUDto.getProdNumber());
		if (orders.getOmsumin() == null) {
			orders.setOmsumin("");
		}
		List<WheelColorDto> list = wheelServices.getAllWheelColors();
		WheelColorDto wheelColorDto = list.stream()
				.filter(e -> e.getColorName().equals(orderSPUDto.getKleurOmschrijving())
						&& (e.getRed() + "," + e.getGreen() + "," + e.getBlue()).equals(orderSPUDto.getRalCode()))
				.findFirst().orElse(null);

		Paragraph labelParagraph2 = new Paragraph("Produkt            Aantal            Omschrijving", font5);
		Paragraph labelParagraph3 = new Paragraph(orderSPUDto.getProdNumber() + "          " + orders.getAantal()
				+ "               " + orderSPUDto.getKleurOmschrijving(), font5);

		Paragraph labelParagraph4 = new Paragraph(
				"\n                     Stralen: \n Gedeeltelijk Stralen:  \n            Schoolperen:"
						+ "                                       Prijscode                 Afdeling  \n                       Kitten: "
						+ "							      	" + "    				  		      "
								+ "            		      	      "+orderSPUDto.getPrijscode()+"                          " + orderSPUDto.getAfdeling() + " \n                      Primer: "
						+ " \n                Ontlakken: \n                        Kleur:       " + "    RAL:  "
						+ wheelColorDto.getId() + "        Naam Kleur:   " + orderSPUDto.getKleurOmschrijving() + " \n "
						+ "         	      BlankeLak: " + "\n          Verkoop order:  "
						+ orderSPUDto.getOrderNumber() + " \n              Naam Klant:  De Molen Beheer BV",
				font5);

		PdfContentByte cb = writer.getDirectContent();

		cb.rectangle(170f, 588f, 10f, 10f);
		cb.stroke();

		if (orderSPUDto.getStralen().equals("JA")) {
			cb.moveTo(170f, 588f);
			cb.lineTo(180f, 598f);
			cb.moveTo(170f, 598f);
			cb.lineTo(180f, 588f);
		}

		PdfContentByte cb2 = writer.getDirectContent();

		cb2.rectangle(170f, 568f, 10f, 10f);
		cb2.stroke();

		if (orderSPUDto.getStralenGedeeltelijk().equals("JA")) {
			cb2.moveTo(170f, 568f);
			cb2.lineTo(180f, 578f);
			cb2.moveTo(170f, 578f);
			cb2.lineTo(180f, 568f);
		}

		PdfContentByte cb3 = writer.getDirectContent();

		cb3.rectangle(170f, 548f, 10f, 10f);
		cb3.stroke();

		if (orderSPUDto.getSchooperen().equals("JA")) {
			cb3.moveTo(170f, 548f);
			cb3.lineTo(180f, 558f);
			cb3.moveTo(170f, 558f);
			cb3.lineTo(180f, 548f);
		}

		PdfContentByte cb4 = writer.getDirectContent();

		cb4.rectangle(170f, 530f, 10f, 10f);
		cb4.stroke();

		if (orderSPUDto.getKitten().equals("JA")) {
			cb4.moveTo(170f, 530f);
			cb4.lineTo(180f, 540f);
			cb4.moveTo(170f, 540f);
			cb4.lineTo(180f, 530f);
		}

		PdfContentByte cb5 = writer.getDirectContent();

		cb5.rectangle(170f, 510f, 10f, 10f);
		cb5.stroke();

		if (orderSPUDto.getPrimer().equals("JA")) {
			cb5.moveTo(170f, 510f);
			cb5.lineTo(180f, 520f);
			cb5.moveTo(170f, 520f);
			cb5.lineTo(180f, 510f);
		}

		PdfContentByte cb6 = writer.getDirectContent();

		cb6.rectangle(170f, 491f, 10f, 10f);
		cb6.stroke();

		if (orderSPUDto.getOntlakken().equals("JA")) {
			cb6.moveTo(170f, 491f);
			cb6.lineTo(180f, 501f);
			cb6.moveTo(170f, 501f);
			cb6.lineTo(180f, 491f);
		}

		PdfContentByte cb7 = writer.getDirectContent();

		cb7.rectangle(170f, 473f, 10f, 10f);
		cb7.stroke();

		if (orderSPUDto.getKleurOmschrijving() != null) {
			cb7.moveTo(170f, 473f);
			cb7.lineTo(180f, 483f);
			cb7.moveTo(170f, 483f);
			cb7.lineTo(180f, 473f);
		}

		PdfContentByte cb8 = writer.getDirectContent();

		cb8.rectangle(170f, 453f, 10f, 10f);
		cb8.stroke();

		if (orderSPUDto.getBlankeLak().equals("JA")) {
			cb8.moveTo(170f, 453f);
			cb8.lineTo(180f, 463f);
			cb8.moveTo(170f, 463f);
			cb8.lineTo(180f, 453f);
		}

		labelParagraph4.setSpacingAfter(30f);

		document.add(labelParagraph2);
		document.add(labelParagraph3);
		document.add(labelParagraph4);

	}

	private void addSPUSections(PdfWriter writer, Document document) throws DocumentException {
		Font font4 = new Font(Font.FontFamily.HELVETICA, 10);

		PdfPTable table = new PdfPTable(1);
		table.setWidthPercentage(100);

		PdfPCell cell = new PdfPCell();
		cell.setBorder(Rectangle.BOX);
		cell.setBorderColor(BaseColor.BLACK);
		cell.setBorderWidth(1f);

		cell.setMinimumHeight(150f);

		Paragraph textParagraph = new Paragraph("               Opmerking:", font4);
		cell.addElement(textParagraph);

		table.addCell(cell);

		table.setSpacingAfter(10f);

		PdfPTable table2 = new PdfPTable(1);
		table2.setWidthPercentage(100);

		PdfPCell cell2 = new PdfPCell();
		cell2.setBorder(Rectangle.BOX);
		cell2.setBorderColor(BaseColor.BLACK);
		cell2.setBorderWidth(1f);

		cell2.setMinimumHeight(80f);

		Paragraph textParagraph2 = new Paragraph(
				"               Een bon is voor uw interne administratie. Als de velg(en) klaar is (zijn) dan 1 bon retour geven aan"
						+ "\n"
						+ "                                                                            De Molen Banden B.V.",
				font4);
		cell2.addElement(textParagraph2);

		table2.addCell(cell2);
		Date currentDate = new Date();

		SimpleDateFormat sdf = new SimpleDateFormat("MM/dd/yyyy");

		String formattedDate = sdf.format(currentDate);

		Paragraph printedDatePara = new Paragraph("Printed:    " + formattedDate);

		document.add(table);
		document.add(table2);
		document.add(printedDatePara);
	}

	private void addSPUDatumSections(PdfWriter writer, Document document) throws DocumentException {
		PdfPTable table3 = new PdfPTable(1);
		table3.setWidthPercentage(50);
		Font font4 = new Font(Font.FontFamily.HELVETICA, 10);
		PdfPCell cell3 = new PdfPCell();
		cell3.setBorder(Rectangle.BOX);
		cell3.setBorderColor(BaseColor.BLACK);
		cell3.setBorderWidth(1f);
		cell3.setMinimumHeight(50f);

		Paragraph textParagraph3 = new Paragraph("Datum klaar:", font4);
		cell3.addElement(textParagraph3);

		table3.addCell(cell3);
		table3.setSpacingAfter(10f);
		document.add(table3);
	}
}
