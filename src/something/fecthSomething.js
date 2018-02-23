const fetchSomething = (path, option, callback) => {
    fetch(path, option).then(res => res.json().then(data => callback(data)).catch(err => {
        console.log(err);
    })).catch(err => {
        console.log(err);
    });
};

export default fetchSomething;