const Product = require('../models/product')
const _ = require('lodash')
const formidable = require('formidable')
const fs = require('fs')
const {errorHandler} = require('../helpers/dbErrorHandlers')
const product = require('../models/product')
const { result } = require('lodash')



exports.productById = (req, res, next, id) => {
    Product.findById(id).exec((err, product) => {
        if(err || !product) {
            return res.status(400).json({
                error: "Product Not Found"
            });
        }
        req.product = product;
        next();
    });
};

exports.read = (req, res) => {
    // hna idha kan ta3l load ll photo direct tnajem trazen l app so lazem na3mlo seperate request bash na3mlo load
    req.product.photo = undefined
    return res.json(req.product);  
}

exports.create = (req, res) => {
    let form = new formidable.IncomingForm()
    form.keepExtensions = true
    form.parse(req, (err, fields, files) => {
        if(err) {
            return res.status(400).json({
                error: "Image Could Not Be Uploaded"
            })
        }
        const {name, description, price, category, quantity, shipping} = fields
        if(!name || !description || !price || !category || !quantity || !shipping) {
            return res.status(400).json({
                error: "All Fields Are Required"
            })
        }

        let product = new Product(fields)
        
        if(files.photo) {
            if(files.photo.size > 1000000){
                return res.status(400).json({
                    error: "Image Should be Less Than 1MB"
                })
            }
            product.photo.data = fs.readFileSync(files.photo.path)
            product.photo.contentType = files.photo.type
        }

        product.save((err, result) => {
            if(err){
            return res.status(400).json({
                error: errorHandler(err)
            });
        }
        res.json(result);
        })
    })
}

exports.remove = (req, res) => {
    let Product = req.product
    product.remove((err, deletedProduct) => {
        if(err) {
            return res.status(400).json({
                error: errorHandler(err)
            });
        }
        res.json({
            message: "Product Was Deleted Succussfully"
        })
    })
}


exports.update = (req, res) => {
    let form = new formidable.IncomingForm()
    form.keepExtensions = true
    form.parse(req, (err, fields, files) => {
        if(err) {
            return res.status(400).json({
                error: "Image Could Not Be Uploaded"
            })
        }
        const {name, description, price, category, quantity, shipping} = fields
        if(!name || !description || !price || !category || !quantity || !shipping) {
            return res.status(400).json({
                error: "All Fields Are Required"
            })
        }

        let product = req.product;
        product = _.extend(product, fields);
        
        if(files.photo) {
            if(files.photo.size > 1000000){
                return res.status(400).json({
                    error: "Image Should be Less Than 1MB"
                })
            }
            product.photo.data = fs.readFileSync(files.photo.path)
            product.photo.contentType = files.photo.type
        }

        product.save((err, result) => {
            if(err){
            return res.status(400).json({
                error: errorHandler(err)
            });
        }
        res.json(result);
        })
    })
};

 /**
  * We will Send Some queries to do somethings:
  *  We Will Send to the React App The Most Selled Products
  * most soled : /products?sortBy=sold&order=desc&limit=4 : this query feth the most 4th sold products and return them by desc order
  * arrival : /products?sortBy=createdAt&order=desc&limit=4
    if no params were sent, then all products are returned
  */


  exports.allProducts = (req, res) => {
    let order = req.query.order ? req.query.order: 'asc'
    let sortBy = req.query.sortBy ? req.query.sortBy: '_id'
    let limit = req.query.limit ? parseInt(req.query.limit): 4

    //we use select to deselect photo from getting the photo with response because it may be too heavy
    Product.find()
    .select("-photo")
    .populate("category")
    .sort([[sortBy, order]])
    .limit(limit)
    .exec((err, products) => {
        if(err) {
            return res.status(400).json({
                error: "Products Not Found"
            });
        };
        res.json(products);
    });
  };

