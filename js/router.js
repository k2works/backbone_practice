//js/router.js

App.Router = Backbone.Router.extend({
  routes: {
    'notes/:id':'showNoteDetail',
    'new':'showNewNote',
    'notes/:id/edit':'showEditNote',
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
  showNoteList: function() {
    // コレクションを渡して
    // メモ一覧の親ビューを初期化する
    var noteListView = new App.NoteListView({
      collection: App.noteCollection
    });

    // 表示領域にメモ一覧を表示する
    App.mainContainer.show(noteListView);
    // メモ一覧操作ビューを表示するメソッドの
    // 呼び出しを追加する
    this.showNoteControl();
  },

  // メモ一覧操作ビューを表示するメソッドを追加する
  showNoteControl: function() {
    var noteControlView = new App.NoteControlView();
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
  }
});
