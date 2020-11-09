var express = require('express');
var router = express.Router();
var productHelper = require('../helpers/product-helpers')

/* GET users listing. */
router.get('/', function(req, res, next) {
  productHelper.getAllProducts().then((products)=>{
    console.log(products);
    res.render('admin/view-products', { title: 'Company', products, admin: true});
  })
 
});
router.get('/add-product', function(req,res){
  res.render('admin/add-product', { title: 'Company', admin: true});
})
router.post('/add-product', function(req,res){
  console.log(req.body);
  console.log(req.files.Image);
  
  productHelper.addProduct(req.body,(id)=>{
    let image = req.files.Image
    console.log(id);
    image.mv("./public/product-images/"+id+".jpg",(err,done)=>{
      if (!err) {
        res.render("admin/add-product")
      }
      else{
        console.log(err);
      }
    })
  })
})
module.exports = router;