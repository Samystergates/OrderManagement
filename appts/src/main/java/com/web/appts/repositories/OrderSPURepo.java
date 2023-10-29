package com.web.appts.repositories;

import org.springframework.data.jpa.repository.JpaRepository;

import com.web.appts.entities.OrderSPU;

public interface OrderSPURepo extends JpaRepository<OrderSPU, Long>{

	OrderSPU findByOrderNumberAndProdNumber(String paramString1, String paramString2);
	
}
