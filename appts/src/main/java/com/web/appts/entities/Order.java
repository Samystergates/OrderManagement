package com.web.appts.entities;

import java.util.List;
import java.util.Objects;

import javax.persistence.CascadeType;
import javax.persistence.Column;
import javax.persistence.Entity;
import javax.persistence.FetchType;
import javax.persistence.Id;
import javax.persistence.OneToMany;
import javax.persistence.Table;

import org.hibernate.annotations.Cache;
import org.hibernate.annotations.CacheConcurrencyStrategy;

@Entity
@Table(name = "orders")
@Cache(usage = CacheConcurrencyStrategy.READ_WRITE)
public class Order {
	@Id
	// @GeneratedValue(strategy = GenerationType.AUTO)
	@Column(name = "id")
	private int id;
	@Column(name = "Verkooporder")
	private String orderNumber;
	@Column(name = "Ordersoort")
	private String orderType;
	@Column(name = "Backorder")
	private String backOrder;
	@Column(name = "SME")
	private String sme;
	@Column(name = "SPU")
	private String spu;
	@Column(name = "MON_LB")
	private String monLb;
	@Column(name = "MON_TR")
	private String monTr;
	@Column(name = "MWE")
	private String mwe;
	@Column(name = "SER")
	private String ser;
	@Column(name = "TRA")
	private String tra;
	@Column(name = "EXP")
	private String exp;
	@Column(name = "exclamation")
	private String exclamation;
	@Column(name = "Gebruiker_I")
	private String user;
	@Column(name = "Organisatie")
	private String organization;
	@Column(name = "Naam")
	private String customerName;
	@Column(name = "Postcode")
	private String postCode;
	@Column(name = "Plaats")
	private String city;
	@Column(name = "Land")
	private String country;
	@Column(name = "Leverdatum")
	private String deliveryDate;
	@Column(name = "Referentie")
	private String referenceInfo;
	@Column(name = "Datum_order")
	private String creationDate;
	@Column(name = "Datum_laatste_wijziging")
	private String modificationDate;
	@Column(name = "Gebruiker")
	private String verifierUser;
	@Column(name = "Regel")
	private String regel;
	@Column(name = "Aantal")
	private String aantal;
	@Column(name = "Product")
	private String product;
	@Column(name = "Omschrijving")
	private String Omsumin;
	@Column(name = "is_expired")
	private Boolean isExpired;
	@Column(name = "cdProdGrp")
	private String cdProdGrp;
	@Column(name = "completed")
	private String completed;
	@Column(name = "parent")
	private int isParent;
	@OneToMany(cascade = CascadeType.ALL, mappedBy = "order", fetch = FetchType.EAGER)
	private List<OrderDepartment> departments;

	public int getId() {
		return id;
	}

	public void setId(int id) {
		this.id = id;
	}

	public int getIsParent() {
		return this.isParent;
	}

	public void setIsParent(int isParent) {
		this.isParent = isParent;
	}

	public String getOrderNumber() {
		return this.orderNumber;
	}

	public void setOrderNumber(String orderNumber) {
		this.orderNumber = orderNumber;
	}

	public String getCdProdGrp() {
		return cdProdGrp;
	}

	public void setCdProdGrp(String cdProdGrp) {
		this.cdProdGrp = cdProdGrp;
	}

	public String getOrderType() {
		return this.orderType;
	}

	public void setOrderType(String orderType) {
		this.orderType = orderType;
	}

	public String isBackOrder() {
		return this.backOrder;
	}

	public void setBackOrder(String backOrder) {
		this.backOrder = backOrder;
	}

	public String getSme() {
		return this.sme;
	}

	public void setSme(String sme) {
		this.sme = sme;
	}

	public String getSpu() {
		return this.spu;
	}

	public void setSpu(String spu) {
		this.spu = spu;
	}

	public String getMonLb() {
		return this.monLb;
	}

	public void setMonLb(String monLb) {
		this.monLb = monLb;
	}

