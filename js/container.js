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
