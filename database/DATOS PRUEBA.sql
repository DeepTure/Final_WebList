insert into CGrupo values("3IM6");
insert into CGrupo values("4IM6");
insert into CGrupo values("5IM6");
insert into CGrupo values("6IM6");
insert into CGrupo values("3IM7");
insert into CGrupo values("4IM7");
insert into CGrupo values("5IM7");
insert into CGrupo values("6IM7");
insert into CGrupo values("3IM8");
insert into CGrupo values("4IM8");
insert into CGrupo values("5IM8");
insert into CGrupo values("6IM8");
insert into CGrupo values("3IM9");
insert into CGrupo values("4IM9");
insert into CGrupo values("5IM9");
insert into CGrupo values("6IM9");

insert into CGrupo values("3IV6");
insert into CGrupo values("4IV6");
insert into CGrupo values("5IV6");
insert into CGrupo values("6IV6");
insert into CGrupo values("3IV7");
insert into CGrupo values("4IV7");
insert into CGrupo values("5IV7");
insert into CGrupo values("6IV7");
insert into CGrupo values("3IV8");
insert into CGrupo values("4IV8");
insert into CGrupo values("5IV8");
insert into CGrupo values("6IV8");
insert into CGrupo values("3IV9");
insert into CGrupo values("4IV9");
insert into CGrupo values("5IV9");
insert into CGrupo values("6IV9");


insert into CMateria values("P301","GEOMETRIA ANALITICA","Programacion");
insert into CMateria values("P302","FISICA I","Programacion");
insert into CMateria values("P303","QUIMICA I","Programacion");
insert into CMateria values("P304","INGLES III","Programacion");
insert into CMateria values("P305","COMUNICACION CIENTIFICA","Programacion");
insert into CMateria values("P306","DIBUJO TECNICO I","Programacion");
insert into CMateria values("P307","ENTORNO SOCIOECONOMICO DE MEXICO","Programacion");
insert into CMateria values("P308","PROGRAMACION ORIENTADA A OBJETOS","Programacion");
insert into CMateria values("P309","LAB. DE PROYECTOS DE TECNOLOGIAS DE LA INFORMACION I","Programacion");
insert into CMateria values("P310","ADMON. DE PROYECTOS DE TECNOLOGIAS DE LA INFORMACION I","Programacion");

insert into CMateria values("P401","CALCULO DIFERENCIAL","Programacion");
insert into CMateria values("P402","FISICA II","Programacion");
insert into CMateria values("P403","QUIMICA II","Programacion");
insert into CMateria values("P404","INGLES IV","Programacion");
insert into CMateria values("P405","DIBUJO TECNICO II","Programacion");
insert into CMateria values("P406","PROGRAMACION Y SERVICIOS WEB","Programacion");
insert into CMateria values("P407","BASES DE DATOS","Programacion");
insert into CMateria values("P408","LAB. DE PROYECTOS DE TECNOLOGIAS DE LA INFORMACION II","Programacion");
insert into CMateria values("P409","","Programacion");
insert into CMateria values("P410","TECNICAS DE PROGRAMACION PERSONAL CON CALIDAD","Programacion");

insert into CMateria values("P501","CALCULO INTEGRAL","Programacion");
insert into CMateria values("P502","FISICA III","Programacion");
insert into CMateria values("P503","QUIMICA III","Programacion");
insert into CMateria values("P504","INGLES V","Programacion");
insert into CMateria values("P505","ORIENTACION JUVENIL Y PROFESIONAL III","Programacion");
insert into CMateria values("P506","INTRODUCCION A LOS SISTEMAS DISTRIBUIDOS","Programacion");
insert into CMateria values("P507","INTRODUCCION A LA INGENIERIA DE PRUEBAS","Programacion");
insert into CMateria values("P508","SEGURIDAD WEB Y APLICACIONES","Programacion");
insert into CMateria values("P509","LAB. DE PROYECTOS DE TECNOLOGIAS DE LA INFORMACION III","Programacion");
insert into CMateria values("P510","AUTOMATIZACION DE PRUEBAS","Programacion");

insert into CMateria values("P601","PROBABILIDAD Y ESTADISTICA","Programacion");
insert into CMateria values("P602","FISICA IV","Programacion");
insert into CMateria values("P603","QUIMICA IV","Programacion");
insert into CMateria values("P604","INGLES VI","Programacion");
insert into CMateria values("P605","ORIENTACION JUVENIL Y PROFESIONAL IV","Programacion");
insert into CMateria values("P606","METODOS AGILES DE PROGRAMACION","Programacion");
insert into CMateria values("P607","SOPORTE DE SOFTWARE","Programacion");
insert into CMateria values("P608","INGENIERIA DE SOFTWARE BASICA","Programacion");
insert into CMateria values("P609","LAB. DE PROYECTOS DE TECNOLOGIAS DE LA INFORMACION IV","Programacion");
insert into CMateria values("P610","PROYECTO INTEGRADOR","Programacion");

# id_usuario primeras 2 letras del usuario sea PR (Profesor), AL(Alumno), AD(Administrador) y 4 números au
insert into CUsuario values("AD0001","Deep","Ture","Software","correo@gmail.com","b221d9dbb083a7f33428d7c2a3c3198ae925614d70210e28716ccaa7cd4ddb79");
insert into CUsuario values("PR0002","Jaime","Minor","Goméz","correo@gmail.com","b221d9dbb083a7f33428d7c2a3c3198ae925614d70210e28716ccaa7cd4ddb79");
insert into CUsuario values("AL0003","Leo","Piña","Ramírez","correo@gmail.com","b221d9dbb083a7f33428d7c2a3c3198ae925614d70210e28716ccaa7cd4ddb79");


insert into EAlumno values("2019040568","AL0003");
insert into EAdministrador values("1","AD0001");
insert into EProfesor values("101","PR0002");
