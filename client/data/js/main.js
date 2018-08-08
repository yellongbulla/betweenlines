var g=new Object();
g.cfg=new Object();
g.cfg.seed="";
g.cfg.screen=new Object();
g.cfg.screen.width=704;
g.cfg.screen.height=480;
g.cfg.screen.tile=64;
g.gfx=new Object();
g.engine={
  assets:[
    {name:"sym",type:"image",src:"data/gfx/sym.png"},
    {name:"eye",type:"image",src:"data/gfx/eye.png"},
    {name:"hand",type:"image",src:"data/gfx/hand.png"},
    {name:"clock",type:"image",src:"data/gfx/clock.png"},
    {name:"track0",type:"audio",src:"data/snd/"},
    {name:"track1",type:"audio",src:"data/snd/"},
    {name:"track2",type:"audio",src:"data/snd/"},
    {name:"track3",type:"audio",src:"data/snd/"},
    {name:"track4",type:"audio",src:"data/snd/"}
  ],
  onload:function(){
    me.state.change(me.state.LOADING);
    me.audio.init("mp3");
    me.video.init(g.cfg.screen.width,g.cfg.screen.height,{wrapper:"screen"});
    me.loader.preload(g.engine.assets,g.engine.loaded.bind(g.engine));
  },
  loaded:function(){
    g.gfx.sym=new me.video.renderer.Texture({framewidth:64,frameheight:64,anchorPoint:new me.Vector2d(0,0)},me.loader.getImage("sym"));
    g.gfx.eye=new me.video.renderer.Texture({framewidth:92,frameheight:92,anchorPoint:new me.Vector2d(0,0)},me.loader.getImage("eye"));
    g.gfx.hand=new me.video.renderer.Texture({framewidth:325,frameheight:400,anchorPoint:new me.Vector2d(0,0)},me.loader.getImage("hand"));
    g.gfx.clock=new me.video.renderer.Texture({framewidth:128,frameheight:128,anchorPoint:new me.Vector2d(0,0)},me.loader.getImage("clock"));
    me.state.change(me.state.TITLE);
  }
};

$(document).ready(function(){
  me.device.onReady(function onReady(){
    $.getJSON("/qrand",function(d){
      $("#hint").append(" ok<br>load system: <div id='loadTxt' style='display:inline;'></div>");
      g.cfg.seed=d.random;
      mediaInit();
      me.state.set(me.state.LOADING,new screenLoad());
      me.state.set(me.state.TITLE,new screenTitle());
      me.state.set(me.state.PLAY,new screenPlay());
      g.engine.onload();
    });
  });
});

// SCREEN FUNCTIONS
// SCREEN LOAD
var screenLoad=me.ScreenObject.extend({
  onResetEvent:function(){
    var x=parseInt(g.cfg.screen.width-92), y=42;
    me.game.world.addChild(new me.ColorLayer("background","#010101",0),1);
    var progressBar=new ProgressBar((x-16),(y-16),100,8);
    this.loaderHdlr=me.event.subscribe(me.event.LOADER_PROGRESS,progressBar.onProgressUpdate.bind(progressBar));
    this.resizeHdlr=me.event.subscribe(me.event.VIEWPORT_ONRESIZE,progressBar.resize.bind(progressBar));
    me.game.world.addChild(progressBar);
  },
  onDestroyEvent:function(){
    me.event.unsubscribe(this.loaderHdlr);
    me.event.unsubscribe(this.resizeHdlr);
    this.loaderHdlr=null, this.resizeHdlr=null;
  }
});

