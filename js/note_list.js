// js/note_list.js

App.NoteListView = Backbone.View.extend({

  tagName:'table',

  // Bootstrapの装飾を与えるために'table'クラス属性値を指定する
  className: 'table',

  initialize: function(options) {
    // Backbone.Collectionインスタンスを受け取る
    this.collection = options.collection;
  },

  render: function() {
    // テンプレートから自身のDOM構築を行う
    var template = $('#noteListView-template').html();
    this.$el.html(template);

    // 保持しているコレクションから子ビューを生成してレンダリングする
    this.renderItemViews();
    return this;
  },

  renderItemViews: function() {
    // 子ビューをappend()で挿入する地点を特定する
    var $insertionPoint = this.$('.js-noteListItemView-container');

    // コレクション内のすべてのモデルを取り出して
    // 個々のビューを生成し、親ビューのDOMツリーに挿入する
    this.collection.each(function(note) {
      var itemView = new App.NoteListItemView({
        model:note
      });
      $insertionPoint.append(itemView.render().$el);
    },this);
  }
});
