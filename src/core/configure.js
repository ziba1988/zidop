
// Configure a new object with the remote callbacks ~PATH and observe if is observable
syncio.configure = function( object, path, isobservable ) {

    var that = this;

    Object.defineProperty( object, syncio.key_object_path, {value: path} );

    // if ( isobservable )
        // Object.observe( object, this.observe );

    syncio.path( object, function(subpath, value, key, obj ) {

        var newpath = path.concat(subpath);

        if ( value === that.stringify_function )
            obj[key] = syncio.create_remote_function.call( that, newpath );

        if ( value !== null && typeof value == 'object' && typeof value[syncio.key_object_path] == 'undefined' ) {
        
            Object.defineProperty( value, syncio.key_object_path, {value: newpath} );
            
            // if ( isobservable )
                // Object.observe( value, that.observe );

        }

    });

};




/*

syncio.api.prototype.observe = function(changes) {

    for (var i=0; i<changes.length; i++) {
        
        var path = changes[i].object._path.slice(0);
        path.push( changes[i].name )

        if (
            (changes[i].type == 'update' || changes[i].type == 'add') &&
            changes[i].object[changes[i].name] !== null &&
            typeof changes[i].object[changes[i].name] == 'object'
        ) {
            syncio.observe(changes[i].object[changes[i].name], tcallback_observer, path );
        }

        console.log( changes[i].type, path, changes[i].oldValue );
        console.log()

    }

};




// setTimeout(function(){

MYSERVE = new syncio.instance();
MYOBJECT = {
    foo: 0,
    bar: 1,
    obj: {
        paco: 2,
        pil: 3,
        arr: [1,2,3,4]
    }
};

syncio.observe(MYOBJECT, MYSERVE.observe.bind(MYSERVE), [12345] );

MYOBJECT.obj.arr[2] = 'ONE';
MYOBJECT.obj.arr = 'TWO';
MYOBJECT.foo = 'THREE';
MYOBJECT.bar = 'FOUR';
// delete MYOBJECT.obj.arr;
MYOBJECT.obj.arr = [1,2,3,{paco:'pil'}];
setTimeout(function(){
    console.log('reobserve')
    MYOBJECT.obj.arr[3].paco = 'porras';
},1)


// },5000)
*/