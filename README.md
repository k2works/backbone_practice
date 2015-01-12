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
## <a name="4">メモ帳アプリケーションの作成３</a>

# 参照
+ [JavaScriptエンジニア養成読本](http://gihyo.jp/book/2014/978-4-7741-6797-8)
+ [JavaScriptエンジニア養成読本Backbone.js特集の訂正](http://text.ykhs.org/2014/10/22/javascript_engineer_training_book_fix.html)
+ [BACKBONE.JS](http://backbonejs.org/)
+ [UNDERSCORE.JS](http://underscorejs.org/)
+ [jQuery](http://jquery.com/)
+ [Backbone localStorage Adapter v1.1.15](https://github.com/jeromegn/Backbone.localStorage)
+ [Bootstrap](http://getbootstrap.com/)