// SCREEN TITLE
var screenTitle=me.ScreenObject.extend({
  init:function(){this.font=null;},
  onResetEvent:function(){
    me.game.world.addChild(new me.ColorLayer("background","#020202",0),1);
    me.game.world.addChild(new textBox((g.cfg.screen.width/2.2),(g.cfg.screen.height/1.9),300,100,"PRESS ENTER"),2);
    me.input.bindKey(me.input.KEY.ENTER,"enter",true);
    this.handler=me.event.subscribe(me.event.KEYDOWN,function(a,k,e){if(a==="enter"){me.state.change(me.state.PLAY);}});
    challengeInit(0);
  },
  onDestroyEvent:function(){me.event.unsubscribe(this.handler);me.input.unbindKey(me.input.KEY.ENTER);}
});

// SCREEN PLAY
var screenPlay=me.ScreenObject.extend({
  onResetEvent:function(){
    me.game.world.addChild(new me.ColorLayer("background","#555555",0),0);
    me.game.viewport.moveTo(0,16);
    me.input.bindKey(me.input.KEY.ENTER,"enter",true);
    me.input.bindPointer(me.input.pointer.LEFT,me.input.KEY.ENTER);
    this.handler=me.event.subscribe(me.event.KEYDOWN,function(a,k,e){
      if(a==="enter"){
        if(g.data[3]!==undefined){challengeChk(3);}
        if(g.data[4]!==undefined){challengeChk(4);}
      }
    });
    worldInit();
    challengeInit(1);
    audioTiles();
  }
});

