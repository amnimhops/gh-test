# gh-test
---
Prueba técnica para geekshubs
## Características técnicas
- Interfaz y comunicaciones vía jQuery
- Arquitectura MVC 

## Instalación
```
git clone https://github.com/amnimhops/gh-test.git
npm install
npm run serve
```
Una vez arrancado, abrir http://localhost:8080/www/index.html en el navegador
## Consideraciones
- Sólo la clase ``listService.js`` se ha creado mediante TDD. Esto se debe a que desde un principio estaba clara la responsabilidad -y por tanto, el comportamiento- de este componente, mientras que los demás han permanecido en el aire hasta encontrar una solución satisfactoria.
- No se ha empleado el uso de Bootstrap, ya que se estaba valorando el uso de la diagramación por CSS
- Se combinan técnicas de await/async con cumplimiento y rechazo _ad-hoc_ de promesas, en función del tipo de escenario que se presenta en cada caso.
- La edición de nombres (listas y tareas) se lleva a cabo mediante el atributo ``contentEditable`` junto a los eventos ``focus()`` y ``keydown``: para modificar estos valores basta con hacer click sobre el nombre y escribir el nuevo valor.
- Tampoco se ha incorporado el uso de React, toda la interacción y presentación se hace exclusivamente mediante HTML5 + jQuery + javascript.