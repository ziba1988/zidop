

syncio.on.request = function( user, request ) {

    var response = [ request[0] * -1, syncio.protocol.fulfilled ];

    var promise = { request: request, response: response, user: user };
    promise.resolve = syncio.response.resolve.bind( promise );
    promise.reject = syncio.response.reject.bind( promise );

    var params = [ 'request' ];
    params = params.concat( request[2] );
    params.push(promise);

    this.emit.apply(this, params );

};