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
 *  jСallback - объект Callbacks jQuery.
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
      rootHTML = root.documentElement,
      dropdownSelector = '.js-dropdown';
      toggleSelector = '.js-dropdown-toggle';
      closeBtnSelector = '.js-dropdown-close';



  /**
   * --------------------------------
   *             ПРОВЕРКИ
   * --------------------------------
   */

  /**
   * Соответствует ли anytype типу dropdown.
   *
   * @param  {anytype} anytype
   * @return {Boolean}
   */

  function isDropdown(anytype) {
    return isElement(anytype) && $(anytype).is(dropdownSelector);
  }

  /**
   * Соответствует ли anytype типу toggle.
   *
   * @param  {anytype} anytype
   * @return {Boolean}
   */

  function isToggle(anytype) {
    return isElement(anytype) && $(anytype).is(toggleSelector);
  }

  /**
   * Соответствует ли anytype типу closeBtn.
   *
   * @param  {anytype} anytype
   * @return {Boolean}
   */

  function isCloseBtn(anytype) {
    return isElement(anytype) && $(anytype).is(closeBtnSelector);
  }

  /**
   * Соответствует ли anytype типу root.
   *
   * @param  {any type} anytype
   * @return {Boolean}
   */

  function isRoot(node) {
    return isElement(node) && (node === rootBody || node === rootHTML || node === root );
  }

  /**
   * Соответствует ли anytype типу data.
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
   * Соответствует ли anytype типу node.
   *
   * @param  {anytype} anytype
   * @return {Boolean}
   */

  function isNode(anytype) {
    return anytype instanceof Node;
  }

  /**
   * Соответствует ли anytype типу element.
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
    * Возвращает строку содержащую тип элемента, либо undefined, если
    * параметр element не известен.
    *
    * @param  {element} element
    * @return {string, undefined}
    */

   function typeOf(element) {
    var type;

    isToggle(element) && (type = 'toggle');
    isCloseBtn(element) && (type = 'closeBtn');
    isDropdown(element) && (type = 'dropdown');
    isRoot(element) && (type = 'root');

    return type;
   }

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
    var context,
        data;

    if(!isNode(node)) {
      return undefined;
    }

    data = getData(node);

    if(data !== null) {
      return data.context || context;
    }

    context = $(node).parent().closest(dropdownSelector);

    return context.length ? context[0] : root;
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
    var target,
        queue = [toggleSelector, closeBtnSelector, dropdownSelector, 'body'];

    if(!isElement(element)) {
      throw new TypeError("element должен быть element");
    }

    target = $(element).closest(queue.join(','));
    target = target.length && target[0] !== rootBody ? target[0] : root;

    return {node: target, type: typeOf(target)};
  }



  /**
   * --------------------------------
   *     API для работы с HTML
   * --------------------------------
   */


  /**
   * Создаст элемент списка(li>a) и положит внутрь content(при наличии).
   *
   * @param  {anytype} content
   * @param  {string} href (значение по умолчанию '#')
   * @return {jObject}
   */

  function createItem(content, href) {
    var href = typeof href === 'string' ? href : '#',
        $item = $('<li class="dropdown-box__item" />'),
        $link = $('<a href='+href+' class="dropdown-box__link" />');

    !(content instanceof $) && (content = $(content));
    content.length && $link.append(content);

    return $item.append($link)[0];
  }



  /**
   * --------------------------------
   *           Инициализация
   * --------------------------------
   */


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
    closeAll: function() { fireCallbacks(root); },
    createItem: createItem,
    getDropdownFor: getDropdownFor,
    isOpened: isOpened,
    closeAndClearData: closeAndClearData
  }

})(window.aWebsite, jQuery);

