  Accounts.onCreateUser(function(options, user) { 
    user.role = "worker";
    if(user.services.hasOwnProperty("facebook")){
      user.imageUrl = "http://graph.facebook.com/"+user.services.facebook.id+"/picture/?type=large";
      user.username = user.services.facebook.name;
    } else {
      user.imageUrl = "/images/default-user.png";
    }
    return user;
  });


    Meteor.publish('userData', function() {
      if(!this.userId) return null;
      return Meteor.users.find(this.userId, {fields: {
        role: 1, imageUrl: 1,
      }});
    });


    Meteor.publish('workers', function() {
   
      return Meteor.users.find({role: "worker"});
    });




 

    

    Meteor.methods({

    'addQuantity': function(selectedOrder, product_id, price){
     

      Orders.update(selectedOrder, {
            $inc: { bill: parseFloat( price) }
          
          });

     
      Orders.update(
        { _id: selectedOrder , "items.product_id": product_id },
        { 
          $inc: { "items.$.quantity" : 1 }
        }
      )

      Orders.update(
        { _id: selectedOrder , "items.product_id": product_id },
        { 
          $inc: { "items.$.sub_total" : parseFloat(price) }
        }
      )        
    },

    'remQuantity': function(selectedOrder, product_id,price){
     

      Orders.update(selectedOrder, {
            $inc: { bill: -parseFloat( price) }
          
          });

     
      Orders.update(
        { _id: selectedOrder , "items.product_id": product_id },
        { $inc: { "items.$.quantity" : -1 } }
      )  
      
      Orders.update(
        { _id: selectedOrder , "items.product_id": product_id },
        { $inc: { "items.$.sub_total" : -parseFloat(price) }
         }
      )
    },

    'remItem': function(selectedOrder, product_id,price){

      Orders.update(selectedOrder,{ $pull: { items: { product_id: product_id } } },{ multi: false });
      Orders.update(selectedOrder,{$inc: { bill: -(price) }},{ multi: false });    
    },

    'payBill': function(selectedOrder){
      Orders.update(selectedOrder,{ $set: {payed:true}});

      var items = Orders.findOne( selectedOrder).items;

      for (var i = items.length - 1; i >= 0; i--) {
        var item = {
          product_id:  items[i].product_id,
          name: items[i].name,
          menu_name: items[i].menu_name,
          price:  items[i].sub_total, 
          quantity: items[i].quantity
          };

        Orders.update(selectedOrder,{ 
          $pull: { items: { product_id: items[i].product_id } } 
            },{ multi: false });

        Orders.update(selectedOrder, {
            $push: { payedItems: item },
          }); 
      };

            
    },

    'payItem': function(selectedOrder, item){
     
      Orders.update(selectedOrder, {
            $push: { payedItems: item },
            //$inc: { bill: parseFloat(item.price) }
          });        
    },

    'modifyPrice': function(selectedOrder, product_id, mod){
      Orders.update(
       { _id: selectedOrder , "items.product_id": product_id },
       { $inc: { "items.$.sub_total" : mod }
        }
       );

      Orders.update(selectedOrder,{$inc: { bill: mod }},{ multi: false });
                 
    },

    'remOrder': function(selectedOrder){
      /*
       Orders.remove(
        { _id: selectedOrder },
        { }
  
      );*/
                 
    },
    'addWorker': function(day, worker_id, role){
      var worker = Meteor.users.findOne(worker_id);
      var worker_data = {
        _id: worker_id,
        username: worker.username,
        imageUrl: worker.imageUrl
      }
      var element = {};
      element[role]=worker_data;
      Schedules.update(day, {$push: element});
    
      
    }


    

});



  // uncomment to have rest services



    // server code goes here
    // Global API configuration
  var Api = new Restivus({
    useDefaultAuth: true,
    prettyJson: true
  });

  // Generates: GET, POST on /api/coll and GET, PUT, DELETE on
  // /api/coll/:id for Items collection
  Api.addCollection(Products);
  Api.addCollection(Orders);






Date.prototype.addDays = function(days) {
    var dat = new Date(this.valueOf())
    dat.setDate(dat.getDate() + days);
    return dat;
}

Date.prototype.getWeekDay = function() {
  var day ="";
  if(this.getDay() == 0) {day = "Dom";}
  else if (this.getDay() == 1) {day = "Lun";}
  else if (this.getDay() == 2) {day = "Mar";}
  else if (this.getDay() == 3) {day = "Mer";}
  else if (this.getDay() == 4) {day = "Gio";}
  else if (this.getDay() == 5) {day = "Ven";}
  else if (this.getDay() == 6) {day = "Sab";}
    return day;
}

Date.prototype.getMonthName = function () {
  var month = new Array();
  month[0] = "January";
  month[1] = "February";
  month[2] = "March";
  month[3] = "April";
  month[4] = "May";
  month[5] = "June";
  month[6] = "July";
  month[7] = "August";
  month[8] = "September";
  month[9] = "October";
  month[10] = "November";
  month[11] = "December";
  return month[this.getMonth()];

}



function getCurrentWeek(d) {
  d = new Date(d);
  var day = d.getDay(),
      diff = d.getDate() - day + (day == 0 ? -6:1); // adjust when day is sunday
      var monday = new Date(d.setDate(diff));
      var dateArray = new Array();
      for (var i = 0; i <7 ; i++) {
        dateArray.push( new Date (monday.addDays(i).setHours(0,0,0,0)) );

        
      };
  return dateArray;
}