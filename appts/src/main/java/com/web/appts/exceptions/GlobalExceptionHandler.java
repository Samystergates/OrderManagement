/*    */ package com.web.appts.exceptions;
/*    */ 
/*    */ import com.web.appts.DTO.ApiResponse;
/*    */ import java.util.HashMap;
/*    */ import java.util.Map;
/*    */ import org.springframework.http.HttpStatus;
/*    */ import org.springframework.http.ResponseEntity;
/*    */ import org.springframework.validation.FieldError;
/*    */ import org.springframework.web.bind.MethodArgumentNotValidException;
/*    */ import org.springframework.web.bind.annotation.ExceptionHandler;
/*    */ import org.springframework.web.bind.annotation.RestControllerAdvice;
/*    */ 
/*    */ 
/*    */ @RestControllerAdvice
/*    */ public class GlobalExceptionHandler
/*    */ {
/*    */   @ExceptionHandler({ResourceNotFoundException.class})
/*    */   public ResponseEntity<ApiResponse> resourceNotFoundExceptionHandler(ResourceNotFoundException ex) {
/* 21 */     String message = ex.getMessage();
/* 22 */     ApiResponse apiResponse = new ApiResponse(message, false);
/* 23 */     return new ResponseEntity<ApiResponse>(apiResponse, HttpStatus.NOT_FOUND);
/*    */   }
/*    */ 
/*    */ 
/*    */   
/*    */   @ExceptionHandler({MethodArgumentNotValidException.class})
/*    */   public ResponseEntity<Map<String, String>> methodNotValidExceptionHandler(MethodArgumentNotValidException ex) {
/* 30 */     Map<String, String> resp = new HashMap<>();
/*    */     
/* 32 */     ex.getBindingResult().getAllErrors().forEach(error -> {
/*    */           String fieldName = ((FieldError)error).getField();
/*    */           String message = error.getDefaultMessage();
/*    */           resp.put(fieldName, message);
/*    */         });
/* 37 */     return new ResponseEntity<Map<String, String>>(resp, HttpStatus.BAD_REQUEST);
/*    */   }
/*    */ }
