(function($){
  if (typeof Object.create !== 'function') {
    Object.create = function (o) {
        function F() {}
        F.prototype = o;
        return new F();
    };
  }

  $.fn.barWidget = function(options){
    if(typeof $(this).data('barWidget') !== "object"){
      var settings = $.extend({}, $.fn.barWidget.settings, options);
      if(this.length){
        return this.each(function(){
          var widget = Object.create(BarWidget);

          widget.init(settings, this);

          $.data(this, 'barWidget', widget);

        });
      }
    } else{
      var barWidget = $(this).data('barWidget');
      var callfnc = arguments[0];
      var args = Array.prototype.slice.call( arguments, 1 );
      switch (options) {
        case "init":
          barWidget.start();
          break;
        case "update":
          barWidget.update(args.pop());
          break;
        case "destroy":
          barWidget.destroy();
          break;
        case "reset":
          barWidget.reset();
          break;
        case undefined:
          barWidget.reset();
          break;
        default:
          $.error( 'Method ' +  options + ' does not exist on jquery-progress-bar' );

      }
    }

  };

  $.fn.barWidget.settings = {
    timeout: 60
  }

  var BarWidget = {
    options: {
      timeout: 60,
      markup: '<div class="bar-container"><div class="border-bar bar"></div><div class="background-bar bar"></div></div><span class="timer"></span>',
      onStop: function(){},
      onStart: function(){},
      onReset: function(){},
      onDestroy: function(){}
    },
    init: function(options, elem){
      this.options = $.extend({}, this.options, options);
      this.element = elem;
      this.$element = $(elem);
      this.interval_id = null;
      this.counter = this.options.timeout;
      this._build();

      return this;
    },
    run: function(){
      this.$element.addClass('active');
      if(this.counter > 0){
        this.counter -= 1;
        this._updateTimer(this.counter);
      }
      else{
        clearInterval(this.interval_id);
        this.stop();
        this.reset();
      }

    },
    start: function(){
      this.$element.trigger("bar-start-countdown");
      this.interval_id = setInterval($.proxy(this.run, this), 1000);
    },
    destroy: function(){
      this.$element.trigger("bar-destroy-countdown");
      this._unbindEvents();
      this.$element.empty();
      this.$element.removeData('barWidget');
      clearInterval(this.interval_id);
      this.options = null;
      this.element = null;
      this.$element = null;
      this.interval_id = null;
      this.counter = null;

    },
    reset: function(){
      this.$element.trigger("bar-reset-countdown");
      var $element = this.$element;
      var options = this.options;
      $element.removeAttr('style').removeClass('active');

      this.destroy();
      $element.barWidget(options);

    },
    stop: function(){
      this.$element.trigger("bar-finished-countdown")
    },

    update: function(options){
      this.options = $.extend({}, this.options, options);
      this.reset();
    },

    _formatTime: function (seconds){
      var time_format;
      var sec_num = parseInt(seconds, 10); // don't forget the second param
      var minutes = Math.floor(sec_num / 60);
      var seconds = sec_num - (minutes * 60);

      if (minutes < 10) {minutes = "0"+minutes;}
      if (seconds < 10) {seconds = "0"+seconds;}
      time_format = minutes+':'+seconds;
      return time_format;
    },
    _build: function(){
      if( ! this.$element.children('.bar-container').lenght ){
        this.$element.html(this.options.markup);
        this.$element.children('span').html(this._formatTime(this.options.timeout));
        this.$element.find('.bar').css({
          transition: 'all '+this.options.timeout+'s linear'
        });
        this._registerEvents();
      }
      else
        console.log('already initialized');
    },

    _registerEvents: function(){
      console.log('binding events');
      this.$element.on("bar-start-countdown", this.options.onStart);
      this.$element.on("bar-stop-countdown", this.options.onStop);
      this.$element.on("bar-reset-countdown", this.options.onReset);
      this.$element.on("bar-destroy-countdown", this.options.onDestroy);
    },
    _unbindEvents: function(){
      console.log('unbinding events');
      this.$element.unbind("bar-start-countdown");
      this.$element.unbind("bar-stop-countdown");
      this.$element.unbind("bar-reset-countdown");
      this.$element.unbind("bar-destroy-countdown");
    },
    _updateTimer: function(time){
      var span = this.$element.find('span');
      span.html(this._formatTime(time));
    }
  }

})(jQuery);
