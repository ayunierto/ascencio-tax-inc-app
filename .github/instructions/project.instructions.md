## General instructions for the project

- Antes de aplicar una solución, quiero que evalúes si es arquitecturalmente correcta y segura, no solo si “funciona”.
- dame siempre una serie de pasos de como continuar cuando se necesite que yo haga interacciones manualmentes con otros servicios para los cuales no tengamos configurados servicion de mcp
- respondeme siempre en spanish.
- comprueba siempre el codigo antes de darme una respuesta definitiva, puede ser con un build o con el linter
- usa siempre clean code
- usa siempre principios SOLID

- usa siempre typescript
- usa react hook form + zod para los formularios
- usa tanstack query para manejar las peticiones asincronas
- quiero que mi codigo sea siempre escalable y reutilizable
- si necesitamos gestos de estado usa zustand
- para estilos usa chadcn ui, si necesitamos un componente que no tenemos en nuestro codigo lo instalamos medienta la cli de chadcn nunca creando codigo desde cero para garantizar la compatibilidad con las versiones usadas.
- verifica siempre que el codigo no este deprecado, si es asi actualizalo a la ultima version estable o verifica porque ha siedo cambiado.
- valorar mucho siempre el manejo de errores correctamente segun plataforma o framework que estemos usando, no solo para mostrar un mensaje al usuario sino para evitar que el error se propague y cause problemas mayores.
- siempre que se necesite una nueva funcionalidad o componente, primero verifica si ya existe en el proyecto.