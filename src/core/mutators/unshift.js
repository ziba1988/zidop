
dop.core.unshift = function(array, items) {
    if (items.length === 0)
        return array.length;
    items.unshift(0, 0);
    var spliced = dop.core.splice(array, items);
    return array.length;
};