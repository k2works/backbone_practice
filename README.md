Backbone.jsで学ぶMVCフレームワーク入門(実践編)
===
# 目的
# 前提
| ソフトウェア     | バージョン    | 備考         |
|:---------------|:-------------|:------------|
| OS X           |10.8.5        |             |
| Backbone.js  　|1.1.2         |             |
| Underscore.js  |1.7.0         |             |
| jQuery         |1.11.2         |             |
| Backbone localStorage    　　　| 1.1.15       |             |
| bootstrap  　  |3.3.1          |             |

# 構成
+ [セットアップ](#1)
+ [メモ帳アプリケーションの作成１](#2)
+ [メモ帳アプリケーションの作成２](#3)
+ [メモ帳アプリケーションの作成３](#4)

# 詳細
## <a name="1">セットアップ</a>
```bash
$ npm install
$ grunt
```
## <a name="2">メモ帳アプリケーションの作成１</a>
### HTMLの準備
```html
<!DOCTYPE html>

<html lang="ja">
  <head>
    <meta charset="UTF-8"/>
    <title>Note Application Example</title>
    <link rel="stylesheet" href="./css/bootstrap.css">
      <script src="./js/lib/jquery-1.11.2.js"></script>
      <script src="./js/lib/underscore.js"></script>
      <script src="./js/lib/backbone.js"></script>
      <script src="./js/lib/backbone.localStorage.js"></script>
    </head>
    <body>
      <div id="header">
        <div class="navbar navbar-default navbar-static-top">
          <div class="navbar-inner">
            <div class="container">
              <span class="navbar-brand">
                <a href="./index.html">
                  Note Application Example
                </a>
              </span>
            </div>
          </div>
        </div>
      </div>
      <div id="main" class="container">
        <div id="header-container"></div>
        <div id="main-container"></div>
      </div>
    </body>
 </html>
 ```
 ### 名前空間の準備
 ```javascript
// js/app.js
window.App = {};
```

### Noteモデル
 ```javascript
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
```
### ビューを管理するオブジェクトの準備
```javascript
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

```
### メモの一覧の表示
#### テンプレート
```html
 <!DOCTYPE html>

<html lang="ja">
  <head>
    <meta charset="UTF-8"/>
    <title>Note Application Example</title>
    <link rel="stylesheet" href="./css/bootstrap.css">
      <script src="./js/lib/jquery-1.11.2.js"></script>
      <script src="./js/lib/underscore.js"></script>
      <script src="./js/lib/backbone.js"></script>
      <script src="./js/lib/backbone.localStorage.js"></script>
      <script src="./js/app.js"></script>
      <script src="./js/models.js"></script>
      <script src="./js/container.js"></script>
      <script src="./js/note_list_item.js"></script>
      <script src="./js/note_list.js"></script>
    </head>    
    <body>
      <div id="header">
        <div class="navbar navbar-default navbar-static-top">
          <div class="navbar-inner">
            <div class="container">
              <span class="navbar-brand">
                <a href="./index.html">
                  Note Application Example
                </a>
              </span>
            </div>
          </div>
        </div>
      </div>
      <div id="main" class="container">
        <div id="header-container"></div>
        <div id="main-container"></div>
      </div>
      <script type="text/template" id="noteListView-template">
        <!--
            メモ一覧を表示する<table>要素のためのテンプレート
            <table>要素自体はBackbone.Viewが生成する
        -->
        <thead>
          <th class="col-md-2" colspan="2">Title</th>
        </thead>
        <!-- この<tbody>要素配下に個々のメモ情報を挿入する -->
        <tbody class="js-noteListItemView-container"></tbody>
      </script>

      <script type="text/template" id="noteListItemView-template">
        <!--
            個々のメモ情報を表示する<tr>要素のためのテンプレート
            <tr>要素自体はBackbone.Viewを生成する
        -->
        <td>
          <a href="#">
            <%= title %>
          </a>
        </td>
        <td>
          <div class="text-right">
            <a href="#" class="btn btn-default btn-sm js-edit">
              <span class="glyphicon glyphicon-edit"></span>
              Edit
            </a>
            <a href="#" class="btn btn-danger btn-sm js-delete">
              <span class="glyphicon glyphicon-remove"></span>
              Delete
            </a>
          </div>
        </td>
      </script>
    </body>
</html>
``` 
#### メモ一覧の項目のビュー
```javascript
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

```
```javascript
 // js/app.js
window.App = {};

$(function() {
  var note = new App.Note({
    title:'テスト',
    body:'テストです'
  });

  var noteView = new App.NoteListItemView({
    model:note
  });

  noteView.render().$el.appendTo($(document.body));
});
``` 
#### メモ一覧のビュー
```javascript
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
``` 
```javascript
// js/app.js
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
``` 
## <a name="3">メモ帳アプリケーションの作成２</a>
### メモの削除
```javascript
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
```
### データの永続化
```javascript
// js/app.js
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
```
### メモの詳細画面を表示するルーティング
```html
      <script type="text/template" id="noteDetailView-template">
        <h2><%= title %></h2>
        <p><%= body %></p>
      </script>
 ```

```javascript
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
```

#### ルーティングの実装
```html
      <script type="text/template" id="noteListItemView-template">
        <!--
            個々のメモ情報を表示する<tr>要素のためのテンプレート
            <tr>要素自体はBackbone.Viewを生成する
        -->
        <td>
          <a href="#notes/<%= id %>">
            <%= title %>
          </a>
        </td>
```

```javascript
App.Router = Backbone.Router.extend({
  routes: {
    'notes/:id':'showNoteDetail'
  },

  // ルーティングが受け取った:idパラメータは
  // そのまま引数名idで受け取れる
  showNoteDetail: function(id) {
    var note = App.noteCollection.get(id);
    var noteDetailView = new App.NoteDetailView({
      model: note
    });
    
    App.mainContainer.show(noteDetailView);
    }
 });
```

```javascript
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
```

### メモ一覧画面を表示するルーティング
```javascript
  routes: {
    'notes/:id':'showNoteDetail',
    '*actions':'defaultRoute'
  },
```
```javascript
  defaultRoute: function() {
    this.showNoteList();
    this.navigate('notes');
  },
```

```html
                <a href="./index.html#notes">
                  Note Application Example
                </a>
```

```javascript
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
```

```javascript
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
```

### メモの新規作成機能の追加
#### 新規作成ボタンの設置
```html
      <script type="text/template" id="noteControlView-template">
        <div class="row">
          <div class="col-sm-6">
            <!--後で検索欄を置く -->
          </div>

          <div class="col-sm-6 text-right">
            <a href="#new" class="btn btn-primary btn-small js-new">
              <span class="glyphicon glyphicon-plus"></span>
              New Note
            </a>
          </div>
        </div>
      </script>
```

```html
      <script src="./js/note_control.js"></script>
```

```javascript
  App.mainContainer = new App.Container({
    el:'#main-container'
  });

  // 初期化処理を追加する
  App.headerContainer = new App.Container({
    el:'#header-container'
 });
```

```javascript
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
```

```javascript
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
```

#### 新規作成画面の追加
```html
      <script type="text/template" id="noteForm-template">
        <form>
          <div class="form-group">
            <label for="noteTitle">Title</label>
            <input type="text" class="form-control js-noteTitle" id="noteTitle" value="<%= title %>">
          </div>
          <div class="form-group">
            <label for="noteBody">Body</label>
            <textarea class="form-control js-noteBody" row="8">
            <%= body %></textarea>
          </div>
          <button type="submit" class="btn btn-default">Submit</button>
        </form>
      </script>
```

```javascript
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
```

```html
      <script src="./js/note_form.js"></script>
```
#### 新規作成画面のルーティング
```javascript
//js/router.js

App.Router = Backbone.Router.extend({
  routes: {
    'notes/:id':'showNoteDetail',
    'new':'showNewNote',
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
});
```
### メモの編集機能の追加
```html
            <a href="#notes/<%= id %>/edit" class="btn btn-default btn-sm js-edit">
              <span class="glyphicon glyphicon-edit"></span>
              Edit
            </a>
```

```javascript
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
```

## <a name="4">メモ帳アプリケーションの作成３</a>
### メモの検索機能の追加
```html
      <script type="text/template" id="noteControlView-template">
        <div class="row">
          <div class="col-sm-6">
            <!-- 検索欄のHTMLの追加 -->
            <form class="form-inline js-search-form">
              <div class="input-group">
                <input type="text" class="form-control js-search-query" name="q">
                  <div class="input-group-btn">
                    <button class="btn btn-default" type="submit">
                      <i class="glyphicon glyphicon-search"></i>
                    </button>
                  </div>
                </div>
              </form>
              <!-- 検索欄のHTMLの追加 -->
          </div>

          <div class="col-sm-6 text-right">
            <a href="#new" class="btn btn-primary btn-small js-new">
              <span class="glyphicon glyphicon-plus"></span>
              New Note
            </a>
          </div>
        </div>
      </script>
```

```javascript
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
```

```javascript
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
```

```javascript
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
```



# 参照
+ [JavaScriptエンジニア養成読本](http://gihyo.jp/book/2014/978-4-7741-6797-8)
+ [JavaScriptエンジニア養成読本Backbone.js特集の訂正](http://text.ykhs.org/2014/10/22/javascript_engineer_training_book_fix.html)
+ [BACKBONE.JS](http://backbonejs.org/)
+ [UNDERSCORE.JS](http://underscorejs.org/)
+ [jQuery](http://jquery.com/)
+ [Backbone localStorage Adapter v1.1.15](https://github.com/jeromegn/Backbone.localStorage)
+ [Bootstrap](http://getbootstrap.com/)
