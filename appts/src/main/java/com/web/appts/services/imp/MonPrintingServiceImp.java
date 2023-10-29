package com.web.appts.services.imp;

import java.io.ByteArrayOutputStream;
import java.io.IOException;
import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.ArrayList;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

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
import com.itextpdf.text.pdf.PdfContentByte;
import com.itextpdf.text.pdf.PdfFormField;
import com.itextpdf.text.pdf.PdfPCell;
import com.itextpdf.text.pdf.PdfPTable;
import com.itextpdf.text.pdf.PdfWriter;
import com.itextpdf.text.pdf.TextField;
import com.web.appts.DTO.OrderDto;
import com.web.appts.DTO.OrderTRADto;

@Service
public class MonPrintingServiceImp {

	@Autowired
	OrderServiceImp orderServiceImp;

	public byte[] generateMONPdf(String key) {

		Map<String, OrderDto> ordersMap = orderServiceImp.getMap();
		List<OrderDto> orderList = ordersMap.values().stream()
				.filter(orderDto -> key.equals(orderDto.getOrderNumber())
						&& ("Y".equals(orderDto.getMonLb()) || "Y".equals(orderDto.getMonTr())))
				.collect(Collectors.toList());

		try (ByteArrayOutputStream outputStream = new ByteArrayOutputStream()) {

			Document document = new Document();
			PdfWriter writer = PdfWriter.getInstance(document, outputStream);
			document.open();

			addHeadingAndAddress(document, "Montage Order");

			addBloeHeadingAndInfo(writer, document, "Klantnaam", orderList);

			addOrdersTable(document, orderList);

			addOptions(writer, document, orderList);

			addSections(document);

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

	private void addBloeHeadingAndInfo(PdfWriter writer, Document document, String heading, List<OrderDto> list)
			throws DocumentException {
		Font font = new Font(Font.FontFamily.HELVETICA, 18, Font.BOLD);
		Font font2 = new Font(Font.FontFamily.HELVETICA, 12);
		Font font3 = new Font(Font.FontFamily.HELVETICA, 10, Font.BOLD);
		Font font4 = new Font(Font.FontFamily.HELVETICA, 10);

		PdfPTable mainTable = new PdfPTable(3);
		mainTable.setWidthPercentage(100);

		PdfPCell cell1 = new PdfPCell();

		Barcode128 barcode = new Barcode128();
		barcode.setCode(list.get(0).getOrderNumber());

		barcode.setFont(null);
		barcode.setBaseline(0);
		barcode.setBarHeight(15);

		PdfContentByte cb = writer.getDirectContent();

		Image image = barcode.createImageWithBarcode(cb, BaseColor.BLACK, BaseColor.BLACK);
		image.setAlignment(Element.ALIGN_LEFT);
		image.scalePercent(120);
		cell1.addElement(image);

		Paragraph labelParagraph = new Paragraph(String.format("%-9s%-9s", " ", list.get(0).getOrderNumber()), font2);

		labelParagraph.setAlignment(Element.ALIGN_LEFT);
		cell1.addElement(labelParagraph);
		cell1.setBorder(Rectangle.NO_BORDER);
		mainTable.addCell(cell1);

		// First column:
		PdfPCell cell2 = new PdfPCell();
		Paragraph paragraphL1 = new Paragraph(String.format("%-15s%-15s", heading + ":", "De Molen Beheer BV"), font4);
		Paragraph paragraphL2 = new Paragraph(String.format("%-23s%-23s", "", "Rustvenseweg 2"), font4);
		Paragraph paragraphL3 = new Paragraph(String.format("%-23s%-23s", "", "5375 KW REEK"), font4);
		paragraphL1.setAlignment(Element.ALIGN_LEFT);
		paragraphL2.setAlignment(Element.ALIGN_LEFT);
		paragraphL3.setAlignment(Element.ALIGN_LEFT);
		cell2.addElement(paragraphL1);
		cell2.addElement(paragraphL2);
		cell2.addElement(paragraphL3);
		cell2.setBorder(Rectangle.NO_BORDER);
		mainTable.addCell(cell2);

		// Second column:
		PdfPCell cell3 = new PdfPCell();
		Paragraph paragraphR1 = new Paragraph(String.format("%-10s%-10s", "Oplegger: ", list.get(0).getOrderNumber()),
				font4);
		Paragraph paragraphR2 = new Paragraph(String.format("%-10s%-10s", "Behandelaar: ", "_______"), font4);
		Paragraph paragraphR3 = new Paragraph(
				String.format("%-10s%-10s", "Leverdatum: ", list.get(0).getDeliveryDate()), font4);
		paragraphR1.setAlignment(Element.ALIGN_RIGHT);
		paragraphR2.setAlignment(Element.ALIGN_RIGHT);
		paragraphR3.setAlignment(Element.ALIGN_RIGHT);
		cell3.addElement(paragraphR1);
		cell3.addElement(paragraphR2);
		cell3.addElement(paragraphR3);
		cell3.setBorder(Rectangle.NO_BORDER);
		mainTable.addCell(cell3);

		mainTable.setSpacingAfter(30);
		document.add(mainTable);
	}

	private void addOrdersTable(Document document, List<OrderDto> orderList) throws DocumentException {
		PdfPTable table = new PdfPTable(4);
		table.setWidthPercentage(100);

		float[] columnWidths = { 11f, 11f, 18f, 60f };
		table.setWidths(columnWidths);

		table.setSpacingBefore(3f);
		table.setSpacingAfter(300);

		Font font2 = new Font(Font.FontFamily.HELVETICA, 10);
		Font font3 = new Font(Font.FontFamily.HELVETICA, 10, Font.BOLD);

		PdfPCell headerCell = createHeaderCell("Rgl", font3);
		PdfPCell headerCell2 = createHeaderCell("Best", font3);
		PdfPCell headerCell3 = createHeaderCell("Product", font3);
		PdfPCell headerCell4 = createHeaderCell("Omschrijving", font3);

		table.addCell(headerCell);
		table.addCell(headerCell2);
		table.addCell(headerCell3);
		table.addCell(headerCell4);

		for (int i = 0; i < orderList.size(); i++) {
			if (i < orderList.size()) {
				PdfPCell cell1 = createCell(orderList.get(i).getRegel(), font2);
				PdfPCell cell2 = createCell("", font2);
				PdfPCell cell3 = createCell(orderList.get(i).getProduct(), font2);
				PdfPCell cell4 = createCell(orderList.get(i).getOmsumin(), font2);

				table.addCell(cell1);
				table.addCell(cell2);
				table.addCell(cell3);
				table.addCell(cell4);

				cell1.setFixedHeight(20f);
				cell2.setFixedHeight(20f);
				cell3.setFixedHeight(20f);
				cell4.setFixedHeight(20f);
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
		cell.setBorderWidth(0.3f);
		cell.setPadding(2f);
		return cell;
	}

	private void addOptions(PdfWriter writer, Document document, List<OrderDto> orderList) throws DocumentException {

		Font font3 = new Font(Font.FontFamily.HELVETICA, 10, Font.BOLD);
		Font font4 = new Font(Font.FontFamily.HELVETICA, 10);

		PdfContentByte cb = writer.getDirectContent();

		float cb1Y1 = 260f;
		float cb2Y2 = 200f;
		float cb3Y3 = 290f;
		float cb4Y4 = 260f;
		float cb5Y5 = 230f;
		float cb6Y6 = 200f;

		if (orderList.size() == 2) {
			cb1Y1 = 245f;
			cb2Y2 = 185f;
			cb3Y3 = 275f;
			cb4Y4 = 245f;
			cb5Y5 = 215f;
			cb6Y6 = 185f;
		}

		if (orderList.size() == 3) {
			cb1Y1 = 230f;
			cb2Y2 = 170f;
			cb3Y3 = 260f;
			cb4Y4 = 230f;
			cb5Y5 = 200f;
			cb6Y6 = 170f;
		}

		if (orderList.size() == 4) {
			cb1Y1 = 215f;
			cb2Y2 = 155f;
			cb3Y3 = 245f;
			cb4Y4 = 215f;
			cb5Y5 = 185f;
			cb6Y6 = 155f;
		}

		if (orderList.size() == 5) {
			cb1Y1 = 200f;
			cb2Y2 = 140f;
			cb3Y3 = 230f;
			cb4Y4 = 200f;
			cb5Y5 = 170f;
			cb6Y6 = 140f;
		}

		if (orderList.size() >= 6) {
			cb1Y1 = 185f;
			cb2Y2 = 125f;
			cb3Y3 = 215f;
			cb4Y4 = 185f;
			cb5Y5 = 155f;
			cb6Y6 = 125f;
		}

		cb.rectangle(195f, cb1Y1, 10f, 10f);
		cb.stroke();

		PdfContentByte cb2 = writer.getDirectContent();

		cb2.rectangle(195f, cb2Y2, 10f, 10f);
		cb2.stroke();

		PdfContentByte cb3 = writer.getDirectContent();

		cb3.rectangle(128f, cb3Y3, 10f, 10f);
		cb3.stroke();

		PdfContentByte cb4 = writer.getDirectContent();

		cb4.rectangle(128f, cb4Y4, 10f, 10f);
		cb4.stroke();

		PdfContentByte cb5 = writer.getDirectContent();

		cb5.rectangle(128, cb5Y5, 10f, 10f);
		cb5.stroke();

		PdfContentByte cb6 = writer.getDirectContent();

		cb6.rectangle(128, cb6Y6, 10f, 10f);
		cb6.stroke();

		Paragraph labelParagraph0 = new Paragraph("Product eindcontrole:", font3);
		Paragraph labelParagraph1 = new Paragraph(String.format("%-30s%-30s", "\n" + "Band(en) schoon: ", "JA"), font4);
		Paragraph labelParagraph2 = new Paragraph(
				"\n" + "                                         NEE               Schoon gemaakt.", font4);
		Paragraph labelParagraph3 = new Paragraph(String.format("%-30s%-30s", "\n" + "Beschadigingen: ", " NEE"),
				font4);
		Paragraph labelParagraph4 = new Paragraph(
				"\n" + "                                          JA                  Bijgewerkt.", font4);

		labelParagraph4.setSpacingAfter(20f);

		document.add(labelParagraph0);
		document.add(labelParagraph1);
		document.add(labelParagraph2);
		document.add(labelParagraph3);
		document.add(labelParagraph4);

	}

	private void addSections(Document document) throws DocumentException {
		Font font4 = new Font(Font.FontFamily.HELVETICA, 10);

		PdfPTable table = new PdfPTable(1);
		table.setWidthPercentage(100);

		PdfPCell cell = new PdfPCell();
		cell.setBorder(Rectangle.BOX);
		cell.setBorderColor(BaseColor.BLACK);
		cell.setBorderWidth(1f);

		cell.setMinimumHeight(60f);

		Paragraph textParagraph = new Paragraph("Opmerking:", font4);
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

		Paragraph textParagraph2 = new Paragraph("Paraaf en naam monteur:", font4);
		cell2.addElement(textParagraph2);

		table2.addCell(cell2);

		document.add(table);
		document.add(table2);
	}

}
