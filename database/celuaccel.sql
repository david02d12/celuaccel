/*Crear Base de Datos*/
create database celuaccel;
use celuaccel;

/*Crear tabla producto*/
create table Producto (
    Codigo_Producto varchar(50) not null, 
    Cantidad int(10) not null, 
    Precio double not null, 
    Nombre varchar(50) not null, 
    Descripcion varchar(50) not null, 
    Imagen varchar(50) not null, 
    Activo_Catalogo int(10) not null, 
    ID_Categoria int(10) not null, 
    primary key (Codigo_Producto)
    );

/*Crear tabla servicio*/
create table Servicio (
    ID_Servicio int(10) not null auto_increment, 
    Descripcion varchar(50) not null, 
    ID_Usuario varchar(50) not null, 
    Precio double not null, 
    Movil_Nombre varchar(50) not null, 
    Movil_Especificacion varchar(50) not null, 
    Fecha date not null, 
    Etapa int(20) not null, 
    primary key (ID_Servicio)
    );

/*Crear tabla chat*/
create table Chat (
    Codigo_Chat int(10) not null auto_increment, 
    ID_Usuario varchar(50) not null, 
    ID_Servicio int(10) null, 
    primary key (Codigo_Chat)
    );

/*Crear tabla usuario*/
create table Usuario (
    ID_Usuario varchar(50) not null, 
    Codigo_Documento int(10) not null, 
    Nombre varchar(50) not null, 
    Fecha_Nacimiento date not null, 
    Direccion varchar(50) not null, 
    Telefono varchar(50) not null, 
    Correo varchar(50) not null, 
    Contraseña varchar(200) not null, 
    Codigo_Rol int(10) not null, 
    primary key (ID_Usuario)
    );

/*Crear tabla mensajes*/
create table Mensajes (
    Codigo_Mensaje int(10) not null auto_increment, 
    Codigo_Chat int(10) not null, 
    ID_Usuario varchar(50) not null, 
    Fecha_Mensaje date not null, 
    Mensaje varchar(500) not null, 
    Estado int(10) not null, 
    primary key (Codigo_Mensaje)
    );

/*Crear tabla comentarios*/
create table Comentarios (
    Codigo_Comentario int(10) not null auto_increment, 
    ID_Usuario varchar(50) not null, 
    Comentario varchar(500) not null, 
    Fecha_Comentario date not null, 
    Estrellas int(1) not null default 5,
    primary key (Codigo_Comentario)
    );

/*Crear tabla notificaciones*/
create table Notificaciones (
    Codigo_Notificaciones int(10) not null auto_increment, 
    Tipo_Notificacion varchar(1000) not null, 
    primary key (Codigo_Notificaciones)
    );

/*Crear tabla roles*/
create table Roles (
    Codigo_Rol int(10) not null, 
    Descripcion_Rol varchar(50) not null, 
    primary key (Codigo_Rol)
    );

/*Crear tabla pregunta*/
create table Pregunta (
    ID_Consulta int(10) not null auto_increment, 
    ID_Usuario varchar(50) not null, 
    Codigo_Producto varchar(50) not null, 
    Pregunta varchar(500) not null, 
    Fecha date not null, 
    primary key (ID_Consulta)
    );

/*Crear tabla categoria*/
create table Categoria (
    ID_Categoria int(10) not null, 
    Nombre_Categoria varchar(50) not null, 
    primary key (ID_Categoria)
    );

/*Crear tabla historial de servicios*/
create table Historial_Servicios (
    ID_Historial int(10) not null auto_increment, 
    ID_Servicio int(10) not null, 
    Fecha_Evento date not null, 
    Descripcion_Evento varchar(50) not null, 
    Estado varchar(50) not null, 
    primary key (ID_Historial)
    );

/*Crear tabla de tipos de documento*/
create table Tipo_Documento (
    Codigo_Documento int(10) not null, 
    Nombre_Documento varchar(50) not null, 
    primary key (Codigo_Documento)
    );

/*Conexiones de llaves foraneas de las tablas*/
alter table Chat add foreign key (ID_Usuario) references Usuario (ID_Usuario);

alter table Mensajes add foreign key (Codigo_Chat) references Chat (Codigo_Chat);

