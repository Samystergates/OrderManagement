package com.web.appts.configurations;

import java.time.LocalDate;
import org.springframework.context.annotation.Configuration;
import org.springframework.web.servlet.HandlerInterceptor;
import org.springframework.web.servlet.config.annotation.InterceptorRegistry;
import org.springframework.web.servlet.config.annotation.ViewControllerRegistry;
import org.springframework.web.servlet.config.annotation.WebMvcConfigurer;

@Configuration
public class WebMvcConfig implements WebMvcConfigurer {
  private LocalDate allowedEndDate = LocalDate.of(2023, 12, 1);
  private String key = "RYGB";

  public void addInterceptors(InterceptorRegistry registry) {
    registry.addInterceptor((HandlerInterceptor)new ExpiryInterceptor(this.allowedEndDate, this.key));
  }

  public String getKey() {
    return this.key;
  }

  public void setKey(String key) {
    this.key = key;
  }

}
