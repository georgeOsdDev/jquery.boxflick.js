(function($){

  $.fn.boxflick=function(config){
    var defaults = {
      bounceLeft:50,
      bounceLeftClass:undefined,
      bounceRight:50,
      bounceRightClass:undefined,
      auto:0,
      "transition-duration":"300ms",
      "transition-timing-function":"linear"
    },
    bounceLeftStyleList = [],
    bounceRightStyleList = [],
    options,bounceLeftStyleTmpl,bounceRightStyleTmpl;

    options = $.extend(defaults, config);

    bounceLeftStyleTmpl =
      " #{ID}.bounceLeft_{NUMBER} { "+
        " -webkit-animation-duration: 0.5s; "+
        " -webkit-animation-name: {ID}_bounceLeft_{NUMBER}; "+
        " -webkit-animation-iteration-count:1; "+
      " } "+
      " @-webkit-keyframes {ID}_bounceLeft_{NUMBER} { "+
        " 0% { "+
          " -webkit-transform: translate3d(0, 0, 0); "+
        " } "+
        " 50% { "+
          " -webkit-transform: translate3d({BOUNCELEFT}px, 0, 0); "+
        " } "+
        " 100% { "+
          " -webkit-transform: translate3d(0, 0, 0); "+
        " } "+
      " } ";

    bounceRightStyleTmpl =
      " #{ID}.bounceRight_{NUMBER} { "+
        " -webkit-animation-duration: 0.5s; "+
        " -webkit-animation-name: {ID}_bounceRight_{NUMBER}; "+
        " -webkit-animation-iteration-count:1; "+
      " }"+
      " @-webkit-keyframes {ID}_bounceRight_{NUMBER} { "+
        " 0% {"+
          " -webkit-transform: translate3d({RIGHTMAX}px, 0, 0); "+
        " } "+
        " 50% { "+
          " -webkit-transform: translate3d({BOUNCERIGHT}px, 0, 0); "+
        " }"+
        " 100% {"+
          " -webkit-transform: translate3d({RIGHTMAX}px, 0, 0); "+
        " } "+
      " } ";



    this.each(function(i){

      var stX = 0,
          edX = 0,
          currentPos = 0,
          autoDirection = 1;
          self = this,
          $self = $(this),
          timerID = undefined,
          lastTouchTs = (new Date()).getTime(),
          isMoved = false;

      var count = $self.children().length,
          stepWidth = $self.width()/count,
          id = $self.attr("id"),
          bounceRight = -1 * ((stepWidth * (count-1))+options.bounceRight),
          rightMax = -1 * (stepWidth * (count-1));

      var _bounceLeftClass = options.bounceLeftClass || "bounceLeft_"+i;
      if (options.bounceLeftClass === undefined){
        bounceLeftStyleList[i] = bounceLeftStyleTmpl.replace(/{ID}/g,id).replace(/{NUMBER}/g,i).replace(/{BOUNCELEFT}/g,options.bounceLeft);
      }
      var _bounceRightClass = options.bounceRightClass || "bounceRight_"+i;
      if (options.bounceRightClass === undefined){
        bounceRightStyleList[i] = bounceRightStyleTmpl.replace(/{ID}/g,id).replace(/{NUMBER}/g,i).replace(/{BOUNCERIGHT}/g,bounceRight).replace(/{RIGHTMAX}/g,rightMax);
      }


      function saveCurrentPos(e){
        e.preventDefault();
        stX = e.originalEvent.targetTouches[0].pageX || 0;
      }

      function saveMovedPos(e){
        e.preventDefault();
        edX = e.originalEvent.targetTouches[0].pageX || 0;
        isMoved = true;
      }

      function flick(e){
        e.preventDefault();
        lastTouchTs = e.timestamp;
        clearTimeout(timerID);

        var direction;
        direction = stX > edX ? 1 : -1;
        if(!isMoved){
          if (currentPos === 0){
            autodirection = 1;
            direction = 1;
          }else if (currentPos === (count-1)){
            autodirection = -1;
            direction = -1;
          } else {
            direction = autodirection;
          }
        }

        isMoved = false;
        if (currentPos === 0 && direction === -1){
          $self
            .on('webkitAnimationEnd',function(){
              $self.removeClass(_bounceLeftClass);
            }).addClass(_bounceLeftClass);
          autodirection = 1;
          return startTimer();
        }

        if (currentPos === (count-1) && direction === 1){
          $self
            .on('webkitAnimationEnd',function(){
              $self.removeClass(_bounceRightClass);
            }).addClass(_bounceRightClass);
          autodirection = -1;
          return startTimer();
        }

        return move(direction);
      }

      function move(direction){
        var translateX = ((stepWidth*currentPos) + (stepWidth * direction)) * -1;

        $self.css({
          "-webkit-transform": "translate3d("+translateX+"px, 0, 0)",
          "-webkit-transition": "-webkit-transform "+options["transition-duration"]+" "+options["transition-timing-function"]
        });
        currentPos += direction;
        return startTimer();
      }

      function startTimer(){
        if(options.auto > 0){
          timerID = setTimeout(function(){
            var nowTs = (new Date()).getTime();
            if ((nowTs - lastTouchTs) < options.auto) return false;
            if (currentPos === 0) autoDirection = 1;
            if (currentPos === (count-1)) autoDirection = -1;
            move(autoDirection);
          },options.auto);
        }
        return false;
      }

      startTimer();
      $self.css({"-webkit-user-select": "none"})
        .on('touchstart',saveCurrentPos)
        .on('touchmove',saveMovedPos)
        .on('touchend',flick);
    });

    var cssStr = "";
    if (bounceLeftStyleList.length > 0){
      cssStr += bounceLeftStyleList.join("");
    }
    if (bounceRightStyleList.length > 0){
      cssStr += bounceRightStyleList.join("");
    }
    $("<style type='text/css'>"+cssStr+"</style>").appendTo("head");
    return this;
};
})(jQuery);