alter table Mensajes add foreign key (ID_Usuario) references Usuario (ID_Usuario);

alter table Comentarios add foreign key (ID_Usuario) references Usuario (ID_Usuario);

alter table Usuario add foreign key (Codigo_Rol) references Roles (Codigo_Rol);

alter table Usuario add foreign key (Codigo_Documento) references Tipo_Documento (Codigo_Documento);

alter table Servicio add foreign key (ID_Usuario) references Usuario (ID_Usuario);

alter table Historial_Servicios add foreign key (ID_Servicio) references Servicio (ID_Servicio);

alter table Producto add foreign key (ID_Categoria) references Categoria (ID_Categoria);

alter table Pregunta add foreign key (Codigo_Producto) references Producto (Codigo_Producto);

alter table Pregunta add foreign key (ID_Usuario) references Usuario (ID_Usuario);



/*Insertar datos roles*/
insert into roles(Codigo_Rol,Descripcion_Rol) values('1','El rol es tecnico');

insert into roles(Codigo_Rol,Descripcion_Rol) values('2','El rol es cliente');

insert into roles(Codigo_Rol,Descripcion_Rol) values('3','El rol es administrador');

/*Insertar datos notificaciones*/
insert into notificaciones(Tipo_Notificacion) values('Su celular esta listo');

insert into notificaciones(Tipo_Notificacion) values('Su celular esta siendo reparado');

insert into notificaciones(Tipo_Notificacion) values('Su equipo esta listo');

insert into notificaciones(Tipo_Notificacion) values('Su equipo esta siendo reparado');

insert into notificaciones(Tipo_Notificacion) values('Nuevo Mensaje');

insert into notificaciones(Tipo_Notificacion) values('Actualizacion en Servicio');

insert into notificaciones(Tipo_Notificacion) values('Servicio Cancelado');

insert into notificaciones(Tipo_Notificacion) values('Servicio Aceptado');

insert into notificaciones(Tipo_Notificacion) values('Nuevo Servicio');

insert into notificaciones(Tipo_Notificacion) values('Nuevos Productos en el Catalogo');

/*Insertar datos tipo de documento*/
insert into tipo_documento(Codigo_Documento,Nombre_Documento) 
values('1','Cedula');

insert into tipo_documento(Codigo_Documento,Nombre_Documento) 
values('2','Tarjeta de Identidad');

insert into tipo_documento(Codigo_Documento,Nombre_Documento) 
values('3','Cedula de Extrajeria');

insert into tipo_documento(Codigo_Documento,Nombre_Documento) 
values('4','Pasaporte');

insert into tipo_documento(Codigo_Documento,Nombre_Documento) 
values('5','PEP');

/*Insertar datos categoria*/
insert into categoria(ID_Categoria,Nombre_Categoria) 
values('1','Audifonos');

insert into categoria(ID_Categoria,Nombre_Categoria) 
values('2','Cargadores');

insert into categoria(ID_Categoria,Nombre_Categoria) 
values('3','Forros');

insert into categoria(ID_Categoria,Nombre_Categoria) 
values('4','Accesorios');

insert into categoria(ID_Categoria,Nombre_Categoria) 
values('5','Otros');

insert into categoria(ID_Categoria,Nombre_Categoria) 
values('6','Partes');

insert into categoria(ID_Categoria,Nombre_Categoria) 
values('7','USB');

insert into categoria(ID_Categoria,Nombre_Categoria) 
values('8','Microfonos');

insert into categoria(ID_Categoria,Nombre_Categoria) 
values('9','Altavoces');

insert into categoria(ID_Categoria,Nombre_Categoria) 
values('10','Mouse');

/*Insertar datos Usuario*/
insert into usuario(ID_Usuario,Codigo_Documento,Nombre,Fecha_Nacimiento,Direccion,Telefono,Correo,Contraseña,Codigo_Rol) 
values('10045612317','1','Carlos Andrés Ramírez Torres','2000/05/12','Calle 72 #15-34','3108457291','carlostorres@email.com','$2b$10$s0obWGI3K0zhBs46cBLCr.Dhcooly3HMt9jCriDpJzm2IqBvAdsai','2');