;(function(API, $) {

  //TODO:
  // * комменты
  // * оптимизация

  var timerId,
      $items,
      length,
      index,
      dropdown = API.modules.dropdown;

  function getWidthWithMargin($element) {
    var hMargins;

    !($element instanceof $) && ($element = $($element));

    hMargins = parseInt($element.css('margin-left'))
               +
               parseInt($element.css('margin-right'));

    return $element.outerWidth() + hMargins;
  }

  function hideItems(items) {
    var $lastItem,
        $prevItem;

    if(items instanceof $ && items.length) {
      $lastItem = items.last();
      $prevItem = items.first().prev();

      if($lastItem.is('.is-last')) {
        $lastItem.removeClass('is-last');
      }

      items.hide();

      if($prevItem.length) {
        $prevItem.addClass('is-last');
      }

      return items;
    }
  }

  function showItems(items) {
    var $lastItem,
        $prevItem,
        $nextItem;

    if(items instanceof $ && items.length) {
      $lastItem = items.last();
      $prevItem = items.first().prev();

      if($prevItem.length && $prevItem.is('.is-last')) {
        $prevItem.removeClass('is-last');
      }

      items.show();

      if($lastItem.next().length) {
        $lastItem.addClass('is-last');
      }

      return items;
    }
  }

  function run(element) {
    var $horNav = $(element),
        $box = $horNav.find('> .js-hor-nav-box'),
        $toggle = $box.next().find('> .js-dropdown-toggle'),
        $dropdown,
        $boxChildren,
        $currentChild,
        $itemsArray,
        length,
        isLast = false,
        maxWidth,
        boxOuterWidth,
        isToggleHidden,
        toggleOuterWidth,
        currentWidth;

    if($box.length === 1 && $toggle.length === 1) {
      maxWidth = $horNav.width();
      boxOuterWidth = getWidthWithMargin($box);
      isToggleHidden = $toggle.css('display') === 'none';

      if(isToggleHidden && (boxOuterWidth < maxWidth)){
        return;
      }

      toggleOuterWidth = isToggleHidden ? 0 : getWidthWithMargin($toggle);
      currentWidth = boxOuterWidth + toggleOuterWidth;
      $currentChild = $box.find('> .is-last');
      !$currentChild.length && ($currentChild = $box.find('> :last'));
      $itemsArray = $();
      $dropdown = $toggle.next();

      if(currentWidth > maxWidth) {

        isToggleHidden && (currentWidth += getWidthWithMargin($toggle));

        do {
          currentWidth -= getWidthWithMargin($currentChild);
          $itemsArray = $itemsArray.add($currentChild);
          $currentChild = $currentChild.prev();
        } while(currentWidth > maxWidth && $currentChild.length);


        hideItems($itemsArray);
        isToggleHidden && $toggle.show();

        $dropdown.prepend(
          $itemsArray.map(
            function(index, element) {
              return dropdown.createItem($(element).contents().clone()); /* !!! */
            }
          )
        );

      }

      else if(currentWidth < maxWidth) {

        while(!isLast) {

          $currentChild = $currentChild.next();
          currentWidth += getWidthWithMargin($currentChild);

          if($currentChild.is(':last-child')) {

            if(currentWidth - toggleOuterWidth < maxWidth) {
              isLast = true;
            }

            else {
              break;
            }
          }

          if(isLast || currentWidth < maxWidth) {
            $itemsArray = $itemsArray.add($currentChild);
          }
        }

        if(isLast) {
          dropdown.closeAndClearData($dropdown[0]);
          $toggle.hide();
        }

        if(length = $itemsArray.length) {
          showItems($itemsArray);

          while(length--) {
            $dropdown.find('> :first').remove();
          }
        }
      }
    }
  }

  function runHandler() {
    if(length > index) {
      run($items[index++]);
      timerId = setTimeout(runHandler, 0);
    }
    // else {
    //   console.timeEnd('===');
    //   return window.next && window.next();
    // }
  }

  function horNavEventHandler() {
    //console.time('===');
    clearTimeout(timerId);

    $items = $('.js-hor-nav');
    length = $items.length;
    index = 0;

    timerId = setTimeout(runHandler, 250);
  }

  $(horNavEventHandler);
  $(window).resize(horNavEventHandler);

  // window.test = function(time, size) {
  //   var time = time;
  //   var defaultSize = false;
  //   var $cnt = $('#COL');
  //   var size = size;

  //   window.next = function() {
  //     if(defaultSize) {
  //       $cnt.css('width', 'auto');
  //       defaultSize = false;
  //     }
  //     else {
  //       $cnt.css('width', size);
  //       defaultSize = true;
  //     }
  //     --time && horNavEventHandler();
  //   };

  //   horNavEventHandler();
  // }

  // window.next;
  // window.stop = function() {
  //   window.next = undefined;
  // }

})(window.aWebsite, jQuery);


//= include_tree plugins
;(function($){

  function inHeader(toggle) {
    return Boolean($(toggle).closest(".header,.l-header").length);
  }

  function navEventHandler(e, data) {
    if(data.context !== document || !inHeader(data.toggle)) return;

    if(e.namespace === "open") {
      $(data.toggle).parent().addClass("pointer");
    }

    else if(e.namespace === "close") {
      $(data.toggle).parent().removeClass("pointer");
    }
  }

  $(document).on("dropdown.open dropdown.close",  navEventHandler);

})(jQuery);


