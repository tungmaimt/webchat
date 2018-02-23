let handlers = [];

const handleResponse = (response, data) => {
    handlers.forEach((element) => {
        if (element.response === response) element.handle(data);
    })
}

const registerHandleResponse = (response, callback) => {
    if (handlers.length === 0) {
        handlers.push({
            response: response,
            handle: callback
        })
    } else {
        let check = 0;
        handlers.forEach((element, index) => {
            if (check === 0) {
                if (response === element.response && callback === element.handle) {
                    check = 1;
                }
            } else if (check !== 1 && index === handlers.length - 1) {
                handlers.push({
                    response: response,
                    handle: callback
                })
            }
        });
    }
}

export {handleResponse};
export {registerHandleResponse};