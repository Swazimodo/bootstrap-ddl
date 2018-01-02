$(function () {
    jQuery.fn.loadOptions = function (options, allowNull, currentIndex) {
        // Get current element
        var $o = $(this[0])

        // check if this is an input
        if (!$o.is('input.form-control'))
            throw 'bootstrap-ddl: loadOptions can only be called on "input.form-control"';

        // check if the parent is a ".form-group.drop-down-list"
        if (!$o.parents('.form-group.drop-down-list').exists())
            throw 'bootstrap-ddl: loadOptions can only be called inside ".form-group.drop-down-list"';

        // get or create .dropdown-menu
        var $ul = $o.siblings('.dropdown-menu');
        if (!$ul.exists()) {
            //throw 'bootstrap-ddl: ul.dropdown-menu was missing';
            $ul = $('<ul class="dropdown-menu"></ul>');
            var $e = $o.next();
            if ($e.is('span.ddl-caret'))
                $ul.insertAfter($e);
            else {
                console.log('bootstrap-ddl: missing span.ddl-caret after input');
                $ul.insertAfter($o);
            }
        }

        // check if null values are allowed
        if (allowNull === true)
            $o.addClass('nullable');
        else
            $o.removeClass('nullable');

        // Check if there are options to load
        if (options && options.length != undefined) {
            var selIndex = -1;
            if (currentIndex) {
                // Check if current index is a number and it is in range
                if (!isNaN(currentIndex)) {
                    var index = parseInt(currentIndex);
                    if (options.length < index)
                        throw 'bootstrap-ddl: currentIndex value exceeds options.length';
                    selIndex = index;
                }
                else
                    throw 'bootstrap-ddl: currentIndex is not valid';
            }

            //create elements for each option in the array
            for (var i = 0; i < options.length; i++) {
                //skip any invalid entires
                if (!options[i])
                    continue;

                var $li = $('<li></li>');
                var $a = $('<a></a>');

                if (typeof options[i] === 'string' || options[i] instanceof String || !isNaN(options[i])) {
                    // create option from a static string or number
                    $a.text(options[i]);
                }
                else if (options[i].html) {
                    // create option using inner html value
                    $a.html(options[i].html);

                    // add display text if specified
                    if (options[i].text)
                        $li.data('text', options[i].text);
                }
                else if (options[i].text){
                    // create option using text
                    $a.text(options[i].text);
                }
                else
                    console.log('options[' + i + '] is not valid');

                // save value if supplied
                if (options[i].value)
                    $li.data('value', options[i].value);

                //add to DOM
                $a.appendTo($li);
                $li.appendTo($ul);

                //select active item
                if (i == selIndex) {
                    $li.addClass('active');
                    selectDdlItem.call($ul);
                }
            }
        }
        else
            throw 'bootstrap-ddl: There are not any options to load';

        // This is needed so others can keep chaining off of this
        return this;
    };

    // jQuery helper function for checking if selector returned any results
    $.fn.exists = function () {
        return this.length !== 0;
    }

    // jQuery helper function to determine if an element is visible withing a parent element with overflow
    $.fn.overflowVisible = function (partial, parent, child) {
        var $outer = $(parent);
        var $child = $(child);

        if (partial)
            return ($child.position().top >= 0 && $child.position().top < $outer.height());
        else
            return ($child.position().top - $child.height() >= 0 && $child.position().top + $child.height() < $outer.height());
    };

    // DDL handlers
    $(document).on('blur', '.drop-down-list input.form-control', onDdlBlur);
    $(document).on('click', '.drop-down-list input.form-control', onDdlClick);
    $(document).on('keypress', '.drop-down-list input.form-control', onDdlKeyPress);
    $(document).on('keydown', '.drop-down-list input.form-control', onDdlKeyDown);
    $(document).on('mousedown', '.drop-down-list .dropdown-menu li', onDdlMenuMouseDown);
    $(document).on('click', '.drop-down-list .dropdown-menu li', onDdlMenuClick);
});

//close menu when control loses focus
function onDdlBlur() {
    closeDdlMenu.call(this);
}

//toggle on click
function onDdlClick() {
    ddlToggle.call(this);
}

//toggle menu on enter
function onDdlKeyPress(e) {
    var keycode = (e.keyCode ? e.keyCode : e.which);
    if (keycode == 13) {
        ddlToggle.call(this);
    }
}

