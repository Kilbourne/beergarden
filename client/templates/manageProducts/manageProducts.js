Template.manageProducts.helpers({
    products: function () {
       //return Products.find();
      return Products.find({}, {sort: {type: 1, served: 1, name: 1, price: 1}});
    }
  });

  Template.manageProducts.events({
    "submit .new-prod": function (event) {
      // Prevent default browser form submit
      event.preventDefault();
 
      // Get value from form element
      var name = event.target.name.value;
      var price = parseFloat(event.target.price.value);
      var image = event.target.image.value;
      var volume = parseFloat(event.target.volume.value);
      var type = event.target.type.value;
      var description = event.target.description.value;
      var served = event.target.served.value;
      var menu_name = event.target.menu_name.value;
      var sellable = event.target.sellable.checked;
    
      // Insert a task into the collection
      Products.insert({
        name: name,
        price: price,
        image: image,
        volume: volume,
        type: type,
        served: served,
        menu_name: menu_name,
        description: description,
        finished: false,
        sellable: sellable
        
        //createdAt: new Date() // current time
      });
 
      // Clear form
      
      event.target.name.value= "";
      event.target.price.value= "";
      event.target.image.value= "";
      event.target.volume.value= "";
      event.target.type.value= "";
      event.target.description.value= "";
      event.target.served.value= "";
      event.target.menu_name.value= "";
      event.target.sellable.checked= false;
    }
  });
  
  Template.product.helpers({
    'isfinished': function(){
        var isFinished = this.finished;
        if(isFinished){
            return "checked";
        } else {
            return "";
        }
    },
    'issellable': function(){
        var issellable = this.sellable;
        if(issellable){
            return "checked";
        } else {
            return "";
        }
    }
  });



  Template.product.events({
    "click .toggle-finished": function () {
      // Set the checked property to the opposite of its current value
      Products.update(this._id, {
        $set: {finished: ! this.finished}
      });
    },
    "click .toggle-sellable": function () {
      // Set the checked property to the opposite of its current value
      Products.update(this._id, {
        $set: {sellable: ! this.sellable}
      });
    },
    "click .delete": function () {
      var confirm = window.confirm("Delete this product?");
      if(confirm){
      Products.remove(this._id);
      }
    },    
    'keyup .form-control': function(){
    var documentId = this._id;
    var name = $(event.target).attr('name');
    var prod_elem = $(event.target).val();
    var element={};
    element[name]=prod_elem;
    Products.update({ _id: documentId }, {$set: element});
    }
    
  });