/*    */ package com.web.appts.exceptions;
/*    */ 
/*    */ 
/*    */ 
/*    */ public class ResourceNotFoundException
/*    */   extends RuntimeException
/*    */ {
/*    */   private static final long serialVersionUID = 1L;
/*    */   String resourceName;
/*    */   String fieldName;
/*    */   long fieldVal;
/*    */   String fieldValS;
/*    */   
/*    */   public ResourceNotFoundException(String resourceName, String fieldName, long fieldVal) {
/* 15 */     super(String.format("%s not found with %s : %l", new Object[] { resourceName, fieldName, Long.valueOf(fieldVal) }));
/* 16 */     this.resourceName = resourceName;
/* 17 */     this.fieldName = fieldName;
/* 18 */     this.fieldVal = fieldVal;
/*    */   }
/*    */   public ResourceNotFoundException(String resourceName, String feildName, String feildValue) {
/* 21 */     super(String.format("%s not found with %s : %s", new Object[] { resourceName, feildName, feildValue }));
/* 22 */     this.resourceName = resourceName;
/* 23 */     this.fieldName = feildName;
/* 24 */     this.fieldValS = feildValue;
/*    */   }
/*    */   
/*    */   public String getResourceName() {
/* 28 */     return this.resourceName;
/*    */   }
/*    */   
/*    */   public void setResourceName(String resourceName) {
/* 32 */     this.resourceName = resourceName;
/*    */   }
/*    */   
/*    */   public String getFieldName() {
/* 36 */     return this.fieldName;
/*    */   }
/*    */   
/*    */   public void setFieldName(String fieldName) {
/* 40 */     this.fieldName = fieldName;
/*    */   }
/*    */   
/*    */   public long getFieldVal() {
/* 44 */     return this.fieldVal;
/*    */   }
/*    */   
/*    */   public void setFieldVal(long fieldVal) {
/* 48 */     this.fieldVal = fieldVal;
/*    */   }
/*    */ }


/* Location:              D:\Work\prjcts\app3\back\appts-0.0.1-SNAPSHOT.jar!\BOOT-INF\classes\com\web\appts\exceptions\ResourceNotFoundException.class
 * Java compiler version: 8 (52.0)
 * JD-Core Version:       1.1.3
 */