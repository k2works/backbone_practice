/*! some copyright information here */// js/app.js
window.App = {};

var initializeNotes = function() {
  var noteCollection = new App.NoteCollection([{
    title:'テスト１',
    body:'テスト１です。'
  },{
    title:'テスト２',
    body:'テスト２です。'
  },{
    title:'テスト３',
    body:'テスト３です'
  }]);

  // 作成したモデルはローカルストレージに保存する
  noteCollection.each(function(note) {
    note.save();
  });

  // この処理で作ったコレクションは一時的な用途であり
  // 必要なのは中身のモデルなのでモデルの配列を返す
  return noteCollection.models;
};

$(function() {
  // NoteCollectionコレクションを初期化する
  // 後で別のjsファイルからも参照するので
  // App名前空間配下に参照を持たせておく
  App.noteCollection = new App.NoteCollection();

  // メモの一覧のビューを表示する領域として
  // App.Containerを初期化する
  // こちらも同様の理由でApp配下に参照を持たせる
  App.mainContainer = new App.Container({
    el:'#main-container'
  });

  // 初期化処理を追加する
  App.headerContainer = new App.Container({
    el:'#header-container'
  });

  // NoteCollectionコレクションのデータを受信する
  // (Backbone.LocalStorageを使用しているので
  // ブラウザのローカルストレージから読み込む
  App.noteCollection.fetch().then(function(notes){

    // もし読み込んだデータが空であれば
    // ダミーデータでコレクションの中身を上書きする
    if(notes.length === 0) {
      var models = initializeNotes();
      App.noteCollection.reset(models);
    }

    // ルータの初期化と履歴管理の開始
    App.router = new App.Router();
    Backbone.history.start();
  });

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
  },

  has: function(obj) {
    return this.currentView instanceof obj;
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

//js/note_detail.js

App.NoteDetailView = Backbone.View.extend({

  render: function() {
    var template = $('#noteDetailView-template').html();
    var compiled = _.template(template);
    var html = compiled(this.model.toJSON());
    this.$el.html(html);
    return this;
  }
});

//js/note_form.js

App.NoteFormView = Backbone.View.extend({

  render: function() {
    var template = $('#noteForm-template').html();
    var compiled = _.template(template);
    var html = compiled(this.model.toJSON());
    this.$el.html(html);
    return this;
  },

  events: {
    'submit form':'onSubmit'
  },

  onSubmit: function(e) {
    e.preventDefault();
    var attrs = {};
    attrs.title = this.$('.js-noteTitle').val();
    attrs.body = this.$('.js-noteBody').val();
    this.trigger('submit:form',attrs);
  }
});

// js/note_list.js

App.NoteListView = Backbone.View.extend({

  tagName:'table',

  // Bootstrapの装飾を与えるために'table'クラス属性値を指定する
  className: 'table',

  initialize: function(options) {
    // Backbone.Collectionインスタンスを受け取る
    this.collection = options.collection;
    // コレクションのresetイベントに応じてrender()を呼び出す
    this.listenTo(this.collection, 'reset',this.render);
  },

  render: function() {
    // this.$el.html()が呼び出される前に古いビューを破棄しておく
    this.removeItemViews();
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

    // 後で適切に破棄できるように子ビューの参照を保持しておく
    this.itemViews = this.collection.map(function(note) {
      var itemView = new App.NoteListItemView({
        model: note
      });
      $insertionPoint.append(itemView.render().$el);
      return itemView;
    },this);
  },

  // すべての子ビューを破棄するメソッドを追加する
  removeItemViews: function() {
    // 保持しているすべてのビューのremove()を呼び出す
    _.invoke(this.itemView, 'remove');
  }

});

// js/note_list_item.js

App.NoteListItemView = Backbone.View.extend({

  tagName: 'tr',

  initialize: function() {
    // モデルのdestroyイベントを監視して
    // BackBone.Viewのremove()メソッドを呼び出す
    this.listenTo(this.model,'destroy',this.remove);
  },

  // [Delete]ボタンを監視して
  // onClickDelete()メソッドを呼び出す
  events: {
    'click .js-delete':'onClickDelete'
  },

  render: function() {
    var template = $('#noteListItemView-template').html();
    var compiled = _.template(template);
    var html = compiled(this.model.toJSON());
    this.$el.html(html);
    return this;
  },

  onClickDelete: function() {
    // モデルを削除する
    this.model.destroy();
  }
});

//js/router.js

App.Router = Backbone.Router.extend({
  routes: {
    'notes/:id':'showNoteDetail',
    'new':'showNewNote',
    'notes/:id/edit':'showEditNote',
    'notes/search/:query':'searchNote',
    '*actions':'defaultRoute'
  },

  // ルーティングが受け取った:idパラメータは
  // そのまま引数名idで受け取れる
  showNoteDetail: function(id) {
    var note = App.noteCollection.get(id);
    var noteDetailView = new App.NoteDetailView({
      model: note
    });
    
    App.mainContainer.show(noteDetailView);
    // メモの詳細画面ではボタンを消したいので
    // App.Containerのempty()メソッドを呼び出して
    // ビューを破棄しておく
    App.headerContainer.empty();
  },
  defaultRoute: function() {
    this.showNoteList();
    this.navigate('notes');
  },
  showNoteList: function(models) {

    // 一覧表示用のコレクションを別途初期化する
    if(!this.filteredCollection) {
      this.filteredCollection = new App.NoteCollection();
    }

    // NoteListViewのインスタンスが表示中でないときのみ
    // これを初期化して表示する
    if(!App.mainContainer.has(App.NoteListView)) {
      // 初期化の際に一覧表示用のコレクションを渡しておく
      var noteListView = new App.NoteListView({
        collection: this.filteredCollection
      });
      App.mainContainer.show(noteListView);
    }

    // 検索されたモデルの配列が引数に渡されていればそちらを、
    // そうでなければすべてのモデルを持つApp.noteCollection
    // インスタンスのモデルの配列を使用する
    models = models || App.noteCollection.models;

    // 一覧表示用のコレクションのreset()メソッドに
    // 採用した方のモデルの配列を渡す
    this.filteredCollection.reset(models);
    this.showNoteControl();
  },

  // メモ一覧操作ビューを表示するメソッドを追加する
  showNoteControl: function() {
    var noteControlView = new App.NoteControlView();

    // submit:formイベントの監視を追加する
    noteControlView.on('submit:form', function(query) {
      this.searchNote(query);
      this.navigate('notes/search/' + query);
    },this);
    
    App.headerContainer.show(noteControlView);
  },

  showNewNote: function() {
    var self = this;
    // テンプレートの<%= title %>などの出力を空文字列で
    // 空欄にしておくため、新規に生成したNoteモデルを渡して
    // NoteFormViewを初期化する
    var noteFormView = new App.NoteFormView({
      model: new App.Note()
    });

    noteFormView.on('submit:form',function(attrs) {
      // submit:formイベントで受け取ったフォームの
      // 入力値をNoteCollectionコレクションのcreate()に
      // 渡してNoteモデルの新規作成と保存を行う
      App.noteCollection.create(attrs);

      // モデル一覧を表示してルートを#notesに戻す
      self.showNoteList();
      self.navigate('notes');
    });

    App.mainContainer.show(noteFormView);
    // [New Note]ボタンはこの画面では必要ないので
    // ビューを破棄しておく
    App.headerContainer.empty();
  },

  showEditNote: function(id) {
    var self = this;
    // 既存のNoteモデルを取得してNoteFormViewに渡す
    var note = App.noteCollection.get(id);
    var noteFormView = new App.NoteFormView({
      model: note
    });

    noteFormView.on('submit:form',function(attrs) {
      // submit:formイベントで受け取ったフォームの入力値をNoteモデルに保存する
      note.save(attrs);

      // モデル詳細画面を表示してルートも適切なものに書き換える
      self.showNoteDetail(note.get('id'));
      self.navigate('notes/' + note.get('id'));
    });

    App.mainContainer.show(noteFormView);
  },

  searchNote: function(query) {
    var filtered = App.noteCollection.filter(function(note) {
      return note.get('title').indexOf(query) !== -1;
    });
    this.showNoteList(filtered);
  }
});
