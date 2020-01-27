import { ListService } from "./services/listService.js";
import { ListController } from "./components/lists/listController.js";
import { ListView } from "./components/lists/listView.js";
import { ListModel } from "./components/lists/listModel.js";

// Instancia del servicio de acceso a datos
let service = new ListService(jQuery.ajax);
// Instancia del modelo de datos
let model = new ListModel();
// Instancia de la vista
let view = new ListView(model, jQuery);
// Instancia del controlador
new ListController(view, model, service, window.localStorage);