insert into usuario(ID_Usuario,Codigo_Documento,Nombre,Fecha_Nacimiento,Direccion,Telefono,Correo,Contraseña,Codigo_Rol) 
values('10008547854','1','María Fernanda Gómez Ríos','2000/05/13','Carrera 11 #84-20','3120938475','mariagomez@email.com','$2b$10$7voaTBUvzY5ObwDb0YQ/9uKgVXolNZZjbVqXsQ8MvAn8i5geDPAVS','2');

insert into usuario(ID_Usuario,Codigo_Documento,Nombre,Fecha_Nacimiento,Direccion,Telefono,Correo,Contraseña,Codigo_Rol) 
values('91820473651','1','José Miguel Herrera Salazar','2000/05/14','Calle 134 #19-50','3358472019','joseherre@email.com','$2b$10$ogkOja6pe1lxDDoayvc7/./w1E9iBAbDIzOi8RgnpN0LgotRQl6Dq','3'); 

insert into usuario(ID_Usuario,Codigo_Documento,Nombre,Fecha_Nacimiento,Direccion,Telefono,Correo,Contraseña,Codigo_Rol) 
values('67890123458','2','Valeria Carolina Torres Aguirre','2000/05/15','Transversal 6 #45-67','3258472930','carolinaaguirre@email.com','$2b$10$6QtE.fj//MuO58rd1vCgBOpyeXda1RSzP08ak.50ElvPjNXXzk7wS','1');

insert into usuario(ID_Usuario,Codigo_Documento,Nombre,Fecha_Nacimiento,Direccion,Telefono,Correo,Contraseña,Codigo_Rol) 
values('12938475602','3','Tomás Alejandro García Montoya','2000/05/16','Carrera 13 #100-89','3273849201','tomasgarcia@email.com','$2b$10$1L7uHPTBaiJyNdYF87WIo.qBmtVQ4TWlxRCX88WURglCh6DCfhAou','1');

insert into usuario(ID_Usuario,Codigo_Documento,Nombre,Fecha_Nacimiento,Direccion,Telefono,Correo,Contraseña,Codigo_Rol) 
values('425124636','5','Pepito Angel Perez Sanches','2000/05/17','Calle 45 # 22-30','300 123 4567','Pepitopapi@gmail.com','$2b$10$s0obWGI3K0zhBs46cBLCr.Dhcooly3HMt9jCriDpJzm2IqBvAdsai','2');

insert into usuario(ID_Usuario,Codigo_Documento,Nombre,Fecha_Nacimiento,Direccion,Telefono,Correo,Contraseña,Codigo_Rol) 
values('25863675','4','Balatro Balatrez Castillo','2000/05/18','Carrera 16 # 78-45','314 987 6543','Balatroestajugando@gmail.com','$2b$10$7voaTBUvzY5ObwDb0YQ/9uKgVXolNZZjbVqXsQ8MvAn8i5geDPAVS','2');

insert into usuario(ID_Usuario,Codigo_Documento,Nombre,Fecha_Nacimiento,Direccion,Telefono,Correo,Contraseña,Codigo_Rol) 
values('B5465312','2','Olga Miriam De la Rosa Torres','2000/05/19','Avenida 19 # 50-21','311 555 7890','MiriamRosa@gmail.com','$2b$10$ogkOja6pe1lxDDoayvc7/./w1E9iBAbDIzOi8RgnpN0LgotRQl6Dq','2');

insert into usuario(ID_Usuario,Codigo_Documento,Nombre,Fecha_Nacimiento,Direccion,Telefono,Correo,Contraseña,Codigo_Rol) 
values('68943521','3','Yenifer Vivina Goonzalez Gonzalez ','2000/05/20','Calle 100 # 12-90','318 432 8765','Yenifervivi@gmail.com','$2b$10$6QtE.fj//MuO58rd1vCgBOpyeXda1RSzP08ak.50ElvPjNXXzk7wS','2');

