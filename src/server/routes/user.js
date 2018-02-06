const express = require('express');
const router = express.Router();

router.get('/:name', (req, res) => {
    res.json({ "name": req.params.name });
})

module.exports = router;