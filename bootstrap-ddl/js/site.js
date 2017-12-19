$(function () {
    // jQuery helper method for checking if selector returned any results
    $.fn.exists = function () {
        return this.length !== 0;
    }
});