insert into usuario(ID_Usuario,Codigo_Documento,Nombre,Fecha_Nacimiento,Direccion,Telefono,Correo,Contraseña,Codigo_Rol) 
values('55461352789','2','Anderson Alejandro Paredes Arboleda','2000/05/21','Carrera 9 # 35-15','320 111 2233','lejandroparedes@gmail.com','$2b$10$1L7uHPTBaiJyNdYF87WIo.qBmtVQ4TWlxRCX88WURglCh6DCfhAou','2');

/*Insertar datos producto*/
insert into producto(Codigo_Producto,Cantidad,Precio,Nombre,Descripcion,Imagen,Activo_Catalogo,ID_Categoria) 
values('PRO001','10','7500','Audifonos de cable','Audifonos de cable normal negro','[Archivo]','1','1');

insert into producto(Codigo_Producto,Cantidad,Precio,Nombre,Descripcion,Imagen,Activo_Catalogo,ID_Categoria) 
values('PRO002','22','20000','Audifonos bluetooth','Audifonos de conexión bluetooth recargables','[Archivo]','0','1');

insert into producto(Codigo_Producto,Cantidad,Precio,Nombre,Descripcion,Imagen,Activo_Catalogo,ID_Categoria) 
values('PRO003','14','14000','Forro de celular','Forros con diferentes motivos','[Archivo]','1','3');

insert into producto(Codigo_Producto,Cantidad,Precio,Nombre,Descripcion,Imagen,Activo_Catalogo,ID_Categoria) 
values('PRO004','23','18000','Cargador tipo c','Cargador de celuLar con entrada tipo C','[Archivo]','0','2');

insert into producto(Codigo_Producto,Cantidad,Precio,Nombre,Descripcion,Imagen,Activo_Catalogo,ID_Categoria) 
values('PRO005','7','15000','USB 15GB','Unidad de memoria de 15 gigabites','[Archivo]','1','4');

insert into producto(Codigo_Producto,Cantidad,Precio,Nombre,Descripcion,Imagen,Activo_Catalogo,ID_Categoria) 
values('PRO006','5','17000','Forro Protector','Forro color azul','[Archivo]','1','3');

insert into producto(Codigo_Producto,Cantidad,Precio,Nombre,Descripcion,Imagen,Activo_Catalogo,ID_Categoria) 
values('PRO007','9','12000','Audifonos de cable','Audifonos de cable tipo C blanco','[Archivo]','0','1');

insert into producto(Codigo_Producto,Cantidad,Precio,Nombre,Descripcion,Imagen,Activo_Catalogo,ID_Categoria) 
values('PRO008','6','6500','Cargador de bateria','Cargador para cargar baterias','[Archivo]','1','2');

insert into producto(Codigo_Producto,Cantidad,Precio,Nombre,Descripcion,Imagen,Activo_Catalogo,ID_Categoria) 
values('PRO009','11','30000','Teclado Mecanico','Teclado mecanico en color negro','[Archivo]','1','5');

insert into producto(Codigo_Producto,Cantidad,Precio,Nombre,Descripcion,Imagen,Activo_Catalogo,ID_Categoria) 
values('PRO010','4','16000','Vidrio templado','Vidrio templado de Xiaomi','[Archivo]','0','5');

/*Insertar datos servicio*/
insert into servicio(ID_Servicio,Descripcion,ID_Usuario,Precio,Movil_Nombre,Movil_Especificacion,Fecha,Etapa) 
values('1','Protector de Pantalla','425124636','25000','iPhone 16 Pro Max','El protector de pantalla se rompio','2025/08/13','100');

insert into servicio(ID_Servicio,Descripcion,ID_Usuario,Precio,Movil_Nombre,Movil_Especificacion,Fecha,Etapa) 
values('2','Protector de Pantalla','12938475602','15000','Galaxy S25 Ultra','El protector de pantalla se rompio','2025/08/14','100');

insert into servicio(ID_Servicio,Descripcion,ID_Usuario,Precio,Movil_Nombre,Movil_Especificacion,Fecha,Etapa) 
values('3','Display roto','67890123458','100000','Pixel 9','El display se desconecto debido a un fuerte golpe','2025/08/15','100');

insert into servicio(ID_Servicio,Descripcion,ID_Usuario,Precio,Movil_Nombre,Movil_Especificacion,Fecha,Etapa) 
values('4','Display roto','55461352789','100000','Xiaomi 15 Ultra','El display se desconecto debido a un fuerte golpe','2025/08/16','100');