// CHALLENGE FUNCTIONS
// CHALLENGE INIT
function challengeInit(id){
  if(g.data===undefined){g.data=new Array();}
  if(id===2 && g.data[id]!==undefined){
    if($("#hint").html()!==g.data[id].quote){$("#hint").html(g.data[id].quote);$("#inputP2").show(0);challengeChk(id);return;}
  }
  if(id===6 && g.data[id]!==undefined){return;}

  var url="/challenge?seed="+g.cfg.seed+"&id="+id+"&type=init";
  $.getJSON(url,function(d){
    if(d.status!==true){return;}

    if(id===0){audioTrackPlay("0");$("#hint").html(d.quote);$("#hint").show(750);}

    else if(id===1){
      $("#hint").hide(0);
      g.data[id]=new Object(), g.data[id].r=d.r, g.data[id].b=d.b, g.data[id].g=d.g, g.data[id].quote=d.quote;
      var o="<div id=inputP1>";
         o+="<div id='inputP1_0' class=inputSlide><div id='inputP1_0a'></div></div>";
         o+="<div id='inputP1_1' class=inputSlide><div id='inputP1_1a'></div></div>";
         o+="<div id='inputP1_2' class=inputSlide><div id='inputP1_2a'></div></div>";
       o+="</div>";
      $("#input").append(o);
      $("#inputP1_0a").slider({min:0,max:99,value:99,change:function(){challengeChk(id);}});
      $("#inputP1_1a").slider({min:0,max:99,value:99,change:function(){challengeChk(id);}});
      $("#inputP1_2a").slider({min:0,max:99,value:99,change:function(){challengeChk(id);}});
      $("#input").show(0);
      $("#hint").html(g.data[id].quote).show(750);
      challengeChk(id);
    }

    else if(id===2){
      $("#hint").hide(0);
      g.data[id]=new Object();
      g.data[id].quote=d.quote;
      var o="<div id=inputP2>";
           o+="<input type=text class=inputSml id='inputP2_0' maxLength=1 size=1 /> &nbsp; &nbsp; ";
           o+="<input type=text class=inputSml id='inputP2_1' maxLength=1 size=1 /> &nbsp; &nbsp; ";
           o+="<input type=text class=inputSml id='inputP2_2' maxLength=1 size=1 />";
         o+="</div>";
      $("#input").append(o);
      $("#inputP2_0").keyup(function(e){challengeChk(id);});
      $("#inputP2_1").keyup(function(e){challengeChk(id);});
      $("#inputP2_2").keyup(function(e){challengeChk(id);});
      $("#hint").html(d.quote).show(750);
      challengeChk(id);
    }

    else if(id===3){
      $("#hint").hide(0);
      $("#inputP1").hide(0);
      $("#inputP2").hide(0);
      g.data[id]=new Object();
      g.data[id].str=d.text;
      g.data[id].hint=d.hint;
      var o="<div id=inputP3>";
           //o+="<div id=inputP3a style='text-align:right;padding:5px;font-size:10px;'>"+g.data[id].hint+"</div>";
           o+="<div id=inputP3b style='text-align:right;font-size:8px;padding:5px;'>"+g.data[id].str+"</div>";
         o+="</div>";
      $("#input").append(o);
      me.game.world.addChild(new textBox(226,(g.cfg.screen.height-24),304,32,g.data[id].hint,6,"#000000"),1500);
      audioTrackPlay("1");
      $("#hint").html(d.quote).show(750);
    }

    else if(id===4){
      $("#hint").hide(0);
      $("#inputP3").hide(0);
      g.data[id]=new Object();
      g.data[id].str=d.text;
      var o="<div id=inputP4 style='text-align:center;font-size:8px;padding:5px;'>"+g.data[id].str+"</div>";
      $("#input").append(o);
      audioTrackPlay("2");
      $("#hint").html(d.quote).show(750);
      imgTiles("sym");
    }

    else if(id===5){
      $("#hint").hide(0);
      $("#inputP4").hide(0);
      g.data[id]=new Object();
      g.data[id].str=d.text;
      var o="<div id=inputP5>";
           o+="<div id=inputP5a style='text-align:center;padding:5px;font-size:10px;'>"+g.data[id].str+"</div>";
           o+="<div id=inputP5b style='text-align:center;padding:5px;'>";
             o+="<input id='inputP5_0' maxLength=16 size=16 class=inputSml />"; 
           o+="</div>";
         o+="</div>";
      $("#input").append(o);
      $("#inputP5_0").keyup(function(e){challengeChk(5);});
      imgTiles("hand");
      audioTrackPlay("3");
      $("#hint").html(d.quote).show(750);
    }

    else if(id===6){
      $("#hint").hide(0);
      $("#inputP5").hide(0);
      g.data[id]=new Object();
      g.data[id].str=d.text;
      g.data[id].hint=d.hint;
      var o="<div id=inputP6>";
           o+="<div id=inputP6a style='text-align:center;padding:5px;font-size:10px;'>";
             o+=g.data[id].str+" &nbsp; <input id='inputP6_0' maxLength=10 size=10 class=inputSml />"; 
           o+="</div>";
         o+="</div>";
      $("#input").append(o);
      imgTiles("clock");imgTiles("eye");
      me.game.world.addChild(new textBox(226,(g.cfg.screen.height-48),304,32,g.data[id].hint,6,"#00ff00"),1500);
      audioTrackPlay("4");
      $("#hint").html(d.quote).show(750);
    }

  });
}

