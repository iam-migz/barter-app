const Item = require('../models/item');

// item_index, item_details, item_create_get, item_create_post, item_delete

const item_index =  (req, res) => {
    Item.find().sort({ createdAt: -1 })
        .then(result => {
            res.render('items/index', { title: 'Home', items: result });
        })
        .catch(err => console.log(err));
}

const item_details = (req, res) => {
    const id = req.params.id;
    Item.findById(id)
        .then(result => res.render('items/details', { title: 'Details', item: result}))
        .catch(err => res.status(404).render('404'));
}

const item_create_get = (req, res) => {
    res.render('items/create', { title: 'Create a new blog' });
}

const item_create_post = (req, res) => {
    const item = new Item(req.body);
    item.save()
        .then(result => res.redirect('/items'))
        .catch(err => console.log(err));
}

const item_delete = (req, res) => { // ajax request, can't redirect on an ajax req
    const id = req.params.id;
    Item.findByIdAndDelete(id)
        .then(result => res.json({ redirect: '/items'})) // send back redirect code in a json to ajax request
        .catch(err => console.log(err));
}
module.exports = {
    item_index,
    item_details,
    item_create_get,
    item_create_post,
    item_delete
}