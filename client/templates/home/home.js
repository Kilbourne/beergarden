  Template.home.helpers({
    imageUrl: function() {
     
      return Meteor.user().imageUrl;
    }
  });