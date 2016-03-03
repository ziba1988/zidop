
var dop = {

    version: '0.9.0',
    name: 'dop',
    port: 4444,
    
    // keys
    key_user_token: '~TOKEN',
    key_object_path: '~PATH',
    stringify_function: '~F',
    stringify_undefined: '~U',
    stringify_regexp: '~R',
    name_remote_function: '$DOP_REMOTE_FUNCTION',

    // Data
    node_inc:0,
    node:{},
    object_inc:0,
    object:{},

    // src
    util:{},
    on:{},
    listener:{},
    connector:{},

};


if ( typeof module == 'object' && module )
    module.exports = dop;