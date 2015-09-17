Router.configure({ layoutTemplate: 'main'});

Router.route('/order/:_id', {
  template: 'listOrder',
    data: function(){
      var currentOrder = this.params._id;
      return Orders.findOne({ _id: currentOrder });
       
    }
});
Router.route('/manageProducts');
Router.route('/orders');
Router.route('/schedules');

Router.route('/', {
    name: 'home',
    template: 'home'
});