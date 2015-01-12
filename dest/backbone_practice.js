/*! some copyright information here */// js/app.js
window.App = {};

$(function() {
  // ダミーのNoteコレクションを生成する
  var noteCollection = new App.NoteCollection([{
    title:'テスト１',
    body:'テスト１です'
  },{
    title:'テスト２',
    body:'テスト２です'
  }]);

  // メモ一覧のビューを表示する領域として
  // App.Containerを初期化する
  var mainContainer = new App.Container({
    el:'#main-container'
  });

  // コレクションを渡して
  // メモ一覧の親ビューを初期化する
  var noteListView = new App.NoteListView({
    collection: noteCollection
  });

  // 表示領域のメモ一覧を表示する
  // App.Containerのshow()は受け取ったビューの
  // render()を実行してDOM要素を自分のelに挿入する
  mainContainer.show(noteListView);
});

// js/container.js

App.Container = Backbone.View.extend({

  show: function(view) {
    // 現在表示しているビューを破棄する
    this.destroyView(this.currentView);
    // 新しいビューを表示する
    this.$el.append(view.render().$el);
    // 新しいビューを保持する
    this.currentView = view;
  },

  destroyView: function(view) {
    // 現在のビューを持っていなければ何もしない
    if(!view) {
      return;
    }
    // ビューに紐付けられている
    // イベントの監視をすべて解除する
    view.off();
    // ビューの削除
    view.remove();
  },

  empty: function() {
    this.destroyView(this.currentView);
    this.currentView = null;
  }
});

// js/models.js

App.Note = Backbone.Model.extend({
  defaults: {
    title:'',
    body:''
  }
});

App.NoteCollection = Backbone.Collection.extend({
  localStorage: new Backbone.LocalStorage('Notes'),
  model: App.Note
});

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

// js/note_list_item.js

App.NoteListItemView = Backbone.View.extend({

  tagName: 'tr',

  render: function() {
    var template = $('#noteListItemView-template').html();
    var compiled = _.template(template);
    var html = compiled(this.model.toJSON());
    this.$el.html(html);
    return this;
  }
});
