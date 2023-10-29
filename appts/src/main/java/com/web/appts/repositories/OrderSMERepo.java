package com.web.appts.repositories;

import org.springframework.data.jpa.repository.JpaRepository;

import com.web.appts.entities.OrderSME;

public interface OrderSMERepo extends JpaRepository<OrderSME, Long> {

	OrderSME findByOrderNumberAndProdNumber(String paramString1, String paramString2);
}