	public String getMonTr() {
		return this.monTr;
	}

	public void setMonTr(String monTr) {
		this.monTr = monTr;
	}

	public String getBackOrder() {
		return this.backOrder;
	}

	public String getMwe() {
		return this.mwe;
	}

	public void setMwe(String mwe) {
		this.mwe = mwe;
	}

	public String getSer() {
		return this.ser;
	}

	public void setSer(String ser) {
		this.ser = ser;
	}

	public String getTra() {
		return this.tra;
	}

	public void setTra(String tra) {
		this.tra = tra;
	}

	public String getExp() {
		return this.exp;
	}

	public void setExp(String exp) {
		this.exp = exp;
	}

	public String getExclamation() {
		return this.exclamation;
	}

	public void setExclamation(String exclamation) {
		this.exclamation = exclamation;
	}

	public String getUser() {
		return this.user;
	}

	public void setUser(String user) {
		this.user = user;
	}

	public String getOrganization() {
		return this.organization;
	}

	public void setOrganization(String organization) {
		this.organization = organization;
	}

	public String getCustomerName() {
		return this.customerName;
	}

	public void setCustomerName(String customerName) {
		this.customerName = customerName;
	}

	public String getPostCode() {
		return this.postCode;
	}

	public void setPostCode(String postCode) {
		this.postCode = postCode;
	}

	public String getCity() {
		return this.city;
	}

	public void setCity(String city) {
		this.city = city;
	}

	public String getCountry() {
		return this.country;
	}

	public void setCountry(String country) {
		this.country = country;
	}

	public String getDeliveryDate() {
		return this.deliveryDate;
	}

	public void setDeliveryDate(String deliveryDate) {
		this.deliveryDate = deliveryDate;
	}

	public String getReferenceInfo() {
		return this.referenceInfo;
	}

	public void setReferenceInfo(String referenceInfo) {
		this.referenceInfo = referenceInfo;
	}

	public String getCreationDate() {
		return this.creationDate;
	}

	public void setCreationDate(String creationDate) {
		this.creationDate = creationDate;
	}

	public String getModificationDate() {
		return this.modificationDate;
	}

	public void setModificationDate(String modificationDate) {
		this.modificationDate = modificationDate;
	}

	public String getVerifierUser() {
		return this.verifierUser;
	}

	public void setVerifierUser(String verifierUser) {
		this.verifierUser = verifierUser;
	}

	public Boolean getIsExpired() {
		return this.isExpired;
	}

	public void setIsExpired(Boolean isExpired) {
		this.isExpired = isExpired;
	}

	public String getRegel() {
		return this.regel;
	}

	public void setRegel(String regel) {
		this.regel = regel;
	}

	public String getAantal() {
		return this.aantal;
	}

	public void setAantal(String aantal) {
		this.aantal = aantal;
	}

	public String getProduct() {
		return this.product;
	}

	public void setProduct(String product) {
		this.product = product;
	}

	public String getOmsumin() {
		return this.Omsumin;
	}

	public void setOmsumin(String omsumin) {
		this.Omsumin = omsumin;
	}

	public String getCompleted() {
		return this.completed;
	}

	public void setCompleted(String completed) {
		this.completed = completed;
	}

	public List<OrderDepartment> getDepartments() {
		return departments;
	}

	public void setDepartments(List<OrderDepartment> departments) {
		this.departments = departments;
	}