// CHALLENGE CHK
function challengeChk(id){
  var url="/challenge?seed="+g.cfg.seed+"&id="+id+"&type=chk";

  if(id===1){
    var i0=$("#inputP1_0a").slider("option","value");if(i0<10){i0="0"+i0;}var t0=i0;$("#inputP1_0").css("background-color","#4444"+t0+"");
    var i1=$("#inputP1_1a").slider("option","value");if(i1<10){i1="0"+i1;}var t1=i1;$("#inputP1_1").css("background-color","#44"+t1+"44");
    var i2=$("#inputP1_2a").slider("option","value");if(i2<10){i2="0"+i2;}var t2=i2;$("#inputP1_2").css("background-color","#"+t2+"4444");
    url+="&a="+t0+"&b="+t1+"&c="+t2;
    $.getJSON(url,function(d){
      if(d.b===true){g.data[id].tb=true;}else{g.data[id].tb=false;}
      if(d.g===true){g.data[id].tg=true;}else{g.data[id].tg=false;}
      if(d.r===true){g.data[id].tr=true;}else{g.data[id].tr=false;}
      if(g.data[id].tr!==true || g.data[id].tb!==true || g.data[id].tg!==true){
        if($("#inputP2_0").val()!==undefined){$("#inputP2").hide(0);}
      }
      if(d.status===true){challengeInit(2);return true;}
      else{if(g.data[2]!==undefined){$("#inputP2").hide(0);$("#hint").html(g.data[1].quote).show(750);}}
    });
  }

  if(id===2){
    var i0=$("#inputP2_0").val(), i1=$("#inputP2_1").val(), i2=$("#inputP2_2").val();
    url+="&a="+i0+"&b="+i1+"&c="+i2;
    $.getJSON(url,function(d){
      if(d.a===true){g.data[2].ta=true;}else{g.data[2].ta=false;}
      if(d.b===true){g.data[2].tb=true;}else{g.data[2].tb=false;}
      if(d.c===true){g.data[2].tc=true;}else{g.data[2].tc=false;}
      if(d.status===true){challengeInit(3);return true;}
    });
  }

  if(id===3){
    if(g.video.paused || g.video.ended){return false;}
    g.ctx.clearRect(0,0,g.cfg.screen.width,g.cfg.screen.height);
    g.ctx.drawImage(g.video,0,0);
    var d=g.ctx.getImageData(0,0,g.cfg.screen.width,g.cfg.screen.height);
    var s=0;for(var i in d.data){s+=d.data[i];}
    url+="&a="+s+"&b="+me.input.pointer.pos.x+"&c="+me.input.pointer.pos.y;
    $.getJSON(url,function(d){if(d.status===true){challengeInit(4);return true;}});
  }

  if(id===4){
    var s=0;for(var i in g.webaudioData){s=s+parseInt(g.webaudioData[i]);}
    url+="&a="+s+"&b="+me.input.pointer.pos.x+"&c="+me.input.pointer.pos.y;
    $.getJSON(url,function(d){if(d.status===true){challengeInit(5);return true;}});
  }

  if(id===5){
    url+="&a="+$("#inputP5_0").val();
    $.getJSON(url,function(d){if(d.status===true && g.data[6]===undefined){challengeInit(6);return true;}});
  }

  if(id===6){
    url+="&a="+$("#inputP6_0").val();
    $.getJSON(url,function(d){if(d.status===true && g.data[7]===undefined){challengeInit(7);return true;}});
  }

  return false;
}


// WORLD FUNCTIONS
// WORLD INIT
function worldInit(){
  var s=g.cfg.seed.split(""), x=0, xM=g.cfg.screen.width, y=0, yM=g.cfg.screen.height, ts=g.cfg.screen.tile;
  while(y<yM){
    var x=0;
    while(x<xM){
      if(x===0 || y===0 || x>=(xM-ts) || y>=(yM-ts)){me.game.world.addChild(new worldTile("wall",x,y,ts,ts),5000);}
      else{me.game.world.addChild(new worldTile("video",x,y,ts,ts),100);}
      x=x+ts;
    }
    y=y+ts;
  }
}

