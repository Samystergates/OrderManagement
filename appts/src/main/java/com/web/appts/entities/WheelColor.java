package com.web.appts.entities;

import javax.persistence.Column;
import javax.persistence.Entity;
import javax.persistence.Id;
import javax.persistence.Table;

import org.hibernate.annotations.Cache;
import org.hibernate.annotations.CacheConcurrencyStrategy;

@Entity
@Table(name = "wheel_color")
@Cache(usage = CacheConcurrencyStrategy.READ_WRITE)
public class WheelColor {

	@Id
	private long id;
	@Column(name = "Kleurnaam")
	private String colorName;
	@Column(name = "codevert")
	private String codeVert;
	@Column(name = "codepoeder")
	private String codePoeder;
	@Column(name = "red")
	private int red;
	@Column(name = "green")
	private int green;
	@Column(name = "blue")
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
