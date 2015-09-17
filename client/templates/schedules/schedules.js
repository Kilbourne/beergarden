 Template.schedules.helpers({
    'dates' : function(){
      var week = getCurrentWeek(new Date());
      var weekSchedule = [];
      

      for (var i = 0; i < week.length; i++) {
        //var date = ""+week[i].getWeekDay()+", "+week[i].getDay()+"/"+week[i].getMonth()+"/"+week[i].getFullYear();
        if(Schedules.find({date : week[i] }).fetch().length != 0){

          

              
          weekSchedule.push(Schedules.find({date : week[i] }).fetch()[0]);
        }
       
      }
      if (weekSchedule.length==0){weekSchedule = false;}
      console.log(weekSchedule);

      return weekSchedule;

    },
    'workers' : function(){ 
      return Meteor.users.find({role : "worker"});
      //Meteor.call('getWorkers');
    }
  });

  Template.schedules.events({
    'click .add' : function(){
       Session.set('selectedDay', this._id);  
    },
    'click .generate' : function(){
      var week = getCurrentWeek(new Date());
      var weekSchedule = [];
      for (var i = 0; i < week.length; i++) {
         if(Schedules.find({date : week[i] }).fetch().length == 0){
          
          var daySchedule = {
            //dateObj: date,
            date: week[i],
            cash: [],
            bar: [],
            waiters: [],
            door: [],
            kitchen: []
          }
          Schedules.insert(daySchedule);
     
        }
      }  
      Router.go('schedules'); 

    }


  });

  Template.insertUserModal.helpers({
    
    'workers' : function(){
    
      return Meteor.users.find();
    }


  });


  Template.insertUserModal.events({
    "submit #addWorker": function (event) {
     // Prevent default browser form submit
     event.preventDefault();
 
     // Get value from form element
     var role = event.target.role.value;
      var worker_id = event.target.username.value;
      var day = Session.get('selectedDay');
      
      var worker = Meteor.users.findOne(worker_id);
      var worker_data = {
        _id: worker_id,
        username: worker.username,
        imageUrl: worker.imageUrl,
        day_id: day
      }

      var element = {};
      element[role]=worker_data;
      Schedules.update(day, {$push: element});

   }
 });


  Template.displayDate.events({
    //removes a worker from a schedule
    "click .delete": function(event){
      var role = $(event.target).attr('name');
      var person = this._id;
      var day = this.day_id;
      var element = {};
      element[role]= { _id: person}
      Schedules.update(day,{ $pull:element });
      
      console.log(this._id+" " +this.day_id);

    }

  })

