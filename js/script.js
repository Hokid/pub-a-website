window.aWebsite = {
  modules: {},
  observer: {}
};


//= include_tree modules
;(function(API, $){

  var root = document,
      rootBody = root.body,
      rootHTML = root.documentElement;



  // Различные проверки

  function isDropdown(node) {
    return isNode(node) && $(node).is('.js-dropdown');
  }

  function isToggle(node) {
    return isNode(node) && $(node).is('.js-dropdown-toggle');
  }

  function isCloseBtn(node) {
    return isNode(node) && $(node).is('.js-dropdown-close');
  }

  function isRoot(node) {
    return isNode(node) && (node === rootBody || node === rootHTML || node === root );
  }

  function isData(obj) {
    return obj instanceof Data;
  }

  function isOpened(dropdown) {
    if(!isDropdown(dropdown)) {
      throw new TypeError("параметр должен быть dropdown");
    }
    return $(dropdown).is(".is-opened");
  }

  function isNode(node) {
    return node && typeof node === "object" && node.nodeType;
  }

  function hasData(node) {
    return isNode(node) && isData($(node).data().dropdown);
  }




  function getDropdownFor(toggle) {
    var sibling,
        lim = 2;

    if(!isToggle(toggle)) {
      throw new TypeError("параметр должен быть toggle");
    }

    sibling = toggle.nextElementSibling;

    if(isNode(sibling)) {
      if(isDropdown(sibling)) return sibling;
      if(isDropdown(sibling.nextElementSibling)) return sibling.nextElementSibling;
      if(sibling.children.length) return sibling.children[0];
    }

    else if(isDropdown(toggle.parentElement.nextElementSibling)) {
      return toggle.parentElement.nextElementSibling;
    }

    return null;
  }

  function Data(toggle, dropdown, context) {
    this.toggle = toggle || null;
    this.dropdown = dropdown || null;
    this.context = context || null;
    this.callbacks = new $.Callbacks("unique");
  }

  function getContext(node) {
    var context = root;

    if(!isNode(node)) {
      throw new TypeError("параметр должен быть node");
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

  function close(dropdown) {
    if(!isDropdown(dropdown)) {
      throw new TypeError("параметр должен быть dropdown");
    }

    $(dropdown).removeClass("is-opened");
    sendEvent("close", getData(dropdown));
  }

  function open(dropdown) {
    if(!isDropdown(dropdown)) {
      throw new TypeError("параметр должен быть dropdown");
    }

    $(dropdown).addClass("is-opened");
    sendEvent("open", getData(dropdown));
  }

  function closeAllIn(context) {
    var $data = $(context).data().dropdown;

    if(isData($data)) {
      $data.callbacks.fire().empty();
    }
  }

  function putData(dropdown, data) {
    if(!isDropdown(dropdown)) {
      throw new TypeError("параметр должен быть dropdown");
    }
    if(!isData(data)) {
      throw new TypeError("параметр должен быть Data");
    }

    return $(dropdown).data({dropdown: data});
  }

  function getData(dropdown) {
    if(!isDropdown(dropdown)) {
      throw new TypeError("параметр должен быть dropdown");
    }

    return $(dropdown).data().dropdown || null;
  }

  function clearData(dropdown) {
    if(!isDropdown(dropdown)) {
      throw new TypeError("параметр должен быть dropdown");
    }

    return $(dropdown).removeData("dropdown");
  }

  function closeAndClearData(dropdown) {
    if(!isDropdown(dropdown)) {
      throw new TypeError("параметр должен быть dropdown");
    }

    close(dropdown);
    closeAllIn(dropdown);
    clearData(dropdown);
  }

  function addCallback(target, callback) {
    var $data;

    if(!(isDropdown(target) || isRoot(target))) {
      throw new TypeError("параметр должен быть dropdown или root");
    }

    if(typeof callback !== "function") {
      throw new TypeError("параметр должен быть function");
    }

    $data = $(target).data().dropdown;

    if(isData($data)) {
      $data.callbacks.add(callback);
    }
  }

  function sendEvent(type, args) {
    $(document).trigger("dropdown." + type, args);
  }

  function getClosestTarget(startNode) {
    var target = startNode,
        type = "root";

    if(!isNode(target)) {
      throw new TypeError("параметр должен быть node");
    }

    while(true) {

      if(isToggle(target)) {
        type = "toggle";
        break;
      }

      if(isCloseBtn(target)) {
        type = "closeBtn";
        break;
      }

      if(isDropdown(target)) {
        type = "dropdown";
        break;
      }

      if(isRoot(target)) {
        target = root;
        break;
      }

      target = target.parentElement;
    }

    return {node: target, type: type};
  }




  function dropdownEventHandler(event) {
    var toggle,
        dropdown,
        context,
        target;

    target = getClosestTarget(event.target);

    if(target.type === "toggle") {
      toggle = target.node;
      dropdown = getDropdownFor(toggle);

      if(!isDropdown(dropdown)) {
        console.log("dropdown не найден");
        return;
      }

      context = hasData(dropdown) ? getData(dropdown).context : getContext(dropdown);

      if(isOpened(dropdown)) {
        closeAllIn(context);
      }

      else {
        closeAllIn(context);
        putData(dropdown, new Data(toggle, dropdown, context));
        addCallback(context, closeAndClearData.bind(null, dropdown));
        open(dropdown);
      }
    }

    else if(target.type === "closeBtn") {
      context = getContext(target.node);

      if(isDropdown(context) && hasData(context)) {
        closeAllIn(getData(context).context);
      }
    }

    else {
      closeAllIn(target.node);
    }
  }



  $(root).data({dropdown: new Data()});
  $(root).on('click', dropdownEventHandler);



  API.modules.dropdown = {
    closeAllIn: closeAllIn,
    closeAndClearData: closeAndClearData,
    close: close,
    open: open
  }

})(window.aWebsite, jQuery);


//= include_tree plugins
;(function($){

  function isInHeader(toggle) {
    return $(toggle).parents(".header,.l-header").length;
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


