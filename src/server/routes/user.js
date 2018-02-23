const express = require('express');
const router = express.Router();

router.get('/', (req, res) => {
    res.json({ "name": "tungmai" });
});

router.post('/', (req, res) => {
    res.json({ "tung": "mai" });
})

module.exports = router;