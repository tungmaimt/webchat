let handlers = [];

const handleResponse = (response, data) => {
    handlers.forEach((element) => {
        if (element.response === response) element.handle(data);
    })
}

const registerHandleResponse = (response, callback) => {
    let handler = {
        response: response,
        handle: callback
    }
    handlers.push(handler);
}

const removeHandleResponse = (response, callback) => {
    let handler = {
        response: response,
        handle: callback
    }
    handlers.forEach((element, index) => {
        if (JSON.stringify(element) === JSON.stringify(handler)) {
            handlers.splice(index, 1);
        }
    })
}

export { handleResponse };
export { registerHandleResponse, removeHandleResponse };