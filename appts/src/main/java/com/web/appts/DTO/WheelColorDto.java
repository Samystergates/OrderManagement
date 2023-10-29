package com.web.appts.DTO;

public class WheelColorDto {

	private long id;
	private String colorName;
	private String codeVert;
	private String codePoeder;
	private int red;
	private int green;
	private int blue;


	
	public long getId() {
		return id;
	}

	public void setId(long id) {
		this.id = id;
	}

	public String getColorName() {
		return colorName;
	}

	public void setColorName(String colorName) {
		this.colorName = colorName;
	}

	public String getCodeVert() {
		return codeVert;
	}

	public void setCodeVert(String codeVert) {
		this.codeVert = codeVert;
	}

	public String getCodePoeder() {
		return codePoeder;
	}

	public void setCodePoeder(String codePoeder) {
		this.codePoeder = codePoeder;
	}

	public int getRed() {
		return red;
	}

	public void setRed(int red) {
		this.red = red;
	}

	public int getGreen() {
		return green;
	}

	public void setGreen(int green) {
		this.green = green;
	}

	public int getBlue() {
		return blue;
	}

	public void setBlue(int blue) {
		this.blue = blue;
	}

}
