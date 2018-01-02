$(function () {
    //Example 1
    var opts = [
        'Option 1',
        'Option 2',
        'Option 3'
    ];
    $('#ex-2-1').loadOptions(opts, true);

    //Example 2
    opts = [{
        text: 'Option 1',
        value: 1
    },
    {
        text: 'Option 2',
        value: 2
    },
    {
        text: 'Option 3',
        value: 3
    }];
    $('#ex-2-2').loadOptions(opts, true);

    //Example 3
    opts = [{
        text: 'Option 1',
        html: '<div class="title">Option 1</div><div>Details</div>',
        value: 1
    },
    {
        text: 'Option 2',
        html: '<div class="title">Option 2</div><div>Details</div>',
        value: 2
    },
    {
        text: 'Option 3',
        html: '<div class="title">Option 3</div><div>Details</div>',
        value: 3
    }];
    $('#ex-2-3').loadOptions(opts, true);
});