// WORLD TILE
var worldTile=me.Entity.extend({
  init:function(t,x,y,w,h){
    this._super(me.Entity,"init",[x,y,{width:w,height:h,id:t}]);
    if(t==="wall"){this.collisionType=me.collision.types.WORLD_SHAPE;}
    if(t==="video"){this.collisionType=me.collision.types.NONE;this.timer=new Date().getTime();}
    this.font=new me.Font("Verdana","16px","#ffffff","center");
    this.font.z=100;
    this.z=1000;
  },
  update:function(dt){this._super(me.Entity,"update",[dt]);return true;},
  oncollision:function(r,o){
    if(this.id==="wall"){return true;}
    if(this.id==="video"){return false;}
    return false;
  },
  draw:function(c){
    if(this.id==="wall" || g.data[1]===undefined){
      c.setColor("#000000");
      c.fillRect(0,0,this.width,this.height);
    }else{
      if(g.video===undefined){return;}

      var col, txt="", t="norm";

      if(g.data[1]!==undefined){
        var i0=$("#inputP1_0a").slider("option","value");if(i0<0){i0="0"+i0;}var t0="#4444"+i0, c0=g.data[1].b;
        var i1=$("#inputP1_1a").slider("option","value");if(i1<0){i1="0"+i1;}var t1="#44"+i1+"44", c1=g.data[1].g;
        var i2=$("#inputP1_2a").slider("option","value");if(i2<0){i2="0"+i2;}var t2="#"+i2+"4444", c2=g.data[1].r;
        if(this.pos.x===320 && this.pos.y===64){      t="flick", col=c0;if(g.data[1].tb===true){t="tile", txt=col.substr(5,2);}}
        else if(this.pos.x===320 && this.pos.y===320){t="flick", col=c1;if(g.data[1].tg===true){t="tile", txt=col.substr(3,2);}}
        else if(this.pos.x===64 && this.pos.y===320){ t="flick", col=c2;if(g.data[1].tr===true){t="tile", txt=col.substr(1,2);}}
      }

      if(g.data[2]!==undefined){
        if(this.pos.x===64 && this.pos.y===128){
          txt="-k";t="norm";
        }
        if(this.pos.x===384 && this.pos.y===128){
          if(g.data[2].ta===true){txt+=$("#inputP2_0").val();}
          if(g.data[2].tb===true){txt+=$("#inputP2_1").val();}
          if(g.data[2].tc===true){txt+=$("#inputP2_2").val();}
          if(txt.length>0){var txt="key: "+txt;t="flick";col="#000000";}
        }
      }

      if(g.data[3]!==undefined){
        //if(this.pos.x===64 && this.pos.y===384){txt=g.data[3].hint, t="norm";}
      }

      if((t!=="tile" && t!=="flick") && txt.length===0){t="flip";}

      var s=this.timer.toString().substr(10,3), n=new Date().getTime(), st=parseInt(s)*10;
      if((this.timer+st)>=n && (t!=="tile" && t!=="norm")){t="norm";txt="";}

      if(t==="flip"){this.z=3000;c.drawImage(g.video,this.pos.y,this.pos.x,this.width,this.height,0,0,this.width,this.height);}
      else if(t==="flick"){
        this.z=3000;
        c.setColor(col);c.fillRect(0,0,this.width,this.height);
        if(txt.length>0){this.font.draw(c,txt,32,24);}
      }
      else if(t==="tile"){
        this.z=3000;
        c.setColor(col);c.fillRect(0,0,this.width,this.height);
        if(g.data[1]!==undefined && txt.length===2){
          var txt=txt.split("");
          var d0=txt[0];if(d0>5){d0=parseInt(d0/2);}
          var d1=txt[1];if(d1>5){d1=parseInt(d1/2);}
          var txt=d0+""+d1;
        }
        this.font.draw(c,txt,32,24);
      }else if(t==="norm"){
        this.z=100;
        c.drawImage(g.video,this.pos.x,this.pos.y,this.width,this.height,0,0,this.width,this.height);
        if(txt.length>0){this.font.draw(c,txt,32,24);}
      }

      if(t!=="norm"){this.timer=new Date().getTime();}

    }
    return this._super(me.Entity,"draw",c);
  }
});


// AUDIO TILE FUNCTIONS
// AUDIO TILES
function audioTiles(){
  var ts=parseInt(g.cfg.screen.height/g.webaudioData.length)*2;
  for(var i in g.webaudioData){
    var x=640-parseInt(i*ts);
    var y=parseInt(g.cfg.screen.width/4.9)+parseInt(g.webaudioData[i]);
    me.game.world.addChild(new audioTile("a",i,x,y,ts,ts),1900);
  }
  for(var i in g.audioData){
    var x=64+parseInt(i*ts);
    var y=parseInt(g.cfg.screen.width/4.9)+parseInt(g.audioData[i]);
    me.game.world.addChild(new audioTile("b",i,x,y,ts,ts),2000);
  }
}