	@Override
	public boolean equals(Object obj) {
		if (this == obj)
			return true;
		if (obj == null || getClass() != obj.getClass())
			return false;

		Order order = (Order) obj;

		return id == order.id && isParent == order.isParent && Objects.equals(orderNumber, order.orderNumber)
				&& Objects.equals(orderType, order.orderType) && Objects.equals(backOrder, order.backOrder)
				&& Objects.equals(sme, order.sme) && Objects.equals(spu, order.spu)
				&& Objects.equals(monLb, order.monLb) && Objects.equals(monTr, order.monTr)
				&& Objects.equals(mwe, order.mwe) && Objects.equals(ser, order.ser) && Objects.equals(tra, order.tra)
				&& Objects.equals(exp, order.exp) && Objects.equals(exclamation, order.exclamation)
				&& Objects.equals(user, order.user) && Objects.equals(organization, order.organization)
				&& Objects.equals(customerName, order.customerName) && Objects.equals(postCode, order.postCode)
				&& Objects.equals(city, order.city) && Objects.equals(country, order.country)
				&& Objects.equals(deliveryDate, order.deliveryDate)
				&& Objects.equals(referenceInfo, order.referenceInfo)
				&& Objects.equals(creationDate, order.creationDate)
				&& Objects.equals(modificationDate, order.modificationDate)
				&& Objects.equals(verifierUser, order.verifierUser) && Objects.equals(regel, order.regel)
				&& Objects.equals(aantal, order.aantal) && Objects.equals(product, order.product)
				&& Objects.equals(Omsumin, order.Omsumin) && Objects.equals(isExpired, order.isExpired)
				&& Objects.equals(cdProdGrp, order.cdProdGrp) && Objects.equals(completed, order.completed)
				&& Objects.equals(departments, order.departments);
	}

	public boolean hasOnlyOneDifference(Order other) {
		int differences = 0;

		if (!Objects.equals(orderNumber, other.orderNumber)) {
			differences++;
		}
		if (!Objects.equals(orderType, other.orderType)) {
			differences++;
		}
		if (!Objects.equals(backOrder, other.backOrder)) {
			differences++;
		}
		if (!Objects.equals(sme, other.sme)) {
			differences++;
		}
		if (!Objects.equals(spu, other.spu)) {
			differences++;
		}
		if (!Objects.equals(monLb, other.monLb)) {
			differences++;
		}
		if (!Objects.equals(monTr, other.monTr)) {
			differences++;
		}
		if (!Objects.equals(mwe, other.mwe)) {
			differences++;
		}
		if (!Objects.equals(ser, other.ser)) {
			differences++;
		}
		if (!Objects.equals(tra, other.tra)) {
			differences++;
		}
		if (!Objects.equals(exp, other.exp)) {
			differences++;
		}
		if (!Objects.equals(exclamation, other.exclamation)) {
			differences++;
		}
		if (!Objects.equals(user, other.user)) {
			differences++;
		}
		if (!Objects.equals(organization, other.organization)) {
			differences++;
		}
		if (!Objects.equals(customerName, other.customerName)) {
			differences++;
		}
		if (!Objects.equals(postCode, other.postCode)) {
			differences++;
		}
		if (!Objects.equals(city, other.city)) {
			differences++;
		}
		if (!Objects.equals(country, other.country)) {
			differences++;
		}
		if (!Objects.equals(deliveryDate, other.deliveryDate)) {
		}
		if (!Objects.equals(referenceInfo, other.referenceInfo)) {
		}
		if (!Objects.equals(creationDate, other.creationDate)) {
			differences++;
		}
		if (!Objects.equals(modificationDate, other.modificationDate)) {
			differences++;
		}
		if (!Objects.equals(verifierUser, other.verifierUser)) {
			differences++;
		}
		if (!Objects.equals(isExpired, other.isExpired)) {
			differences++;
		}
		if (!Objects.equals(regel, other.regel)) {
			differences++;
		}
		if (!Objects.equals(aantal, other.aantal)) {
			differences++;
		}
		if (!Objects.equals(product, other.product)) {
			differences++;
		}
		if (!Objects.equals(Omsumin, other.Omsumin)) {
			differences++;
		}
		if (!Objects.equals(cdProdGrp, other.cdProdGrp)) {
			differences++;
		}
		if (!Objects.equals(completed, other.completed)) {
			differences++;
			if(other.completed == null) {
				differences--;
			}
		}
		if (!Objects.equals(isParent, other.isParent)) {
			differences++;
		}
		if (!Objects.equals(departments, other.departments)) {
		}

		return differences == 1 || differences == 0;
	}

}