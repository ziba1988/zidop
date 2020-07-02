import { isFunction, isInteger, isArray } from '../util/is'
import createRequest from '../util/createRequest'
import localProcedureCall from '../util/localProcedureCall'
import { FUNCTION_CREATOR } from '../const'

export default function createNodeFactory({ encode, decode }) {
    return function createNode({
        serialize = JSON.stringify,
        deserialize = JSON.parse,
        rpcFilter = (props) => props.rpc,
        errorInstances = [Error],
    } = {}) {
        const requests = {}
        const local_functions_id = {}
        const local_functions = new Map()
        let local_function_index = 0
        let request_id_index = 0

        const encode_params = {
            local_functions,
            registerLocalFunctionFromEncode,
        }

        function registerLocalFunction(function_id, fn) {
            local_functions_id[function_id] = fn
            local_functions.set(fn, function_id)
            return function_id
        }

        function createRemoteFunction({
            function_id,
            target,
            path,
            caller,
            function_creator,
        }) {
            const makeCall = (request_id, args) => {
                const data = [request_id, function_id]
                if (args.length > 0) data.push(args)
                api.send(encode(data, encode_params))
                return data
            }

            const rpc = (...args) => {
                const request_id = ++request_id_index
                const req = createRequest()
                const { resolve, reject } = req
                const resolveOrReject = (fn, value) => {
                    fn(value)
                    delete requests[request_id]
                    return req
                }
                req.data = makeCall(request_id, args)
                req.node = api
                req.createdAt = new Date().getTime()
                req.resolve = (value) => resolveOrReject(resolve, value)
                req.reject = (error) => resolveOrReject(reject, error)
                requests[request_id] = req
                return req
            }

            rpc.push = (...args) => {
                makeCall(0, args)
            }

            return rpcFilter({
                rpc,
                node: api,
                function_id,
                function_creator,
                caller,
                path,
            })
        }

        function open(send, fn) {
            const local_function_id = local_function_index++
            if (isFunction(fn)) registerLocalFunction(local_function_id, fn)
            api.send = (msg) => send(serialize(msg))
            return createRemoteFunction({
                function_id: 0,
                function_creator: FUNCTION_CREATOR.ENTRY,
            })
        }

        function message(msg) {
            msg = deserialize(msg)
            if (!isArray(msg) || !isInteger(msg[0])) {
                return false
            }

            const [id, function_id] = msg
            const is_request = id > -1
            const fn = is_request ? local_functions_id[function_id] : undefined

            msg = decode(msg, {
                createRemoteFunction,
                caller: fn,
                function_creator: is_request
                    ? FUNCTION_CREATOR.REQUEST
                    : FUNCTION_CREATOR.RESPONSE,
            })

            let args = msg[2]
            const response_id = -id

            if (is_request && isFunction(fn)) {
                args = isArray(msg[2]) ? msg[2] : []

                // Request without response
                if (id === 0) {
                    const req = { node: api }
                    args.push(req)
                    fn.apply(req, args)
                }

                // Request
                else {
                    const req = createRequest()
                    const response = [response_id]
                    req.node = api
                    req.then((value) => {
                        response.push(0) // no errors
                        if (value !== undefined) response.push(value)
                        api.send(encode(response, encode_params))
                    }).catch((error) => {
                        response.push(error === 0 ? null : error)
                        api.send(encode(response, encode_params))
                    })
                    args.push(req)
                    localProcedureCall(fn, req, args, errorInstances)
                }
                return true
            }

            // Response
            else if (id < 0 && requests.hasOwnProperty(response_id)) {
                const response_status = function_id
                const req = requests[response_id]
                response_status === 0
                    ? req.resolve(args)
                    : req.reject(response_status)
                return true
            }

            return false
        }

        function registerLocalFunctionFromEncode(fn) {
            return registerLocalFunction(local_function_index++, fn)
        }

        const api = {
            open,
            message,
            requests,
        }

        return api
    }
}
