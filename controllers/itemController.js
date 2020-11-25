const Item = require('../models/item');
const User = require('../models/User'); 
const Barter = require('../models/Barter'); 
const mongoose = require('mongoose');
// item_index, item_details, item_create_get, item_create_post, item_delete

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

const item_youritems_get = (req, res) => {
    
    const id = res.locals.user._id;
    Item.find({ "seller": id })
        .then(result => { 
            res.render('items/youritems', { title: 'YourItems', items: result })
        })
        .catch(err => console.log(err));
}

const item_barter_get = (req, res) => {
    const prodID = req.params.prodID;
    const sellerID = req.params.sellerID;
    const userID = res.locals.user._id;

    // get product
    Item.findById(prodID)
        .then(product => {
            console.log(product);
            // get seller
            User.findById(sellerID)
                .then(seller => {
                    console.log(seller)
                    // get user
                    User.findById(userID)
                        .then(user => {
                            console.log(user);
                            // get all user items   
                            Item.find( {"seller": userID })
                                .then(userItems => {

                                    // pass all data
                                    res.render('items/barter', { 
                                        title: 'Barter',
                                        seller,
                                        user,
                                        product,
                                        userItems
                                    });
                                    console.log('user Items: ', userItems);
                                })
                                .catch(userItemsErr => userItemsErr);
                        })  
                        .catch(userErr => console.log(userErr));
                })
                .catch(sellErr => console.log(sellErr));
        })
        .catch(prodErr => console.log(prodErr));
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

const request_outgoing = (req, res) => {
    const userID = res.locals.user._id;
    let final = [];
    Barter.find({'requestor': userID})
        .then(outgoing => {
            outgoing.forEach((request, index) => {
                // get the requestee
                User.findById(request.requestee)
                    .then(seller => {
                        request.requestee = JSON.stringify(seller);
                        // get the requestee product
                        Item.findById(request.requesteeProduct)
                            .then(product => {
                                request.requesteeProduct = JSON.stringify(product);
                                // get the requestor 
                                User.findById(request.requestor)
                                    .then(buyer => {
                                        request.requestor = JSON.stringify(buyer);
                                        // get the requestor product
                                        Item.findById(request.requestorProduct)
                                            .then(requestorProduct => {
                                                request.requestorProduct = JSON.stringify(requestorProduct);
                                                // console.log('Outgoing: ', outgoing);
                                                final.push(request);
                                                // console.log('final and ', index, ' ', final);
                                                
                                                if(final.length == outgoing.length){
                                                    console.log(final);
                                                    res.json(final);
                                                }

                                            }).catch(requestorProductErr=>console.log(requestorProductErr));
                                    }).catch(buyErr=>console.log(buyErr));
                            }).catch(prodErr=>console.log(prodErr));
                            // get the requestee product
                        }).catch(sellerErr => console.log(sellerErr));
            }); // end of forEach  
        }).catch(outgoingErr => console.log(outgoingErr));
}

const request_incoming = (req, res) => {
    const userID = res.locals.user._id;
    let final = [];
    Barter.find({'requestee': userID})
        .then(outgoing => {
            outgoing.forEach((request, index) => {
                // get the requestee
                User.findById(request.requestee)
                    .then(seller => {
                        request.requestee = JSON.stringify(seller);
                        // get the requestee product
                        Item.findById(request.requesteeProduct)
                            .then(product => {
                                request.requesteeProduct = JSON.stringify(product);
                                // get the requestor 
                                User.findById(request.requestor)
                                    .then(buyer => {
                                        request.requestor = JSON.stringify(buyer);
                                        // get the requestor product
                                        Item.findById(request.requestorProduct)
                                            .then(requestorProduct => {
                                                request.requestorProduct = JSON.stringify(requestorProduct);
                                                // console.log('Outgoing: ', outgoing);
                                                final.push(request);
                                                // console.log('final and ', index, ' ', final);
                                                
                                                if(final.length == outgoing.length){
                                                    console.log(final);
                                                    res.json(final);
                                                }

                                            }).catch(requestorProductErr=>console.log(requestorProductErr));
                                    }).catch(buyErr=>console.log(buyErr));
                            }).catch(prodErr=>console.log(prodErr));
                            // get the requestee product
                        }).catch(sellerErr => console.log(sellerErr));
            }); // end of forEach  
        }).catch(outgoingErr => console.log(outgoingErr));
}

const request_all = (req, res) => {
    const userID = res.locals.user._id;
    let final = [];
    Barter.find().or([{ requestor: userID }, { requestee: userID }])
        .then(barter =>{
            barter.forEach((request, index) => {
                // get the requestee
                User.findById(request.requestee)
                    .then(seller => {
                        request.requestee = JSON.stringify(seller);
                        // get the requestee product
                        Item.findById(request.requesteeProduct)
                            .then(product => {
                                request.requesteeProduct = JSON.stringify(product);
                                // get the requestor 
                                User.findById(request.requestor)
                                    .then(buyer => {
                                        request.requestor = JSON.stringify(buyer);
                                        // get the requestor product
                                        Item.findById(request.requestorProduct)
                                            .then(requestorProduct => {
                                                request.requestorProduct = JSON.stringify(requestorProduct);
                                                // console.log('barter: ', barter);
                                                final.push(request);
                                                // console.log('final and ', index, ' ', final);
                                                
                                                if(final.length == barter.length){
                                                    res.json(final);
                                                }

                                            }).catch(requestorProductErr=>console.log(requestorProductErr));
                                    }).catch(buyErr=>console.log(buyErr));
                            }).catch(prodErr=>console.log(prodErr));
                            // get the requestee product
                        }).catch(sellerErr => console.log(sellerErr));
            }); // end of forEach  
        }).catch(err => console.log(err));
}


const request_update_response = async (req, res) => {

    const id = mongoose.Types.ObjectId(req.params.requestID);

    let doc = await Barter.findOneAndUpdate({ _id: id}, req.body, {
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
    request_update_response
}