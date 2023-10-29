/*     */ package com.web.appts.services.imp;
/*     */ 
/*     */ import com.web.appts.DTO.UserDto;
/*     */ import com.web.appts.entities.Department;
/*     */ import com.web.appts.entities.Role;
/*     */ import com.web.appts.entities.User;
/*     */ import com.web.appts.exceptions.ResourceNotFoundException;
/*     */ import com.web.appts.repositories.DepartmentRepo;
/*     */ import com.web.appts.repositories.RoleRepo;
/*     */ import com.web.appts.repositories.UserRepo;
/*     */ import com.web.appts.services.UserService;
/*     */ import java.util.List;
/*     */ import java.util.stream.Collectors;
/*     */ import org.modelmapper.ModelMapper;
/*     */ import org.springframework.beans.factory.annotation.Autowired;
/*     */ import org.springframework.security.crypto.password.PasswordEncoder;
/*     */ import org.springframework.stereotype.Service;
/*     */ 
/*     */ @Service
/*     */ public class UserServiceImp
/*     */   implements UserService
/*     */ {
/*     */   @Autowired
/*     */   private UserRepo userRepo;
/*     */   @Autowired
/*     */   private DepartmentRepo departmentRepo;
/*     */   @Autowired
/*     */   private ModelMapper modelMapper;
/*     */   @Autowired
/*     */   private PasswordEncoder passwordEncoder;
/*     */   @Autowired
/*     */   private RoleRepo roleRepo;
/*     */   
/*     */   public UserDto createUser(UserDto userDto) {
/*  43 */     User user = dtoToUser(userDto);
/*  44 */     user.setPassword(this.passwordEncoder.encode(userDto.getPassword()));
/*  45 */     User savedUser = (User)this.userRepo.save(user);
/*  46 */     return userToDto(savedUser);
/*     */   }
/*     */ 
/*     */ 
/*     */   
/*     */   public UserDto updateUser(UserDto userDto, Long userId) {
/*  52 */     User user = (User)this.userRepo.findById(userId).orElseThrow(() -> new ResourceNotFoundException("User", "id", userId.intValue()));
/*  53 */     user.setName(userDto.getName());
/*  54 */     user.setEmail(userDto.getEmail());
/*  55 */     user.setPassword(this.passwordEncoder.encode(userDto.getPassword()));
/*  56 */     user.setAbout(userDto.getAbout());
/*  57 */     User updatedUser = (User)this.userRepo.save(user);
/*  58 */     UserDto updatedUserDto = userToDto(updatedUser);
/*  59 */     return updatedUserDto;
/*     */   }
/*     */ 
/*     */ 
/*     */ 
/*     */   
/*     */   public UserDto getUserById(Long userId) {
/*  66 */     User user = (User)this.userRepo.findById(userId).orElseThrow(() -> new ResourceNotFoundException("User", "id", userId.intValue()));
/*  67 */     return userToDto(user);
/*     */   }
/*     */ 
/*     */ 
/*     */   
/*     */   public List<UserDto> getAllUsers() {
/*  73 */     List<User> users = this.userRepo.findAll();
/*  74 */     List<UserDto> userDtos = (List<UserDto>)users.stream().map(user -> userToDto(user)).collect(Collectors.toList());
/*  75 */     return userDtos;
/*     */   }
/*     */ 
/*     */ 
/*     */ 
/*     */   
/*     */   public void deleteUser(Long userId) {
/*  82 */     User user = (User)this.userRepo.findById(userId).orElseThrow(() -> new ResourceNotFoundException("User", "id", userId.intValue()));
/*  83 */     this.userRepo.delete(user);
/*     */   }
/*     */ 
/*     */   
/*     */   public User dtoToUser(UserDto userDto) {
/*  88 */     User user = (User)this.modelMapper.map(userDto, User.class);
/*  89 */     return user;
/*     */   }
/*     */   
/*     */   public UserDto userToDto(User user) {
/*  93 */     UserDto userDto = (UserDto)this.modelMapper.map(user, UserDto.class);
/*  94 */     return userDto;
/*     */   }
/*     */ 
/*     */   
/*     */   public UserDto registerNewUser(UserDto userDto) {
/*     */     Role role;
/* 100 */     User user = (User)this.modelMapper.map(userDto, User.class);
/*     */     
/* 102 */     System.out.println(user.getDepId());
/*     */     
/* 104 */     System.out.println("PRRINTTIINNG");
/*     */ 
/*     */     
/* 107 */     System.out.println(user.getDepartmentsSet());
/*     */     
/* 109 */     user.setPassword(this.passwordEncoder.encode(user.getPassword()));
/*     */     
/* 111 */     if (userDto.getDepartmentsSet().stream().anyMatch(e -> e.getDepName().equals("ADMIN"))) {
/* 112 */       role = this.roleRepo.findById(Integer.valueOf(1)).get();
/*     */     } else {
/* 114 */       role = this.roleRepo.findById(Integer.valueOf(2)).get();
/*     */     } 
/* 116 */     user.getRoles().add(role);
/*     */     
/* 118 */     User newUser = (User)this.userRepo.save(user);
/*     */     
/* 120 */     return (UserDto)this.modelMapper.map(newUser, UserDto.class);
/*     */   }
/*     */ 
/*     */ 
/*     */   
/*     */   public List<Department> getDepartments() {
/* 126 */     List<Department> deps = this.departmentRepo.findAll();
/* 127 */     return deps;
/*     */   }
/*     */ 
/*     */ 
/*     */ 
/*     */   
/*     */   public Department getDepartmentById(Integer depId) {
/* 134 */     Department dep = (Department)this.departmentRepo.findById(depId).orElseThrow(() -> new ResourceNotFoundException("Department", "id", depId.intValue()));
/* 135 */     return dep;
/*     */   }
/*     */ }
