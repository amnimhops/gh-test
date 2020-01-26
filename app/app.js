import { ListService } from "./services/listService.js";
import { ListController } from "./components/lists/listController.js";
import { ListView } from "./components/lists/listView.js";
import { ListModel } from "./components/lists/listModel.js";

let service = new ListService(jQuery.ajax);
let model = new ListModel();
let view = new ListView(model, jQuery);
let controller = new ListController(view, model, service, window.localStorage, jQuery);