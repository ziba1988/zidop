

syncio.on.connect = function( user_socket, request ) {

    var response = [request[0] * -1],
        user = new syncio.user( this, user_socket );

    user_socket[ syncio.key_user_token ] = user.token;  
    // Object.defineProperty(user_socket, syncio.key_user_token, {
    //     value: user.token,
    //     enumerable: true,
    //     configurable: true,
    //     writable: false
    // });
   
    // Setup server for new user
    this.users[ user.token ] = user;

    response.push( syncio.protocol.connect, user.token );

    if ( this.stringify_function !== syncio.stringify_function )
        response.push( this.stringify_function );
    

    this.emit( 'connect', user, request, response );

    user.send( JSON.stringify( response ) );

};