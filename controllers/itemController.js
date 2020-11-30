const Item = require('../models/item');
const User = require('../models/User'); 
const Barter = require('../models/Barter'); 
const mongoose = require('mongoose');
const methodOverride = require('method-override');

// initialize gridfs stream todo crud on images
let gfs;

mongoose.connection.once('open', () => {
    console.log('connection opened');
    gfs = new mongoose.mongo.GridFSBucket(mongoose.connection.db, {
        bucketName: 'photos'
    });
});

// render image
const image_render = (req, res) => {
    gfs.find({ filename: req.params.filename }).toArray((err, files) => {

        if (!files[0] || files.length === 0) {
            return res.status(200).json({
                success: false,
                message: 'No files available'
            });
        }

        if (files[0].contentType === 'image/jpeg'
            || files[0].contentType === 'image/png'
            || files[0].contentType === 'image/svg+xml') {
            // read & write stream using pipe
            gfs.openDownloadStreamByName(req.params.filename).pipe(res);
        } else {
            res.status(404).json({
                err: 'Not an image'
            });
        }
    });
}

const item_index =  (req, res) => {
    Item.find().sort({ createdAt: -1 })
        .then(result => {
            res.render('items/index', { title: 'Browse', items: result });
        })
        .catch(err => console.log(err));
}

const item_details = (req, res) => {
    const id = req.params.id;
    
    // we query the item first, because the item contains the seller id
    // then we query the seller
    Item.findById(id)
        .then(result => {
            User.findById(result.seller) // find the seller object
                .then(data => {
                    res.render('items/details', { title: 'Details', item: result, seller: data });
                })
                .catch(err => console.log(err));
        })
        .catch(err => res.status(404).render('404'));
}

const item_create_get = (req, res) => {
    res.render('items/create', { title: 'Create a new blog' });
}

const item_create_post = (req, res) => {
    // we get res.locals.user because i put the checkUser in this route
    req.body.seller = res.locals.user._id.toString();
    req.body.availability = true;
    req.body.filename = req.file.filename;
    const item = new Item(req.body);
    item.save()
        .then(result => res.redirect('/items'))
        .catch(err => console.log(err));
}


const item_delete = (req, res) => { // ajax request, can't redirect on an ajax req, maybe idk

    const id = req.params.id;

    Item.findByIdAndDelete(id)
        .then(result => {

            gfs.find({ filename: result.filename }).toArray((err, files) => { // get the objectID of the image
                if (err) {
                    console.log(err);
                }
                gfs.delete(new mongoose.Types.ObjectId(files[0]._id), (errdelete, data) => {  // delete image using obtained objectID
                    if (err){
                        console.log(err);
                    }
                });
            });

            res.json({ redirect: '/items'});
        }) 
        .catch(err => console.log(err));
}

const item_youritems_get = (req, res) => {
    
    const id = res.locals.user._id;
    Item.find({ "seller": id })
        .then(result => { 
            res.render('items/youritems', { title: 'YourItems', items: result })
        })
        .catch(err => console.log(err));
}

const item_barter_get = async (req, res) => {
    const prodID = req.params.prodID;
    const sellerID = req.params.sellerID;
    const userID = res.locals.user._id;

    try {
        const product = await Item.findById(prodID);

        const seller = await User.findById(sellerID);

        const user = await User.findById(userID);

        const userItems = await Item.find( {"seller": userID });

        res.render('items/barter', { 
            title: 'Barter',
            product,
            seller,
            user,
            userItems
        });

    } catch (err){
        console.log(err);
    }
}

const item_barter_request_post = (req, res) => {

    const barter = new Barter(req.body);
    barter.save()
        .then(result => res.redirect('/items'))
        .catch(err => console.log(err));
    res.status(200).json({ status: 'success' });
}

const item_barter_request_get =  (req, res) => { // ajax
    res.render('items/request', { title: 'Request'});
}

const request_outgoing = async (req, res) => {
    const userID = res.locals.user._id;
    try {
        const outgoing = await Barter.find({'requestor': userID});
        outgoing.forEach(async (request, index) => {
            // get all requestee
            const seller = await User.findById(request.requestee);
            request.requestee =  JSON.stringify(seller);

            // get the requestee's product
            const product = await Item.findById(request.requesteeProduct);
            request.requesteeProduct = JSON.stringify(product);

            // get the requestor 
            const buyer = await User.findById(request.requestor);
            request.requestor = JSON.stringify(buyer);
            
            // get the requestor's product
            const requestorProduct = await Item.findById(request.requestorProduct);
            request.requestorProduct = JSON.stringify(requestorProduct);

            if(index == outgoing.length-1){
                setTimeout(() => {
                    res.json(outgoing);
                }, 1500);
            }
        });

    } catch (err){
        console.log(err);
    }
}

const request_incoming = async (req, res) => {
    const userID = res.locals.user._id;
    try {
        const incoming = await Barter.find({'requestee': userID});
        incoming.forEach(async (request, index) => {
            // get all requestee
            const seller = await User.findById(request.requestee);
            request.requestee =  JSON.stringify(seller);

            // get the requestee's product
            const product = await Item.findById(request.requesteeProduct);
            request.requesteeProduct = JSON.stringify(product);

            // get the requestor 
            const buyer = await User.findById(request.requestor);
            request.requestor = JSON.stringify(buyer);
            
            // get the requestor's product
            const requestorProduct = await Item.findById(request.requestorProduct);
            request.requestorProduct = JSON.stringify(requestorProduct);

            if(index == incoming.length-1){
                setTimeout(() => {
                    res.json(incoming);
                }, 1500);
            }
        });

    } catch (err){
        console.log(err);
    }
}

const request_all = async (req, res) => {
    const userID = res.locals.user._id;
    try {
        const barter = await Barter.find().or([{ requestor: userID }, { requestee: userID }]);
        barter.forEach(async (request, index) => {
            // get all requestee
            const seller = await User.findById(request.requestee);
            request.requestee =  JSON.stringify(seller);

            // get the requestee's product
            const product = await Item.findById(request.requesteeProduct);
            request.requesteeProduct = JSON.stringify(product);

            // get the requestor 
            const buyer = await User.findById(request.requestor);
            request.requestor = JSON.stringify(buyer);
            
            // get the requestor's product
            const requestorProduct = await Item.findById(request.requestorProduct);
            request.requestorProduct = JSON.stringify(requestorProduct);

            if(index === barter.length-1){
                setTimeout(() => {
                    console.log('barter :>> ', barter);
                    res.json(barter);
                }, 1500);
            }
        });
    } catch (err){
        console.log(err);
    }
}


const request_update_response = async (req, res) => {

    const id = mongoose.Types.ObjectId(req.params.requestID);

    let doc = await Barter.findOneAndUpdate({ _id: id }, req.body, {
        returnOriginal: false
    });

    // update items availability both requestor and requestee's product
    if(req.body.response == 'accepted'){
        let requestorProduct = await Item.findByIdAndUpdate(doc.requestorProduct, { availability: false });
        let requesteeProduct = await Item.findByIdAndUpdate(doc.requesteeProduct, { availability: false });
    }
    res.json({'response': doc.response});
}

module.exports = {
    item_index,
    item_details,
    item_create_get,
    item_create_post,
    item_delete,
    item_youritems_get,
    item_barter_get,
    item_barter_request_post,
    item_barter_request_get,
    request_outgoing,
    request_incoming,
    request_all,
    request_update_response,
    image_render
}