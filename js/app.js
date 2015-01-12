// js/app.js
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
