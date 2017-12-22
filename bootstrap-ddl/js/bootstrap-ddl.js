$(function () {
    // jQuery helper function for checking if selector returned any results
    $.fn.exists = function () {
        return this.length !== 0;
    }

    // jQuery helper function to determine if an element is visible withing a parent element with overflow
    $.fn.visible = function (partial, parent, child) {
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
        if (!active.visible(false, menu, active))
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
            menu.prepend('<li class="null"><a></a></li>');
            var text = input.attr('placeholder');
            menu.find('li.null a').text(text)
                .data('text', text);
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
    var text = getDdlOptionText.call(menu.find('li.active'));
    menu.siblings('input.form-control').val(text);
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