//watch for arrow keys
function onDdlKeyDown(e) {
    var menu = $(this).siblings('.dropdown-menu');
    var active = menu.find('li.active');
    var keycode = (e.keyCode ? e.keyCode : e.which);

    //allow enter to pass through
    if (keycode != 13)
        e.preventDefault();

    if (keycode == 27) {
        //escape pressed, close menu without making any changes
        closeDdlMenu.call(this);
    }

    if (keycode == 40 || keycode == 38) {
        if (keycode == 40) {
            //down pressed
            if (active.exists() && active.next().exists()) {
                active.removeClass('active');
                active = active.next().addClass('active');
            }
        } else if (keycode == 38) {
            //up pressed
            if (active.exists() && active.prev().exists()) {
                active.removeClass('active');
                active = active.prev().addClass('active');
            }
        }
        //check if arrows have moved the selected value off the screen
        if (!active.overflowVisible(false, menu, active))
            menu.scrollTop(menu.scrollTop() + active.position().top, 0);
        return;
    }

    //exit if this is not [a-z]
    if (keycode < 65 || keycode > 90)
        return;

    var char = String.fromCharCode(keycode).toLowerCase();
    var now = new Date();
    if ((now.getTime() - _ddlSearch.lastPress) > 300) {
        //start a new search
        _ddlSearch.search = char;
    }
    else {
        _ddlSearch.search += char;
    }
    _ddlSearch.lastPress = now;

    for (var i = 0; i < _ddlSearch.items.length; i++) {
        //look for first item that starts the same as the search
        if (_ddlSearch.items[i].startsWith(_ddlSearch.search)) {
            //select item and scroll to it
            var lis = _ddlSearch.ul.find('li:not(.null)');
            _ddlSearch.ul.children().removeClass('active');
            lis.eq(i).addClass('active');
            _ddlSearch.ul.scrollTop(_ddlSearch.ul.scrollTop() + lis.eq(i).position().top, 0);
            break;
        }
    }
}

//block the dropdown from stealing focus
function onDdlMenuMouseDown(e) {
    e.preventDefault();
}

function onDdlMenuClick() {
    var li = $(this);
    li.siblings().removeClass('active');
    li.addClass('active');
    selectDdlItem.call(li.parent());
    closeDdlMenu.call(li.parents('.drop-down-list').find('.form-control'))
}

//toggle menu
function ddlToggle() {
    var input = $(this);
    var menu = input.siblings('.dropdown-menu');
    var selected;

    if (!input.hasClass('open')) {
        //display menu
        input.addClass('open');
        menu.show();

        //check if input needs null value option
        if (input.hasClass('nullable') && !menu.find('li.null').exists()) {
            //create null option with the text from placeholder
            var nullOption = $('<li class="null"><a></a></li>');
            menu.prepend(nullOption);
            var text = input.attr('placeholder');
            if (!text) text = 'Select an item';
            nullOption.find('a').text(text).data('text', text);
        }

        if (!input.val()) {
            //no value is selected yet so highlight the first option
            selected = menu.children().first().addClass('active');
            selected.siblings().removeClass('active');

        }
        else {
            //find selected row
            selected = menu.children().filter(function () {
                var s = getDdlOptionText.call(this);
                return s === input.val();
            }).addClass('active');
            selected.siblings().removeClass('active');
        }

        ddlStartSearch.call(menu);
        menu.scrollTop(menu.scrollTop() + selected.position().top, 0);
    }
    else {
        //hide menu
        closeDdlMenu.call(input);
        selectDdlItem.call(menu);
        ddlStartEnd();
    }
}

//gets the text value from an .dropdown-menu li
function getDdlOptionText() {
    var el = $(this);
    var text = '';
    if (!el.hasClass('null')) {
        text = el.data('text');
        if (!text)
            text = el.text();
    }
    return text;
}

//select the active item
function selectDdlItem() {
    var menu = $(this);
    var input = menu.siblings('input.form-control');
    var li = menu.find('li.active');
    input.val(getDdlOptionText.call(li));

    // set option key value
    var value = li.data('value');
    if (value == undefined)
        input.removeData('value');
    else
        input.data('value', value);
}

//Close the ddl menu
function closeDdlMenu() {
    var input = $(this).removeClass('open');
    input.siblings('.dropdown-menu').hide();
}

var _ddlSearch = {
    items: [],
    ul: undefined,
    lastPress: 0,
    search: '',
    active: false
};

//set ddl search info obj
function ddlStartSearch() {
    //get current list of items to look through
    var ul = $(this);
    var items = ul.find('li:not(.null)').map(function (i, o) {
        return getDdlOptionText.call(o).toLowerCase();
    });

    _ddlSearch = {
        items: items,
        ul: ul,
        lastPress: 0,
        search: '',
        active: true
    };
}

//clear ddl search obj
function ddlStartEnd() {
    _ddlSearch = {
        items: [],
        ul: undefined,
        lastPress: 0,
        search: '',
        active: false
    };
}