insert into servicio(ID_Servicio,Descripcion,ID_Usuario,Precio,Movil_Nombre,Movil_Especificacion,Fecha,Etapa) 
values('5','Bateria quemada','68943521','30000','Motorola Razr 60 Ultra','Bateria necesita reemplazo','2025/08/17','100');

insert into servicio(ID_Servicio,Descripcion,ID_Usuario,Precio,Movil_Nombre,Movil_Especificacion,Fecha,Etapa) 
values('6','Problemas de Altavoces','25863675','30000','Tecno 60 live','Los altavoces se dañaron','2025/08/8','50');

insert into servicio(ID_Servicio,Descripcion,ID_Usuario,Precio,Movil_Nombre,Movil_Especificacion,Fecha,Etapa) 
values('7','Problemas de carga','10008547854','20000','Oppo 12 plus','la entrada de cargador USB se daño','2025/08/9','60');

insert into servicio(ID_Servicio,Descripcion,ID_Usuario,Precio,Movil_Nombre,Movil_Especificacion,Fecha,Etapa) 
values('8','Pantalla rota','10045612317','40000','Motorola Edge 40 neo','La pantalla se daño','2025/08/10','80');

insert into servicio(ID_Servicio,Descripcion,ID_Usuario,Precio,Movil_Nombre,Movil_Especificacion,Fecha,Etapa) 
values('9','Boton dañado','25863675','40000','Motorola 50 fusion','El boton de volumen no responde','2025/08/11','40');

insert into servicio(ID_Servicio,Descripcion,ID_Usuario,Precio,Movil_Nombre,Movil_Especificacion,Fecha,Etapa) 
values('10','Camara Dañada','B5465312','60000','iPhone 6','La camara se daño','2025/08/12','70');

/*Insertar datos chat*/
insert into chat(Codigo_Chat,ID_Usuario,ID_Servicio) 
values('1','425124636','1');

insert into chat(Codigo_Chat,ID_Usuario,ID_Servicio) 
values('2','12938475602','2');

insert into chat(Codigo_Chat,ID_Usuario,ID_Servicio) 
values('3','67890123458','3');

insert into chat(Codigo_Chat,ID_Usuario,ID_Servicio) 
values('4','55461352789','4');

insert into chat(Codigo_Chat,ID_Usuario,ID_Servicio) 
values('5','68943521','5');

insert into chat(Codigo_Chat,ID_Usuario,ID_Servicio) 
values('6','25863675','6');

insert into chat(Codigo_Chat,ID_Usuario,ID_Servicio) 
values('7','10008547854','7');

insert into chat(Codigo_Chat,ID_Usuario,ID_Servicio) 
values('8','10045612317','8');

insert into chat(Codigo_Chat,ID_Usuario,ID_Servicio) 
values('9','25863675','9');

insert into chat(Codigo_Chat,ID_Usuario,ID_Servicio) 
values('10','B5465312','10');

/*Insertar datos mensajes*/
insert into mensajes(Codigo_Mensaje,Codigo_Chat,ID_Usuario,Fecha_Mensaje,Mensaje,Estado) 
values('1','1','425124636','2025/07/13','Buenos días, ¿cuándo estará listo mi equipo?','1');

insert into mensajes(Codigo_Mensaje,Codigo_Chat,ID_Usuario,Fecha_Mensaje,Mensaje,Estado) 
values('2','2','12938475602','2025/07/14','¿Me pueden dar un presupuesto estimado?','0');

insert into mensajes(Codigo_Mensaje,Codigo_Chat,ID_Usuario,Fecha_Mensaje,Mensaje,Estado) 
values('3','3','67890123458','2025/07/15','Hola, ¿hay alguna novedad con mi teléfono?','1');

insert into mensajes(Codigo_Mensaje,Codigo_Chat,ID_Usuario,Fecha_Mensaje,Mensaje,Estado) 
values('4','4','55461352789','2025/07/16','Buen día, ¿en qué estado va la reparación?','0');

insert into mensajes(Codigo_Mensaje,Codigo_Chat,ID_Usuario,Fecha_Mensaje,Mensaje,Estado) 
values('5','5','68943521','2025/07/17','Gracias por atenderme, espero su respuesta.','1');

