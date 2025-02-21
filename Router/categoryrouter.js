const express = require("express");
const { addCategory } = require("../controllers/categorycontroller")
const { viewcategory } = require("../controllers/categorycontroller")
const { deletecategory } = require("../controllers/categorycontroller")
const { updateCategory } = require("../controllers/categorycontroller")
const { viwaAllData,categoryProducts } = require("../controllers/categorycontroller")
const categoryRouter = express.Router();
const upload = require('../middleware/upload')
const authorization = require('../middleware/auth')


categoryRouter.post('/add-category', authorization, upload.single('image'),addCategory); //for add category
categoryRouter.get('/category/:name', viewcategory); // for big-view
categoryRouter.get('/category', viwaAllData);  // show all category
categoryRouter.delete('/category/:id', authorization, deletecategory); // delete category
categoryRouter.put('/category-update/:id',authorization,upload.single('image'),updateCategory);  //update category
categoryRouter.get('/category-products/:id', categoryProducts);


module.exports = categoryRouter;