const fetchSomething = (path, callback) => {
    fetch(path).then(res => res.json().then(data => callback(data)).catch(err => {
        console.log(err);
    })).catch(err => {
        console.log(err);
    })
}

export default fetchSomething;