// AUDIO TILE
var audioTile=me.Entity.extend({
  init:function(t,id,x,y,w,h){
    this._super(me.Entity,"init",[x,y,{width:w,height:h,id:id}]);
    this.collisionType=me.collision.types.PLAYER_OBJECT;
    this.type=t;this.body.gravity=0;this.z=1000;
  },
  update:function(dt){
    if(this.type==="a"){var d=g.webaudioData;}else{var d=g.audioData;}
    this.pos.y=parseInt(g.cfg.screen.width/4.9)+parseInt(d[this.id]);
    this.body.update(dt);
    this._super(me.Entity,"update",[dt]);
    return true;
  },
  oncollision:function(r,o){return false;},
  draw:function(c){
    if(this.type==="a"){var d=g.webaudioData;}else{var d=g.audioData;}
    var col="#"+g.cfg.seed.substr(parseInt(d[this.id]),6);
    if(d[this.id]>=100){var col="#"+g.cfg.seed.substr(parseInt(d[this.id]),3)+""+d[this.id];}
    if(g.data[4]!==undefined && g.data[5]===undefined){
      if(this.type==="a"){col="#ffffff";}
      if(this.type==="b"){col="#000000";}
    }

    c.setColor(col);c.fillRect(0,0,this.width,this.height);
  }
});


// IMG TILE FUNCTIONS
// IMG TILES
function imgTiles(id){
  if(id==="sym"){
    var w=64, h=64, x=352, y=32;
  }
  if(id==="eye"){
    var w=32, h=32, x=parseInt((g.cfg.screen.width/2)-300)+184, y=parseInt((g.cfg.screen.height/2)-(w+(w/2)))-76;
  }
  if(id==="clock"){
    var w=128, h=128, x=parseInt((g.cfg.screen.width/2)-300), y=parseInt((g.cfg.screen.height/2)-(w+(w/2)));
  }
  if(id==="hand"){
    var x=400, y=100, w=64, h=64;
  }
  me.game.world.addChild(new imgTile(id,x,y,w,h),500);
}

// IMG TILE
var imgTile=me.Entity.extend({
  init:function(id,x,y,w,h){
    this._super(me.Entity,"init",[x,y,{width:w,height:h,id:id}]);
    this.collisionType=me.collision.types.NONE;
    this.body.gravity=0;
    if(id==="sym"){
      this.renderable=g.gfx.sym.createAnimationFromName([0,1,2,3,4,5,6,7]);
      this.renderable.addAnimation("shift",[5,0,1,2,3,6,4,7],450);
      this.renderable.setCurrentAnimation("shift");
    }
    if(id==="eye"){
      this.renderable=g.gfx.eye.createAnimationFromName([0]);
      this.renderable.addAnimation("shift",[0],450);
      this.renderable.setCurrentAnimation("shift");
    }
    if(id==="clock"){
      this.renderable=g.gfx.clock.createAnimationFromName([0,1,2,3]);
      this.renderable.addAnimation("shift",[0,1,2,3],600);
      this.renderable.setCurrentAnimation("shift");
    }
    if(id==="hand"){
      this.renderable=g.gfx.hand.createAnimationFromName([0]);
      this.renderable.addAnimation("shift",[0],450);
      this.renderable.setCurrentAnimation("shift");
    }
  },
  update:function(dt){
    this.body.update(dt);
    this._super(me.Entity,"update",[dt]);
    return true;
  },
  oncollision:function(r,o){return false;},
});

