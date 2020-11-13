const express = require('express');
const itemController = require('../controllers/itemController');
const router = express.Router();


router.get('/', itemController.item_index);

router.post('/', itemController.item_create_post);

router.get('/create', itemController.item_create_get);

router.get('/:id', itemController.item_details);

router.delete('/:id', itemController.item_delete);

module.exports = router;