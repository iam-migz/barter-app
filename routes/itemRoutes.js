const express = require('express');
const itemController = require('../controllers/itemController');
const router = express.Router();
const { checkUser, requireAuth } = require('../middleware/authMiddleware');


router.get('/', itemController.item_index);

router.post('/', checkUser, itemController.item_create_post);

router.get('/create', requireAuth, itemController.item_create_get);

router.get('/youritems', requireAuth, itemController.item_youritems_get);

router.get('/request', requireAuth, itemController.item_barter_request_get);

router.post('/request', requireAuth, itemController.item_barter_request_post);

router.get('/outgoing', requireAuth, itemController.request_outgoing);

router.get('/incoming', requireAuth, itemController.request_incoming);

router.get('/all', requireAuth, itemController.request_all);

router.get('/fake', requireAuth, itemController.fake_api);

router.post('/update/:requestID', requireAuth, itemController.request_update_response);



router.get('/barter/:prodID/:sellerID', requireAuth, itemController.item_barter_get);


router.get('/:id', requireAuth, itemController.item_details);

router.delete('/:id', requireAuth, itemController.item_delete);


module.exports = router;