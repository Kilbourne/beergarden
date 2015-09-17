  Accounts.ui.config({
    passwordSignupFields: "USERNAME_ONLY"
  });

  Deps.autorun(function(){
    Meteor.subscribe('userData');
    Meteor.subscribe('workers');

  });