insert into mensajes(Codigo_Mensaje,Codigo_Chat,ID_Usuario,Fecha_Mensaje,Mensaje,Estado) 
values('6','6','25863675','2025/07/15','¿Ya diagnosticaron el problema de los altavoces?','1');

insert into mensajes(Codigo_Mensaje,Codigo_Chat,ID_Usuario,Fecha_Mensaje,Mensaje,Estado) 
values('7','7','10008547854','2025/07/13','Confirmen cuando puedan reemplazar la entrada USB.','0');

insert into mensajes(Codigo_Mensaje,Codigo_Chat,ID_Usuario,Fecha_Mensaje,Mensaje,Estado) 
values('8','8','10045612317','2025/07/22','Avísenme si el costo cambia, por favor.','1');

insert into mensajes(Codigo_Mensaje,Codigo_Chat,ID_Usuario,Fecha_Mensaje,Mensaje,Estado) 
values('9','9','25863675','2025/07/23','¿Cuánto tardarán en reparar el botón de volumen?','0');

insert into mensajes(Codigo_Mensaje,Codigo_Chat,ID_Usuario,Fecha_Mensaje,Mensaje,Estado) 
values('10','10','B5465312','2025/07/14','Espero que la cámara tenga solución, gracias.','0');

/*Insertar datos comentarios*/
insert into comentarios(Codigo_Comentario,ID_Usuario,Comentario,Fecha_Comentario,Estrellas) 
values('1','425124636','Excelente servicio, cambiaron el protector de mi iPhone en menos de 20 minutos. Muy recomendados!','2025/07/13','5');

insert into comentarios(Codigo_Comentario,ID_Usuario,Comentario,Fecha_Comentario,Estrellas) 
values('2','12938475602','Buen trabajo en general, aunque el tiempo de espera fue un poco largo. El resultado final fue muy bueno.','2025/07/14','4');

insert into comentarios(Codigo_Comentario,ID_Usuario,Comentario,Fecha_Comentario,Estrellas) 
values('3','67890123458','Repararon el display de mi Pixel 9 como nuevo. Personal amable y precios justos.','2025/07/15','5');

insert into comentarios(Codigo_Comentario,ID_Usuario,Comentario,Fecha_Comentario,Estrellas) 
values('4','55461352789','Muy buena atención, solucionaron el problema del display rápidamente. Volvería sin dudarlo.','2025/07/16','5');

insert into comentarios(Codigo_Comentario,ID_Usuario,Comentario,Fecha_Comentario,Estrellas) 
values('5','68943521','Cambiaron la batería de mi Motorola y quedó como nuevo. Excelente relación calidad-precio.','2025/07/17','4');

insert into comentarios(Codigo_Comentario,ID_Usuario,Comentario,Fecha_Comentario,Estrellas) 
values('6','25863675','El técnico fue muy profesional. Me explicó todo el proceso antes de comenzar la reparación.','2025/07/22','5');

insert into comentarios(Codigo_Comentario,ID_Usuario,Comentario,Fecha_Comentario,Estrellas) 
values('7','10008547854','Repararon la entrada USB de mi Oppo en el día. Muy satisfecha con el servicio.','2025/07/23','4');

insert into comentarios(Codigo_Comentario,ID_Usuario,Comentario,Fecha_Comentario,Estrellas) 
values('8','10045612317','Buen servicio aunque el precio me pareció un poco elevado. La reparación quedó perfecta.','2025/07/24','3');

insert into comentarios(Codigo_Comentario,ID_Usuario,Comentario,Fecha_Comentario,Estrellas) 
values('9','25863675','Segunda vez que los visito y siempre cumplen. Muy recomendados para reparaciones de celulares.','2025/07/24','5');

insert into comentarios(Codigo_Comentario,ID_Usuario,Comentario,Fecha_Comentario,Estrellas) 
values('10','B5465312','Arreglaron la cámara de mi iPhone 6 perfectamente. Pensé que no tenía solución y la encontraron.','2025/07/22','5');

