//js/note_control.js

App.NoteControlView = Backbone.View.extend({

  // フォームのsubmitイベントの監視を追加する
  events: {
    'submit .js-search-form':'onSubmit'
  },

  render: function() {
    var html = $('#noteControlView-template').html();
    this.$el.html(html);
    return this;    
  },

  // submitイベントのハンドラを追加する
  onSubmit: function(e) {
    e.preventDefault();
    var query = this.$('.js-search-query').val();
    this.trigger('submit:form',query);    
  }
});