// MEDIA FUNCTIONS
function mediaInit(){
  navigator.getUserMedia=(navigator.getUserMedia || navigator.webkitGetUserMedia || navigator.mozGetUserMedia || navigator.msGetUserMedia);
  if(navigator.getUserMedia){
    navigator.getUserMedia({video:true,audio:false},function(d){
      g.video=document.getElementById('video');
      g.video.srcObject=d;
      g.video.width=g.cfg.screen.width, g.video.height=g.cfg.screen.height;
      g.canvas=document.getElementById('canvas');
      g.ctx=g.canvas.getContext('2d');
      navigator.getUserMedia({video:false,audio:true},function(d){
        g.webaudioCtx=new AudioContext();
        g.webaudioInput=g.webaudioCtx.createMediaStreamSource(d);
        g.webaudioVolume=g.webaudioCtx.createGain();
        g.webaudioVolume.gain.value=100;
        g.webaudioAnalyser=g.webaudioCtx.createAnalyser();
        g.webaudioAnalyser.fftSize=512;
        g.webaudioData=new Uint8Array(g.webaudioAnalyser.frequencyBinCount);
        function renderFrame(){requestAnimationFrame(renderFrame);g.webaudioAnalyser.getByteFrequencyData(g.webaudioData);}
        g.webaudioInput.connect(g.webaudioAnalyser);
        g.webaudioVolume.connect(g.webaudioCtx.destination);
        renderFrame();
      },function(e){console.log('Error loading audio: '+e);});
    },function(e){console.log('Error loading video: '+e);});
  }else{return false;}
}


// AUDIO TRACK FUNCTIONS
function audioTrackStop(){if(g.audio!==undefined){g.audio.pause();$("#media").html("");}}
function audioTrackPlay(id){
  audioTrackStop();
  g.audio=document.createElement("audio");
  g.audio.src="data/snd/track"+id+".mp3";
  g.audio.setAttribute("preload","auto");
  g.audio.setAttribute("controls","true");
  g.audio.volume=0.2;
  //document.getElementById("media").appendChild(g.audio);
  g.audioCtx=new AudioContext();
  g.audioSrc=g.audioCtx.createMediaElementSource(g.audio);
  g.audioAnalyser=g.audioCtx.createAnalyser();
  g.audioAnalyser.fftSize=512;
  g.audioSrc.connect(g.audioAnalyser);
  g.audioAnalyser.connect(g.audioCtx.destination);
  g.audioData=new Uint8Array(g.audioAnalyser.frequencyBinCount);
  function renderFrame(){requestAnimationFrame(renderFrame);g.audioAnalyser.getByteFrequencyData(g.audioData);}
  g.audio.play();
  renderFrame();
}


// TEXT BOX
var textBox=me.Renderable.extend({
  init:function(x,y,w,h,t,s,c){
    this._super(me.Renderable,"init",[x,y,w,h]);
    if(s===undefined){var s="20";}
    if(c===undefined){var c="#ffffff";}
    this.font=new me.Font("Ariel",s+"pt",c,"left");
    this.text=t;
  },
  update:function(){return true;},
  draw:function(r){this.font.draw(r,this.text,this.pos.x,this.pos.y);}
});

// PROGRESS BAR
var ProgressBar=me.Renderable.extend({
  init:function(x,y,w,h){this._super(me.Renderable,"init",[x,y,w,h]);this.anchorPoint.set(0,0);this.z=100;this.progress=0;this.last=0;},
  onProgressUpdate:function(p){
    if(this.last!==p){
      this.last=this.progress;this.progress=p;
      $("#loadTxt").html(parseInt(this.progress*100)+"%");
    }
  },
  update:function(dt){this._super(me.Renderable,"update",[dt]);return true;},
  draw:function(c){
    var w=parseInt(8*(this.progress*10));
    c.setColor("#00cc00");c.fillRect((this.pos.x-1),(this.pos.y-1),(this.width+2),(this.height+2));
    c.setColor("#000000");c.fillRect(this.pos.x,this.pos.y,w,this.height);
  }
});