/*Insertar datos pregunta*/
insert into pregunta(ID_Consulta,ID_Usuario,Codigo_Producto,Pregunta,Fecha) 
values('1','425124636','PRO001','Disculpe estan disponibles estos audifonos','2025/08/13');

insert into pregunta(ID_Consulta,ID_Usuario,Codigo_Producto,Pregunta,Fecha) 
values('2','12938475602','PRO002','Buenos dias quisiera preguntar por este producto','2025/08/15');

insert into pregunta(ID_Consulta,ID_Usuario,Codigo_Producto,Pregunta,Fecha) 
values('3','67890123458','PRO003','Hola, tienen este motivo de forro?','2025/08/15');

insert into pregunta(ID_Consulta,ID_Usuario,Codigo_Producto,Pregunta,Fecha) 
values('4','55461352789','PRO004','Buenas Noches, para preguntar si este cargador sirve para mi celular','2025/08/24');

insert into pregunta(ID_Consulta,ID_Usuario,Codigo_Producto,Pregunta,Fecha) 
values('5','10045612317','PRO005','Hola, de que tamaños tienen estas usb?','2025/08/22');

insert into pregunta(ID_Consulta,ID_Usuario,Codigo_Producto,Pregunta,Fecha) 
values('6','25863675','PRO006','Hola,aun esta disponible el forro','2025/08/24');

insert into pregunta(ID_Consulta,ID_Usuario,Codigo_Producto,Pregunta,Fecha) 
values('7','10008547854','PRO007','Hola,Los Audifonos tienen botones?','2025/08/06');

insert into pregunta(ID_Consulta,ID_Usuario,Codigo_Producto,Pregunta,Fecha) 
values('8','10045612317','PRO008','Hola, cuantas espacio para baterias?','2025/08/25');

insert into pregunta(ID_Consulta,ID_Usuario,Codigo_Producto,Pregunta,Fecha) 
values('9','25863675','PRO009','Disculpe,El teclado tiene garantia?','2025/08/22');

insert into pregunta(ID_Consulta,ID_Usuario,Codigo_Producto,Pregunta,Fecha) 
values('10','B5465312','PRO010','Buenas,Para que modelo de celular es?','2025/08/27');

/*Insertar datos historial de servicios*/
insert into historial_servicios(ID_Historial,ID_Servicio,Fecha_Evento,Descripcion_Evento,Estado) 
values('1','1','2025/07/13','El protector de pantalla se rompio','1');

insert into historial_servicios(ID_Historial,ID_Servicio,Fecha_Evento,Descripcion_Evento,Estado) 
values('2','2','2025/07/14','El protector de pantalla se rompio','1');

insert into historial_servicios(ID_Historial,ID_Servicio,Fecha_Evento,Descripcion_Evento,Estado) 
values('3','3','2025/07/15','El display se desconecto debido a un fuerte golpe','0');

insert into historial_servicios(ID_Historial,ID_Servicio,Fecha_Evento,Descripcion_Evento,Estado) 
values('4','4','2025/07/16','El display se desconecto debido a un fuerte golpe','0');

insert into historial_servicios(ID_Historial,ID_Servicio,Fecha_Evento,Descripcion_Evento,Estado) 
values('5','5','2025/07/17','Bateria necesita reemplazo','1');

insert into historial_servicios(ID_Historial,ID_Servicio,Fecha_Evento,Descripcion_Evento,Estado) 
values('6','6','2025/07/18','Los altavoces se llenaron de agua','1');

insert into historial_servicios(ID_Historial,ID_Servicio,Fecha_Evento,Descripcion_Evento,Estado) 
values('7','7','2025/07/19','La entrada tiene algo atorado','1');

insert into historial_servicios(ID_Historial,ID_Servicio,Fecha_Evento,Descripcion_Evento,Estado) 
values('8','8','2025/07/20','La pantalla se rompio','0');

insert into historial_servicios(ID_Historial,ID_Servicio,Fecha_Evento,Descripcion_Evento,Estado) 
values('9','9','2025/07/21','El boton de encendido no responde','1');

insert into historial_servicios(ID_Historial,ID_Servicio,Fecha_Evento,Descripcion_Evento,Estado) 
values('10','10','2025/07/22','La camara no responde ','1');
