Template.addOrder.events({
      'submit form': function(event){
        event.preventDefault();
        var guestName = $('[name=guestName]').val();
        var tableNum = $('[name=tableNum]').val();
        
        Orders.insert({
            guestName: guestName,
            tableNum: tableNum,
            createdAt: new Date(),
            bill: 0.0,
            payed: false,
            items: [],
            payedItems: [] 
        });
        $('[name=guestName]').val('');
        $('[name=tableNum]').val('');
      }
  });

  Template.orders.helpers({
      'orders': function(){
        return Orders.find({payed : false}, {sort: {guestName: 1}});
      },
      'mod4': function (ind) {
      return ind % 4 === 0
      },
      'grouped_orders': function () {
        all = Orders.find({payed : false}, {sort: {bill: 1}}).fetch();
        chunks = [];
        size = 4;
        while (all.length > size) {
            chunks.push({ row: all.slice(0, size)});
            all = all.slice(size);
        }
        chunks.push({row: all});
        
        return chunks;
      }

  });

  Template.orders.events({
    "click .selectOrder": function () {
      Session.set('selectedOrder', this._id);
      console.log(this._id);

          
    },
    "click .pay": function (){
      var selectedOrder = this._id;
      

      var order = Orders.findOne(selectedOrder);
      //var order = Orders.find({_id:"TGmazfgvzHwvBtvBW"}).fetch()
      //alert(order.bill);
      var confirm = window.confirm("Sono "+order.bill+" euri, bello");
      
      if(confirm){
        Meteor.call('payBill',selectedOrder); 
        Router.go('orders');       
      }
    }

  });

  Template.menu.helpers({
     
      'menu_products': function(){
       // var list = Products.find({},{ type: 1, _id: 0 });
        var distinctEntries = _.uniq(Products.find(
                                      {}, 
                                      {sort: {type: 1}, fields: {type: true}}
                                      )
                                  .fetch()
                                  .map(function(x) 
                                    { return x.type;}), true);
        

        var result = [];
        for (var i = 0; i < distinctEntries.length; i++) {
          res={};
          res.name = distinctEntries[i];
          res.products = Products.find({ type: distinctEntries[i], finished: false, sellable: true}, {sort: {type: 1, served: 1, name: 1}});
          
          result[i] = res;
          //result[distinctEntries[i]].name=distinctEntries[i];
          //result[distinctEntries[i]].products = Products.find({ type: distinctEntries[i], finished: false, sellable: true}, {sort: {type: 1, served: 1, name: 1}});
        }
  

        

        return result;
        
      },
      'type_list' : function(){
        return Products.find({ finished: false, sellable: true}, {sort: {type: 1, served: 1, name: 1}});

      }

  });

  Template.menu.events({
    "click .add": function () {
      var selectedOrder = Session.get('selectedOrder');
      var product_id = this._id;

      if(selectedOrder != null){
        var cursor = Orders.find({  $and : [  {items: {$elemMatch: {product_id: this._id}}},  {_id: selectedOrder }  ]});
        //looks for orders with selectedOrder = id that has product_id in the items array
        //in other words if the order has already that product
        
        if(cursor.count()>0){
          Meteor.call('addQuantity',selectedOrder, product_id, this.price);
       }else{

          var item = {
          product_id:  this._id,
          name: this.name,
          volume: this.volume,
          price:  this.price,
          image:  this.image, 
          quantity: 1,
          menu_name: this.menu_name,
          sub_total: this.price
          };
        
          
          Orders.update(selectedOrder, {
            $push: { items: item },
            $inc: { bill: parseFloat(item.price) }
          
          });

        }
        
        //if (addOrder){alert(addOrder.count());}

        

      }
      else {
        var confirm = window.confirm("didn't choose an order");
      
      if(confirm){
        //Meteor.call('payBill',selectedOrder);
        Router.go('orders');
        
      }
        //alert("didn't choose an order");
        

      }
      
    }

  });

  Template.listItem.events({
    "click .delete": function (event, template){
      var selectedOrder = $(event.target).closest('div .panel-body').attr('id');  
      var prod_id= this.product_id;
      var quantity = parseInt(this.quantity);
      var confirm = window.confirm("Delete one "+this.name+" from this order ?");

      if(confirm){
        if (quantity > 1){
          Meteor.call('remQuantity',selectedOrder, prod_id, this.price);

        }else{

          Meteor.call('remItem',selectedOrder, prod_id, this.price);
        }
      }
    },
    "click .pay": function payBill(){
      
     
      var selectedOrder = Session.get('selectedOrder');

      var order = Orders.findOne(selectedOrder);
      //var order = Orders.find({_id:"TGmazfgvzHwvBtvBW"}).fetch()
      //alert(order.bill);
      var confirm = window.confirm("Sono "+order.bill+" euri, bello");
      
      if(confirm){
        Meteor.call('payBill',selectedOrder);
        Router.go('orders');
        
      }
    },
    "click .payItem": function  (event, template){
       var selectedOrder = $(event.target).closest('div .panel-body').attr('id');

     
      var num = Orders.findOne( selectedOrder).items.length;

      
      

      var item = {
          product_id:  this.product_id,
          name: this.name,
          menu_name: this.menu_name,
          price:  this.price,
          image:  this.image, 
          quantity: 1
          };
      //var quantity = parseInt(this.quantity);
      
      var confirm = window.confirm("Sono "+parseFloat(this.price)+" euri, bello");
      if(confirm){
        

        Meteor.call('payItem',selectedOrder, item);
        if (this.quantity > 1){
          Meteor.call('remQuantity',selectedOrder, this.product_id, this.price);

        }else{
          Meteor.call('remItem',selectedOrder, this.product_id, this.price);
          
        }

         
      if (num == 1){
            
            Orders.update(selectedOrder,{ $set: {payed:true}});
            Router.go('orders');
          }


      }
    },
    "click .lowerPrice": function (){
      Meteor.call('modifyPrice',
                  Session.get('selectedOrder'),
                  this.product_id,
                  -1);
      
    },
    "click .raisePrice": function (){
      Meteor.call('modifyPrice',
                  Session.get('selectedOrder'),
                  this.product_id,
                  1);

    },

  });

  Template.orderItem.events({
    'click .editOrder' : function(event){

      var order = $(event.target).attr('name');
    
      
      var selector = "#"+order+" .edit";
        console.log(selector);
      $(selector).fadeToggle();
    },

     "click .deleteOrder": function (){
      var confirm = window.confirm("Delete the order: "+this.guestName +" Tab: "+this.tableNum+" ?");
      if(confirm){
        var selectedOrder = this._id;
      
          
        Meteor.call('remOrder',selectedOrder);
      }
    }
    /*'focusout .focus' : function(){
       console.log("lost");
    $(".edit").hide();
    }*/
  })