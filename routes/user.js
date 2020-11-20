const { response } = require('express');
var express = require('express');
var router = express.Router();
var productHelper = require('../helpers/product-helpers');
const userHelpers = require('../helpers/user-helpers');

const verifyLogin = (req,res,next)=>{
  if(req.session.user){
    next()
  }else{
    res.redirect('/login')
  }
}


/* GET home page. */
router.get('/', async function(req, res, next) {
  let user = req.session.user
  console.log(user);
  let cartCount = null
  if (req.session.user) {
    cartCount = await userHelpers.getCartCount(req.session.user._id)
  }
  productHelper.getAllProducts().then((products)=>{
    console.log(products);
    res.render('user/view-products', { title: 'Company', products, user, cartCount, admin: false});
  })
});
router.get('/login',(req,res)=>{
  if(req.session.user){
    res.redirect('/')
  }else{
    res.render('user/login', { "loginErr":req.session.userLoginErr , title: 'Company', admin: false})
    req.session.userLoginErr = false
  }
})
router.get('/signup',(req,res)=>{
  if(req.session.userLoggedIn){
    res.redirect('/')
  }else{
    res.render('user/signup', { title: 'Company', admin: false})
  }
})
router.post('/signup',(req,res)=>{
  
    userHelpers.doSignup(req.body).then((response)=>{
      console.log(response);
      
      req.session.user = response
      req.session.user.loggedIn = true
      res.redirect('/')
    })

  
})
router.post('/login',(req,res)=>{
   userHelpers.doLogin(req.body).then((response)=>{
     if (response.status) {

       req.session.user = response.user
       req.session.user.loggedIn = true
       res.redirect('/')
     }else{
       req.session.userLoginErr = "Invalid Username or Password"
       res.redirect('/login')
     }
   })
})
router.get('/logout',(req,res)=>{
  req.session.user = null
  req.session.userLoggedIn = false
  res.redirect('/')
})
router.get('/cart', verifyLogin,async(req,res)=>{
  let products = await userHelpers.getCartProducts(req.session.user._id)
  let total = 0
  if(products.length > 0){
    total = await userHelpers.getTotalAmount(req.session.user._id)
  }
  console.log(products);
  res.render('user/cart', { title: 'Company', user:req.session.user, products,total})
})

router.get('/add-to-cart/:id',verifyLogin,(req,res)=>{
  console.log("api call");
  userHelpers.addToCart(req.params.id, req.session.user._id).then(()=>{
    res.json({status:true})
  })
})

router.post('/change-product-quantity',(req,res,next)=>{
  console.log(req.body);
  userHelpers.changeProductQuantity(req.body).then(async(response)=>{
    response.total = await userHelpers.getTotalAmount(req.body.user)
    res.json(response)
  })
})

router.get('/place-order', verifyLogin, async(req,res)=>{
  let total = await userHelpers.getTotalAmount(req.session.user._id)
  res.render('user/place-order',{title: 'Company',user:req.session.user, total})
})

router.post('/place-order', async(req,res)=>{
  let products = await userHelpers.getCartProductList(req.body.userId)
  let totalPrice = await userHelpers.getTotalAmount(req.body.userId)
  userHelpers.placeOrder(req.body,products,totalPrice).then((response)=>{
    res.json({status:true})
  })
  console.log(req.body);
})

router.get('/order-success', verifyLogin, (req,res)=>{
  res.render('user/order-success', {user:req.session.user})
})

router.get('/orders', verifyLogin, async(req,res)=>{
  let orders = await userHelpers.getUserOrders(req.session.user._id)
  res.render('user/orders',{user:req.session.user, orders})
})

router.get('/view-order-products/:id', verifyLogin, async(req,res)=>{
  let products = await userHelpers.getOrderProducts(req.params.id)
  res.render('user/view-order-products',{user:req.session.user, products})
})

module.exports = router;
