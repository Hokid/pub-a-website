window.aWebsite = {
  modules: {},
  observer: {}
};


//= include_tree modules
/**
 * Обозначения:
 *
 *  root - в основном обозначает объект document, но может восприниматься
 *         как document.documentElement(html) или document.body(body).
 *
 *  dropdown - выпадающий box. В качестве определителя выступает css-класс
 *             'js-dropdown'.
 *
 *  toggle - переключатель видимости выпадающего box-а. В качестве определителя
 *           выступает css-класс 'js-dropdown-toggle'.
 *
 *  closeBtn - кнопка, закрывающая выпадающий box. В качестве определителя
 *             выступает css-класс 'js-dropdown-close'.
 *
 *  node - любой узел документа.
 *
 *  element - любой узел-элемент документа, включая document(root).
 *
 *  data - объект, создаваемый конструктором Data.
 *
 *  context - контекст element. Может быть либо root, либо dropdown.
 *
 *  anytype - любой тип данных JS и описанных в этом списке.
 *
 *  callback - Callback - функция обратного вызова.
 *
 *  jСallback  - объект Callbacks jQuery.
 *
 *  jObject - объект jQuery
 *
 *  object - объект JS
 *
 *  string - объект JS типа строка
 */

;(function(API, $){

  var root = document,
      rootBody = root.body,
      rootHTML = root.documentElement;



  /**
   * --------------------------------
   *             ПРОВЕРКИ
   * --------------------------------
   */

  /**
   * Является ли anytype типом dropdown.
   *
   * @param  {anytype} anytype
   * @return {Boolean}
   */

  function isDropdown(anytype) {
    return isElement(anytype) && $(anytype).is('.js-dropdown');
  }

  /**
   * Является ли anytype типом toggle.
   *
   * @param  {anytype} anytype
   * @return {Boolean}
   */

  function isToggle(anytype) {
    return isElement(anytype) && $(anytype).is('.js-dropdown-toggle');
  }

  /**
   * Является ли anytype типом closeBtn.
   *
   * @param  {anytype} anytype
   * @return {Boolean}
   */

  function isCloseBtn(anytype) {
    return isElement(anytype) && $(anytype).is('.js-dropdown-close');
  }

  /**
   * Является ли anytype типом root.
   *
   * @param  {any type} anytype
   * @return {Boolean}
   */

  function isRoot(node) {
    return isElement(node) && (node === rootBody || node === rootHTML || node === root );
  }

  /**
   * Является ли anytype типом data.
   *
   * @param  {anytype} anytype
   * @return {Boolean}
   */

  function isData(anytype) {
    return anytype instanceof Data;
  }

  /**
   * Находится ли dropdown в состоянии 'открыт'.
   *
   * @param  {anytype} dropdown
   * @return {Boolean, undefined}:
   *  * undefined если входной параметр не dropdown
   */

  function isOpened(dropdown) {
    return isDropdown(dropdown) && $(dropdown).is(".is-opened") || undefined;
  }

  /**
   * Является ли anytype типом node.
   *
   * @param  {anytype} anytype
   * @return {Boolean}
   */

  function isNode(anytype) {
    return anytype instanceof Node;
  }

  /**
   * Является ли anytype типом element.
   *
   * @param  {anytype} anytype
   * @return {Boolean}
   */

  function isElement(anytype) {
    return anytype instanceof Element || anytype instanceof Document;
  }


  /**
   * Включает ли в себя anytype data.
   *
   * @param  {anytype} anytype
   * @return {Boolean, undefined}:
   *  * undefined если входной параметр не element
   */
  function hasData(anytype) {
    return isElement(anytype) && isData($(anytype).data().dropdown) || undefined;
  }



  /**
   * --------------------------------
   *             API
   * --------------------------------
   */

  /**
   * Находит для toggle ближайший dropdown.
   *
   * @param  {toggle} toggle
   * @return {dropdown, null, undefined}:
   *  * undefined если входной параметр не toggle
   *  * null если dropdown не найден
   */

  function getDropdownFor(toggle) {
    var sibling;

    if(!isToggle(toggle)) {
      return undefined;
    }

    sibling = toggle.nextElementSibling;

    if(isElement(sibling)) {
      if(isDropdown(sibling)) return sibling;
      if(isDropdown(sibling.nextElementSibling)) return sibling.nextElementSibling;
      if(sibling.children.length && isDropdown(sibling.children[0])) return sibling.children[0];
    }

    else if(isDropdown(toggle.parentElement.nextElementSibling)) {
      return toggle.parentElement.nextElementSibling;
    }

    return null;
  }

  /**
   * Конструктор объкта data.
   *
   * Содержит:
   *  * toggle,
   *  * dropdown
   *  * context
   *  * callbacks - jСallback
   *
   * @param {toggle} toggle
   * @param {dropdown} dropdown
   * @param {context} context
   */

  function Data(toggle, dropdown, context) {
    this.toggle = toggle || null;
    this.dropdown = dropdown || null;
    this.context = context || null;
    this.callbacks = new $.Callbacks("unique");
  }

  /**
   * Получить context для node.
   *
   * @param  {node} node
   * @return {context, undefined}:
   *  * undefined если входной параметр не element
   */

  function getContext(node) {
    var context = root,
        data;

    if(!isElement(node)) {
      return undefined;
    }

    data = getData(node);

    if(data !== null) {
      return data.context || context;
    }

    while(!isRoot(node)) {
      node = node.parentElement;

      if(isDropdown(node)) {
        context = node;
        break;
      }
    }

    return context;
  }

  /**
   * Закрывает dropdown и генерирует событие close.
   *
   * @param  {dropdown} dropdown
   * @return {Boolean}
   */

  function close(dropdown) {
    var result = false;

    if(isOpened(dropdown)) {
      $(dropdown).removeClass("is-opened");
      sendEvent("close", getData(dropdown));
      result = true;
    }

    return result;
  }

  /**
   * Открывает dropdown и генерирует событие open.
   *
   * @param  {dropdown} dropdown
   * @return {Boolean}
   */

  function open(dropdown) {
    var result = false;

    if(!isOpened(dropdown)) {
      $(dropdown).addClass("is-opened");
      sendEvent("open", getData(dropdown));
      result = true;
    }

    return result;
  }

  /**
   * Запускает все callback-и, содержащиеся в jСallback в data context-а
   * и очищает jСallback.
   *
   * @param  {context} context
   * @return {jСallback, null}:
   *  * null при отсутствии data у context, либо входящий
   *    параметр не context
   */

  function fireCallbacks(context) {
    return hasData(context) && getData(context).callbacks.fire().empty() || null;
  }

  /**
   * Записывает data в context.
   *
   * @param  {context} context
   * @param  {data} data
   * @return {jObject}
   */

  function putData(context, data) {
    if(!(isDropdown(context) || context === root)) {
      throw new TypeError("target должен быть dropdown или root");
    }
    if(!isData(data)) {
      throw new TypeError("data должен быть Data");
    }

    return $(context).data({dropdown: data});
  }

  /**
   * Получает data из context.
   *
   * @param  {context} context
   * @return {data, null}
   */

  function getData(context) {
    return hasData(context) && $(context).data().dropdown || null;
  }

  /**
   * Удаляет data, при наличие в context. При успещном выполнении функция
   * должна возвратить удаленный data.
   *
   * @param  {context} context
   * @return {data, null}
   */

  function clearData(context) {
    var save = null;

    if(hasData(context)) {
      save = getData(context);
      $(context).removeData("dropdown");
    }

    return save;
  }

  /**
   * Передставляет собой комбинацию действий закрытия dropdown,
   * всех его потомков типа dropdown(если они открыты) и удаления data из него.
   * При успещном выполнении функция должна возвратить удаленный data.
   *
   * @param  {dropdown} dropdown
   * @return {false, data}
   */

  function closeAndClearData(dropdown) {
    var result = false;

    if(close(dropdown)) {
      fireCallbacks(dropdown);
      result = clearData(dropdown);
    }

    return result;
  }

  /**
   * Добавление callback в объект jCallbacks в data context-а.
   *
   * @param {context} context
   * @param {Function} callback
   * @return {jCallbacks, false, undefined}:
   *  * false, undefined - см. hasData
   */

  function addCallback(context, callback) {

    if(!(isDropdown(context) || context === root)) {
      throw new TypeError("context должен быть dropdown или root");
    }

    if(typeof callback !== "function") {
      throw new TypeError("callback должен быть function");
    }

    return hasData(context) && getData(context).callbacks.add(callback);
  }

  /**
   * Удаление callback из jCallbacks в data context-а.
   *
   * @param {context} context
   * @param {Function} callback
   * @return {jCallbacks, false, undefined}:
   *  * false, undefined - см. hasData
   */

  function removeCallback(context, callback) {

    if(!(isDropdown(context) || context === root)) {
      throw new TypeError("context должен быть dropdown или root");
    }

    if(typeof callback !== "function") {
      throw new TypeError("callback должен быть function");
    }

    return hasData(context) && getData(context).callbacks.remove(callback);
  }

  /**
   * Генерирует событие.
   *
   * @param  {string} type
   * @param  {anytype} args
   * @return {undefined}
   */

  function sendEvent(type, args) {
    $(document).trigger("dropdown." + type, args);
  }


  /**
   * Поиск element-а соответствующего одному из типов:
   *
   *  * toggle
   *  * closeBtn
   *  * dropdown
   *  * root
   *
   * Поиск производится на ветке родителей element-а включая его самого.
   * Поиск производится в порядке перечисленном выше.
   *
   * @param  {element} element
   * @return {object}:
   *  {
   *    node: [root, dropdown, toggle, closBtn],
   *    type: [string]
   *  }
   */

  function getClosestTarget(element) {
    var type = "root";

    if(!isElement(element)) {
      throw new TypeError("element должен быть element");
    }

    while(true) {

      if(isToggle(element)) {
        type = "toggle";
        break;
      }

      if(isCloseBtn(element)) {
        type = "closeBtn";
        break;
      }

      if(isDropdown(element)) {
        type = "dropdown";
        break;
      }

      if(isRoot(element)) {
        element = root;
        break;
      }

      element = element.parentElement;
    }

    return {node: element, type: type};
  }



  /**
   * Функция передается в качестве handler-а события click на document-е(root)
   * Описание:
   *
   *  1. Поиск элемента, на который нажал пользователь(см. getClosestTarget).
   *
   *  2. Если это toggle, то:
   *
   *  2.1 Находим ближайщий dropdown для toggle(см. getDropdownFor).
   *
   *  2.2 Если dropdown не найден, то посылаем в консоль сообщение и выходим из
   *      функции.
   *
   *  2.3 Получаем контекст dropdown-а(см. getContext).
   *
   *  2.4 Если dropdown в состоянии 'открыт', то закрываем его и удаляем
   *      данные(см. closeAndClearData, isOpened).
   *
   *  2.5 В случае отличном от описанного в п.2.4, т.е. dropdown в состоянии 'закрыт':
   *
   *        1. Запускаем все имеющиеся callback-и у контекста dropdown(см.п.2.3),
   *           которые должны закрыть все открытые dropdown-ы в этом контексте.
   *        2. Создаем и кладём в dropdown data(cm. Data, putData).
   *        3. Добавляем в контекст dropdown-а callback, который закроет dropdown при вызове.
   *        4. Открываем dropdown(см. open).
   *
   *  3. Если это closeBtn, то получаем контекст для closeBtn(контекст должен быть dropdown)
   *     и закрываем его с удалением данных.
   *
   *  4. В случаях отличных от описанных в п.2-3, т.е. клик был либо по root, либо по dropdown
   *     , то запускаем все callback-и для элемента полученного в п.1.
   *
   */

  function dropdownEventHandler(event) {
    var toggle,
        dropdown,
        context,
        target;

    target = getClosestTarget(event.target); /* 1 */

    if(target.type === "toggle") { /* 2 */
      toggle = target.node;
      dropdown = getDropdownFor(toggle); /* 2.1 */

      if(dropdown === null) { /* 2.2 */
        console.log("dropdown не найден");
        return;
      }

      context = getContext(dropdown); /* 2.3 */

      if(isOpened(dropdown)) { /* 2.4 */
        closeAndClearData(dropdown);
      }

      else { /* 2.5 */
        fireCallbacks(context);
        putData(dropdown, new Data(toggle, dropdown, context));
        addCallback(context, closeAndClearData.bind(dropdown, dropdown));
        open(dropdown);
      }
    }

    else if(target.type === "closeBtn") { /* 3 */
      closeAndClearData(getContext(target.node));
    }

    else { /* 4 */
      fireCallbacks(target.node);
    }
  }


  // Помещается data в root. в data всё, кроме callbacks, null.

  putData(root, new Data());

  // Ставится обработчик клика на root

  $(root).on('click', dropdownEventHandler);



  // Экспорт API

  API.modules.dropdown = {
    closeAll: function() { fireCallbacks(root); }
  }

})(window.aWebsite, jQuery);


//= include_tree plugins
;(function($){

  function isInHeader(toggle) {
    return Boolean($(toggle).parents(".header,.l-header").length);
  }

  function navEventHandler(e, data) {
    if(!isInHeader(data.toggle)) return;

    if(e.namespace === "open") {
      $(data.toggle).addClass("pointer");
    }

    else if(e.namespace === "close") {
      $(data.toggle).removeClass("pointer");
    }
  }

  $(document).on("dropdown.open dropdown.close",  navEventHandler);

})(jQuery);


