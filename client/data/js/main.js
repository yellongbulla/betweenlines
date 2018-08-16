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
    {name:"flag",type:"image",src:"data/gfx/flag.png"},
    {name:"hand",type:"image",src:"data/gfx/hand.png"},
    {name:"riot",type:"image",src:"data/gfx/riot.png"},
    {name:"clock",type:"image",src:"data/gfx/clock.png"},
    {name:"track0",type:"audio",src:"data/snd/"},
    {name:"track1",type:"audio",src:"data/snd/"},
    {name:"track2",type:"audio",src:"data/snd/"},
    {name:"track3",type:"audio",src:"data/snd/"},
    {name:"track4",type:"audio",src:"data/snd/"},
    {name:"track5",type:"audio",src:"data/snd/"},
    {name:"track6",type:"audio",src:"data/snd/"},
    {name:"track7",type:"audio",src:"data/snd/"},
    {name:"track8",type:"audio",src:"data/snd/"},
    {name:"track9",type:"audio",src:"data/snd/"}
  ],
  onload:function(){
    me.state.change(me.state.LOADING);
    me.audio.init("mp3");
    me.video.init(g.cfg.screen.width,g.cfg.screen.height,{wrapper:"screen"});
    me.loader.preload(g.engine.assets,g.engine.loaded.bind(g.engine));
  },
  loaded:function(){
    g.gfx.sym=new me.video.renderer.Texture({framewidth:64,frameheight:64,anchorPoint:new me.Vector2d(0,0)},me.loader.getImage("sym"));
    g.gfx.flag=new me.video.renderer.Texture({framewidth:64,frameheight:64,anchorPoint:new me.Vector2d(0,0)},me.loader.getImage("flag"));
    g.gfx.riot=new me.video.renderer.Texture({framewidth:190,frameheight:210,anchorPoint:new me.Vector2d(0,0)},me.loader.getImage("riot"));
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

// SCREEN FUNCTIONS
// TEXT BOX
var textBox=me.Renderable.extend({
  init:function(x,y,w,h,t,s,c){
    this._super(me.Renderable,"init",[x,y,w,h]);
    if(s===undefined){var s="20";}if(c===undefined){var c="#ffffff";}this.font=new me.Font("Ariel",s+"pt",c,"left");this.text=t;
  },
  update:function(){return true;},
  draw:function(r){this.font.draw(r,this.text,this.pos.x,this.pos.y);}
});

// PROGRESS BAR
var ProgressBar=me.Renderable.extend({
  init:function(x,y,w,h){this._super(me.Renderable,"init",[x,y,w,h]);this.anchorPoint.set(0,0);this.z=100;this.p=0;this.l=0;},
  onProgressUpdate:function(p){if(this.l!==p){this.l=this.p;this.p=p;$("#loadTxt").html(parseInt(this.p*100)+"%");}},
  update:function(dt){this._super(me.Renderable,"update",[dt]);return true;},
  draw:function(c){
    c.setColor("#00cc00");c.fillRect((this.pos.x-1),(this.pos.y-1),(this.width+2),(this.height+2));
    c.setColor("#000000");c.fillRect(this.pos.x,this.pos.y,parseInt(8*(this.p*10)),this.height);
  }
});

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
    me.event.unsubscribe(this.loaderHdlr);me.event.unsubscribe(this.resizeHdlr);this.loaderHdlr=null, this.resizeHdlr=null;
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
        if(g.data[3]!==undefined){challenge(3,"check");}
        if(g.data[4]!==undefined){challenge(4,"check");}
        if(g.data[8]!==undefined){challenge(8,"check");}
      }
    });
    worldInit();$("#input").show(0);challengeInit(1);
  }
});

// CHALLENGE INIT
function challengeInit(id){
  if(g.data===undefined){g.data=new Array();}
  var url="/challenge?seed="+g.cfg.seed+"&id="+id+"&type=init";
  $.getJSON(url,function(d){if(d.status!==true){return;}challenge(id,"init",d);});
}

// CHALLENGE FUNCTIONS
function challenge(id,opt,d){
  var url="/challenge?seed="+g.cfg.seed+"&id="+id+"&type=chk";

  // CHALLENGE 0 (title screen)
  if(id===0){
    if(opt==="init"){
      g.data[id]=new Object(), g.data[id].title=d.title, g.data[id].quote=d.quote;
      $("#title").html(g.data[id].title);
      $("#hint").hide(0).html(g.data[id].quote).show(750);
      audioTrackPlay("0");
    }
  }

  // CHALLENGE 1
  if(id===1){
    if(opt==="init"){
      var tf=false;      
      if(g.data[id]===undefined && d!==undefined){
        tf=true;
        var o="<div id=inputP"+id+">";
           o+="<div style='padding:2px;font-size:8px;text-align:right;'>Arrow keys to fine tune.</div>";
           o+="<div id='inputP"+id+"_0' class=inputSlide><div id='inputP"+id+"_0a'></div></div>";
           o+="<div id='inputP"+id+"_1' class=inputSlide><div id='inputP"+id+"_1a'></div></div>";
           o+="<div id='inputP"+id+"_2' class=inputSlide><div id='inputP"+id+"_2a'></div></div>";
         o+="</div>";
        $("#input").append(o);
        $("#inputP"+id+"_0a").slider({min:0,max:99,value:99,change:function(){challenge(id,"check");}});
        $("#inputP"+id+"_1a").slider({min:0,max:99,value:99,change:function(){challenge(id,"check");}});
        $("#inputP"+id+"_2a").slider({min:0,max:99,value:99,change:function(){challenge(id,"check");}});
        $("#inputP"+id+"_0").find(".ui-slider-handle").focus(function(){
          $(".inputSlide").css("border-color","#000");$("#inputP"+id+"_0").css("border-color","#fff");
        });
        $("#inputP"+id+"_1").find(".ui-slider-handle").focus(function(){
          $(".inputSlide").css("border-color","#000");$("#inputP"+id+"_1").css("border-color","#fff");
        });
        $("#inputP"+id+"_2").find(".ui-slider-handle").focus(function(){
          $(".inputSlide").css("border-color","#000");$("#inputP"+id+"_2").css("border-color","#fff");
        });
        me.input.bindKey(me.input.KEY.SHIFT,"shift",true);
        this.handler=me.event.subscribe(me.event.KEYDOWN,function(a,k,e){
          if(a==="shift"){
            if(g.data[id]!==undefined){
              var id=$("#"+$(document.activeElement)[0].parentElement.id)[0].parentElement.id;
              if(id==="inputP"+id+"_0"){$("#inputP"+id+"_1").find(".ui-slider-handle").focus();}
              if(id==="inputP"+id+"_1"){$("#inputP"+id+"_2").find(".ui-slider-handle").focus();}
              if(id==="inputP"+id+"_2"){$("#inputP"+id+"_0").find(".ui-slider-handle").focus();}
            }
          }
        });
        g.data[id]=new Object(), g.data[id].r=d.r, g.data[id].b=d.b, g.data[id].g=d.g;
        g.data[id].tb=false, g.data[id].tg=false, g.data[id].tr=false, g.data[id].quote=d.quote, g.data[id].title=d.title;
        $("#title").html(g.data[id].title);
      }
      $("#inputP"+id+"_0").find(".ui-slider-handle").focus();
      $("#hint").hide(0).html(g.data[id].quote).show(750);
      challenge(id,"check");
    }
    if(opt==="check"){
      var i0=$("#inputP"+id+"_0a").slider("option","value");if(i0<10){i0="0"+i0;}$("#inputP"+id+"_0").css("background-color","#4444"+i0+"");
      var i1=$("#inputP"+id+"_1a").slider("option","value");if(i1<10){i1="0"+i1;}$("#inputP"+id+"_1").css("background-color","#44"+i1+"44");
      var i2=$("#inputP"+id+"_2a").slider("option","value");if(i2<10){i2="0"+i2;}$("#inputP"+id+"_2").css("background-color","#"+i2+"4444");
      $.getJSON(url+"&a="+i0+"&b="+i1+"&c="+i2,function(d){
        if(d.b===true){g.data[id].tb=true, g.data[id].v0=i0;}else{g.data[id].tb=false;}
        if(d.g===true){g.data[id].tg=true, g.data[id].v1=i1;}else{g.data[id].tg=false;}
        if(d.r===true){g.data[id].tr=true, g.data[id].v2=i2;}else{g.data[id].tr=false;}
        if(d.status===true){return challenge(2,"check");}
      });
    }
    if(opt==="worldtile"){
      var col="", t="", txt="";
      if(d.x===320 && d.y===64){ t="flick", col=g.data[id].b;if(g.data[id].tb===true){t="tile", txt=col.substr(5,2);}}
      if(d.x===320 && d.y===320){t="flick", col=g.data[id].g;if(g.data[id].tg===true){t="tile", txt=col.substr(3,2);}}
      if(d.x===64 && d.y===320){ t="flick", col=g.data[id].r;if(g.data[id].tr===true){t="tile", txt=col.substr(1,2);}}
      if(txt.length>1){
        var txt=txt.split(""), d0=parseInt(txt[0]), d1=parseInt(txt[1]);
        if(d0>5){d0=parseInt(d0/2);}if(d1>5){d1=parseInt(d1/2);}
        var txt=d0+":"+d1;
      }
      return {"col":col,"type":t,"txt":txt};
    }
  }

  // CHALLENGE 2
  if(id===2){
    if(opt==="init"){
      if(g.data[id]===undefined && d!==undefined){
        g.data[id]=new Object(), g.data[id].quote=d.quote, g.data[id].title=d.title;
        var o="<div id='inputP"+id+"'>";
o+="<input type=text class=inputSml id='inputP"+id+"_0' style='margin-left:75px;margin-right:75px;text-align:center;' maxLength=1 size=1 />";
o+="<input type=text class=inputSml id='inputP"+id+"_1' style='margin-left:75px;margin-right:75px;text-align:center;' maxLength=1 size=1 />";
o+="<input type=text class=inputSml id='inputP"+id+"_2' style='margin-left:75px;margin-right:75px;text-align:center;' maxLength=1 size=1 />";
           o+="</div>";
        $("#input").append(o);
        $("#inputP"+id+"_0").keyup(function(e){challenge(id,"check");});
        $("#inputP"+id+"_1").keyup(function(e){challenge(id,"check");});
        $("#inputP"+id+"_2").keyup(function(e){challenge(id,"check");});
        $("#inputP"+id+"_0").css("background-color",g.data[1].b);
        $("#inputP"+id+"_1").css("background-color",g.data[1].g);
        $("#inputP"+id+"_2").css("background-color",g.data[1].r);
        $("#hint").hide(0).html(g.data[id].quote).show(750);
        $("#title").html(g.data[id].title);
      }
      challenge(id,"check");
    }
    if(opt==="check"){
      if(g.data[id]===undefined){challengeInit(id);}
      if(g.data[1].tr!==true || g.data[1].tb!==true || g.data[1].tg!==true){return false;}
      var i0=$("#inputP"+id+"_0").val(), i1=$("#inputP"+id+"_1").val(), i2=$("#inputP"+id+"_2").val();
      $.getJSON(url+"&a="+i0+"&b="+i1+"&c="+i2,function(d){
        if(d.a===true){g.data[id].ta=true, g.data[id].v0=i0;}else{g.data[id].ta=false;}
        if(d.b===true){g.data[id].tb=true, g.data[id].v1=i1;}else{g.data[id].tb=false;}
        if(d.c===true){g.data[id].tc=true, g.data[id].v2=i2;}else{g.data[id].tc=false;}
        if(d.status===true){return challengeInit(3);}
      });
    }
    if(opt==="worldtile"){
      var col="", t="", txt="", txtSize=0, txtCol="";
      if(d.pos.x===64 && d.pos.y===192){txt="-k", t="norm", txtSize=24, txtCol="#ff9900";}
      if(d.pos.x===384 && d.pos.y===128){
        if(g.data[2].ta===true){txt+=g.data[2].v0;}
        if(g.data[2].tb===true){txt+=g.data[2].v1;}
        if(g.data[2].tc===true){txt+=g.data[2].v2;}
        if(txt.length>0){var txt="key: "+txt;t="flick";col="#000000";txtSize=12;txtCol="#00ff00";}
      }
      return {"col":col,"type":t,"txt":txt,"txtSize":txtSize,"txtCol":txtCol};
    }
  }

  // CHALLENGE 3
  if(id===3){
    if(opt==="init"){
      $("#inputP1").hide(0);
      $("#inputP2").hide(0);
      g.data[id]=new Object(), g.data[id].str=d.text, g.data[id].hint=d.hint, g.data[id].quote=d.quote, g.data[id].title=d.title;
      $("#input").append("<div id=inputP"+id+" style='text-align:right;font-size:8px;padding:5px;'>"+g.data[id].str+"</div>");
      me.game.world.addChild(new textBox(226,(g.cfg.screen.height-48),304,32,g.data[id].hint,6,"#000000"),1500);
      audioTiles();
      audioTrackPlay("1");
      $("#hint").hide(0).html(g.data[id].quote).show(750);
      $("#title").html(g.data[id].title);
    }
    if(opt==="check"){
      if((g.video.paused || g.video.ended) || g.data[(id+1)]!==undefined){return true;}
      g.ctx.clearRect(0,0,g.cfg.screen.width,g.cfg.screen.height);
      g.ctx.drawImage(g.video,0,0);
      var d=g.ctx.getImageData(0,0,g.cfg.screen.width,g.cfg.screen.height);
      var s=0;for(var i in d.data){s+=d.data[i];}
      url+="&a="+s+"&b="+me.input.pointer.pos.x+"&c="+me.input.pointer.pos.y;
      $.getJSON(url,function(d){if(d.status===true){challengeInit(4);}});
    }
    if(opt==="audiotile" && g.data[(id+1)]===undefined){
      if(g.data[(id+1)]===undefined){return {"h":24};}
    }
  }

  // CHALLENGE 4
  if(id===4){
    if(opt==="init"){
      $("#inputP"+(id-1)+"").hide(0);
      g.data[id]=new Object(), g.data[id].str=d.text, g.data[id].quote=d.quote, g.data[id].title=d.title;
      var o="<div id=inputP"+id+" style='text-align:right;font-size:8px;padding:5px;'>"+g.data[id].str+"</div>";
      $("#input").append(o);
      audioTrackPlay("2");
      $("#hint").hide(0).html(g.data[id].quote).show(750);
      $("#title").html(g.data[id].title);
      imgTiles("hand");
    }
    if(opt==="check"){
      if(g.data[(id+1)]!==undefined){return true;}
      var s=0;for(var i in g.webaudioData){s=s+parseInt(g.webaudioData[i]);}
      url+="&a="+s+"&b="+me.input.pointer.pos.x+"&c="+me.input.pointer.pos.y;
      $.getJSON(url,function(d){if(d.status===true){challengeInit(5);return true;}});
    }
    if(opt==="audiotile" && g.data[(id+1)]===undefined){
      if(g.data[(id+1)]===undefined){
        var col="", h=2;if(d.type==="a"){col="#ffffff";h=3;}else{col="#000000";h=2;}
        return {"col":col,"h":h};
      }
    }
  }

  // CHALLENGE 5
  if(id===5){
    if(opt==="init"){
      $("#inputP"+(id-1)).hide(0);
      g.data[id]=new Object(), g.data[id].str=d.text, g.data[id].quote=d.quote, g.data[id].title=d.title;
      var o="<div id=inputP"+id+">";
           o+="<div id=inputP"+id+"a style='text-align:right;font-size:8px;padding:5px;'>"+g.data[id].str+"</div>";
           o+="<div id=inputP"+id+"b style='text-align:right;padding:2px;'>";
             o+="<input id='inputP"+id+"_0' maxLength=6 size=6 class=inputSml />"; 
           o+="</div>";
         o+="</div>";
      $("#input").append(o);
      $("#inputP"+id+"_0").keyup(function(e){challenge(id,"check");});
      imgTiles("sym");
      audioTrackPlay("3");
      $("#hint").hide(0).html(g.data[id].quote).show(750);
      $("#title").html(g.data[id].title);
    }
    if(opt==="check"){
      url+="&a="+$("#inputP"+id+"_0").val();
      $.getJSON(url,function(d){if(d.status===true && g.data[(id+1)]===undefined){challengeInit((id+1));return true;}});
    }
    if(opt==="audiotile" && g.data[(id+1)]===undefined){
      var col="", w=1, h=3;if(d.type==="a"){w=1,h=12;col="#ffffff";}else{col="#000000";w=4, h=4;}
      return {"col":col,"h":h,"w":w};
    }
  }

  // CHALLENGE 6
  if(id===6){
    if(opt==="init"){
      if(g.data[id]===undefined && d!==undefined){
        $("#inputP"+(id-1)).hide(0);
        g.data[id]=new Object(), g.data[id].str=d.text, g.data[id].hint=d.hint, g.data[id].quote=d.quote, g.data[id].title=d.title;
        var o="<div id=inputP"+id+" style='text-align:right;padding:5px;font-size:10px;'>"+g.data[id].str+" &nbsp; ";
             o+="<input id='inputP"+id+"_0' maxLength=5 size=5 class=inputSml />"; 
           o+="</div>";
        $("#input").append(o);
        $("#inputP"+id+"_0").keyup(function(e){challenge(id,"check");});
        imgTiles("clock");
        me.game.world.addChild(new textBox(226,(g.cfg.screen.height-36),304,32,g.data[id].hint,6,"#333333"),1500);
        me.game.world.addChild(new textBox(535,200,20,20,"one",6,"#000099"),1800);
        me.game.world.addChild(new textBox(605,170,20,20,"two",6,"#000099"),1800);
        me.game.world.addChild(new textBox(545,240,20,20,"five",6,"#000099"),1800);
        me.game.world.addChild(new textBox(615,277,20,20,"ten",6,"#000099"),1800);
        audioTrackPlay("4");
        $("#hint").hide(0);$("#hint").html(g.data[id].quote).show(750);
        $("#title").html(g.data[id].title);
        $("#inputP"+id+"_0").focus();
      }
      challenge(id,"check");
    }
    if(opt==="check"){
      url+="&a="+$("#inputP"+id+"_0").val();
      $.getJSON(url,function(d){if(d.status===true && g.data[(id+1)]===undefined){challengeInit((id+1));}});
    }
    if(opt==="worldtile"){
      var col="", t="", txt="";
      if(d.pos.x>=384 && d.pos.y>=192){
        t="flick", col="#000000";
        if(d.pos.x>=384 && d.pos.y>=320){col="#ff0000";}
        if(d.pos.x>=512 && d.pos.y>=256){col="#ffff00";}
      }
      return {"col":col,"type":t,"txt":txt};
    }
    if(opt==="audiotile" && g.data[(id+1)]===undefined){
      var col="", w=3, h=3;if(d.type==="b"){w=6,h=6,col="#"+g.cfg.seed.substr(parseInt(d[this.id]),6);}else{col="#ffffff";}
      return {"col":col,"h":h,"w":w};
    }
  }

  // CHALLENGE 7
  if(id===7){
    if(opt==="init"){
      if(g.data[id]===undefined && d!==undefined){
        $("#inputP"+(id-1)).hide(0);
        g.data[id]=new Object();
        g.data[id].str=d.text, g.data[id].hint=d.hint, g.data[id].blob=d.blob, g.data[id].quote=d.quote, g.data[id].title=d.title;
        var o="<div id=inputP"+id+" style='padding:5px;font-size:10px;text-align:right;'>";
             o+=g.data[id].str+"<br>";
             o+="<div id='inputP"+id+"_0' class=inputSlide><div id='inputP"+id+"_0a'></div><div id='inputP"+id+"_0txt'>250.50</div></div>";
             o+="<div id='inputP"+id+"_1' class=inputSlide><div id='inputP"+id+"_1a'></div><div id='inputP"+id+"_1txt'>250.50</div></div>";
             o+="<div id='inputP"+id+"_2' class=inputSlide><button id='inputP"+id+"_2a'>BEEP</button></div>";
         o+="</div>";
        $("#input").append(o);
        $("#inputP"+id+"_0a").slider({min:200.00,max:300.00,value:250.50,step:0.05,change:function(){
          var v=$("#inputP"+id+"_0a").slider("option","value");if(v.length<6){v=v+"0";}$("#inputP"+id+"_0txt").html(v);
        }});
        $("#inputP"+id+"_1a").slider({min:200.00,max:300.00,value:250.50,step:0.05,change:function(){
          var v=$("#inputP"+id+"_1a").slider("option","value");if(v.length<6){v=v+"0";}$("#inputP"+id+"_1txt").html(v);
        }});
        $("#inputP"+id+"_0").find(".ui-slider-handle").focus(function(){
          $(".inputSlide").css("border-color","#000");$("#inputP"+id+"_0").css("border-color","#fff");
        });
        $("#inputP"+id+"_1").find(".ui-slider-handle").focus(function(){
          $(".inputSlide").css("border-color","#000");$("#inputP"+id+"_1").css("border-color","#fff");
        });
        $("#inputP"+id+"_2a").click(function(a){          
          g.data[id].a0=new AudioContext(), g.data[id].o0=g.data[id].a0.createOscillator(), g.data[id].o0.type="sine";
          g.data[id].a1=new AudioContext(), g.data[id].o1=g.data[id].a1.createOscillator(), g.data[id].o1.type="sine";
          g.data[id].o0.frequency.value=$("#inputP"+id+"_0a").slider("option","value");
          g.data[id].o1.frequency.value=$("#inputP"+id+"_1a").slider("option","value");
          g.data[id].o0.connect(g.data[id].a0.destination);
          g.data[id].o1.connect(g.data[id].a1.destination);
          g.data[id].o0.start(0);g.data[id].o0.stop(1);
          g.data[id].o1.start(0);g.data[id].o1.stop(1);
          challenge(id,"check");
        });
        imgTiles("riot");
        me.game.world.addChild(new textBox(128,108,100,20,g.data[id].hint,8,"#55ff55"),1800);
        me.game.world.addChild(new textBox(128,108,100,20,g.data[id].blob,8,"#ff5555"),1800);
        audioTrackPlay("5");
        $("#hint").hide(0).html(g.data[id].quote).show(750);
        $("#title").html(g.data[id].title);
      }
    }
    if(opt==="check"){
      url+="&a="+$("#inputP"+id+"_0a").slider("option","value")+"&b="+$("#inputP"+id+"_1a").slider("option","value");
      $.getJSON(url,function(d){if(d.status===true && g.data[(id+1)]===undefined){challengeInit((id+1));}});
    }
    if(opt==="audiotile" && g.data[(id+1)]===undefined){
      var col="", w=3, h=3;if(d.type==="b"){col="#000000", w=2, h=10;}
      return {"col":col,"h":h,"w":w};
    }
  }

  // CHALLENGE 8
  if(id===8){
    if(opt==="init"){
      if(g.data[id]===undefined && d!==undefined){
        $("#inputP"+(id-1)).hide(0);
        g.data[id]=new Object(), g.data[id].str=d.text, g.data[id].hint=d.hint, g.data[id].quote=d.quote, g.data[id].title=d.title;
        g.data[id].flash=d.flash, g.data[id].seq=new Object(), g.data[id].timer=new Object();
        me.game.world.addChild(new flashTile("red",428,128,16,16),3000);
        me.game.world.addChild(new flashTile("blue",452,128,16,16),3000);
        me.game.world.addChild(new flashTile("green",476,128,16,16),3000);
        me.game.world.addChild(new flashTile("black",452,104,16,16),3000);
        me.game.world.addChild(new flashTile("white",452,152,16,16),3000);
        audioTrackPlay("6");
        imgTiles("flag");
        me.game.world.addChild(new textBox(128,290,100,20,g.data[id].str,8,"#005599"),1800);
        $("#hint").hide(0).html(g.data[id].quote).show(750);
        $("#title").html(g.data[id].title);
      }
      challenge(id,"check");
    }
    if(opt==="check"){
      if((g.video.paused || g.video.ended) || g.data[(id+1)]!==undefined){return true;}
      g.ctx.clearRect(0,0,g.cfg.screen.width,g.cfg.screen.height);
      g.ctx.drawImage(g.video,0,0);
      var d=g.ctx.getImageData(0,0,g.cfg.screen.width,g.cfg.screen.height);
      var s0=0;for(var i in d.data){s0+=d.data[i];}
      var s1=0;for(var i in g.webaudioData){s1=s1+parseInt(g.webaudioData[i]);}
      url+="&a="+s0+"&b="+s1+"&c="+me.input.pointer.pos.x+"&d="+me.input.pointer.pos.y;
      $.getJSON(url,function(d){if(d.status===true && g.data[(id+1)]===undefined){challengeInit((id+1));return true;}});
    }
    if(opt==="audiotile" && g.data[(id+1)]===undefined){
      if(d.type==="b"){w=4, h=20;}else{w=2, h=45;}
      return {"h":h,"w":w};
    }
  }

  // CHALLENGE 9
  if(id===9){
    if(opt==="init"){
      if(g.data[id]===undefined && d!==undefined){
        $("#inputP"+(id-1)).hide(0);
        g.data[id]=new Object(), g.data[id].str=d.text, g.data[id].hint=d.hint, g.data[id].quote=d.quote, g.data[id].title=d.title;
        var o="<div id=inputP"+id+" style='text-align:right;padding:5px;font-size:10px;'>"+g.data[id].str+" &nbsp; ";
             o+="<input id='inputP"+id+"_0' maxLength=4 size=4 class=inputSml />"; 
             o+="<input id='inputP"+id+"_1' maxLength=20 size=20 class=inputSml />"; 
           o+="</div>";
        $("#input").append(o);
        $("#inputP"+id+"_0").keyup(function(e){challenge(id,"check");});
        $("#inputP"+id+"_1").keyup(function(e){challenge(id,"check");});
        audioTrackPlay("7");
        $("#hint").hide(0).html(g.data[id].quote).show(750);
        $("#title").html(g.data[id].title);
      }
      challenge(id,"check");
    }
    if(opt==="check"){
      url+="&a="+$("#inputP"+id+"_0").val()+"&b="+$("#inputP"+id+"_1").val();
      $.getJSON(url,function(d){if(d.status===true && g.data[(id+1)]===undefined){challengeInit((id+1));}});
    }
  }

  // CHALLENGE 10
  if(id===10){
    if(opt==="init"){
      if(g.data[id]===undefined && d!==undefined){
        $("#inputP"+(id-1)).hide(0);
        g.data[id]=new Object(), g.data[id].str=d.text, g.data[id].hint=d.hint, g.data[id].quote=d.quote, g.data[id].title=d.title;
        var o="<div id=inputP"+id+" style='text-align:right;padding:5px;font-size:10px;'>"+g.data[id].str+" &nbsp; ";
             o+="<input id='inputP"+id+"_0' maxLength=4 size=4 class=inputSml />"; 
             o+="<input id='inputP"+id+"_1' maxLength=20 size=20 class=inputSml />"; 
           o+="</div>";
        $("#input").append(o);
        $("#inputP"+id+"_0").keyup(function(e){challenge(id,"check");});
        $("#inputP"+id+"_1").keyup(function(e){challenge(id,"check");});
        audioTrackPlay("8");
        $("#hint").hide(0).html(g.data[id].quote).show(750);
        $("#title").html(g.data[id].title);
      }
      challenge(id,"check");
    }
    if(opt==="check"){
      url+="&a="+$("#inputP"+id+"_0").val()+"&b="+$("#inputP"+id+"_0").val();
      $.getJSON(url,function(d){if(d.status===true && g.data[(id+1)]===undefined){challengeInit((id+1));}});
    }
  }
  return true;
}

// WORLD FUNCTIONS
// WORLD INIT
function worldInit(){
  var s=g.cfg.seed.split(""), x=0, xM=g.cfg.screen.width, y=0, yM=g.cfg.screen.height, ts=g.cfg.screen.tile;
  while(y<yM){
    var x=0;
    while(x<xM){
      if(x===0 || y===0 || x>=(xM-ts) || y>=(yM-ts)){
        me.game.world.addChild(new worldTile("wall",x,y,ts,ts),5000);
      }else{
        me.game.world.addChild(new worldTile("video",x,y,ts,ts),100);
      }
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
    this.font=new me.Font("Verdana","16px","#ffffff","center");this.font.z=150;
  },
  update:function(dt){this._super(me.Entity,"update",[dt]);return true;},
  oncollision:function(r,o){if(this.id==="wall"){return true;}if(this.id==="video"){return false;}return false;},
  draw:function(c){
    if(this.id==="wall" || g.data[1]===undefined){c.setColor("#000000");c.fillRect(0,0,this.width,this.height);}
    else{
      if(g.video===undefined){return;}
      var t="flip", col, txt="", txtCol="", txtSize=16;
      if(g.data[1]!==undefined){
        var r=challenge(1,"worldtile",this.pos);
        if(r.col!==""){col=r.col;}if(r.type!==""){t=r.type}if(r.txt!==""){txt=r.txt;}
      }
      if(g.data[2]!==undefined){
        var r=challenge(2,"worldtile",this);
        if(r.col!==""){col=r.col;}if(r.type!==""){t=r.type}if(r.txt!==""){txt=r.txt;}
        if(r.txtSize>0){txtSize=r.txtSize;txtCol=r.txtCol;}
      }
      if(g.data[6]!==undefined){
        var r=challenge(6,"worldtile",this);
        if(r.col!==""){col=r.col;}if(r.type!==""){t=r.type}if(r.txt!==""){txt=r.txt;}
      }

      var s=this.timer.toString().substr(10,3), n=new Date().getTime(), st=parseInt(s)*10, tt=this.timer+st;
      if(t!=="tile" && tt>=n){t="norm";txt="";}
      if(t!=="norm" && t!=="tile"){this.timer=new Date().getTime();}

      this.z=100;
      if(t==="norm"){     c.drawImage(g.video,this.pos.x,this.pos.y,this.width,this.height,0,0,this.width,this.height);}
      else if(t==="flip"){c.drawImage(g.video,this.pos.y,this.pos.x,this.width,this.height,0,0,this.width,this.height);}
      else if(t==="tile" || t==="flick"){this.z=700;c.setColor(col);c.fillRect(0,0,this.width,this.height);}
      if(txt.length>0){
        if(txtCol===""){txtCol="#ffffff";}
        this.font=new me.Font("Arial",txtSize+"px",txtCol,"center");this.font.z=this.z+50;
        this.font.draw(c,txt,32,24);
      }

    }
    return this._super(me.Entity,"draw",c);
  }
});


// AUDIO TILE FUNCTIONS
// AUDIO TILES
function audioTiles(){
  for(var i in g.webaudioData){
    var x=640-parseInt(i*4), y=parseInt(g.cfg.screen.width/4.9)+parseInt(g.webaudioData[i]);
    me.game.world.addChild(new audioTile("a",i,x,y,4,4),1900);
  }
  for(var i in g.audioData){
    var x=64+parseInt(i*4), y=parseInt(g.cfg.screen.width/4.9)+parseInt(g.audioData[i]);
    me.game.world.addChild(new audioTile("b",i,x,y,3,3),2000);
  }
}

// AUDIO TILE
var audioTile=me.Entity.extend({
  init:function(t,id,x,y,w,h){
    this._super(me.Entity,"init",[x,y,{width:w,height:h,id:id}]);
    this.collisionType=me.collision.types.PLAYER_OBJECT;this.type=t;this.body.gravity=0;this.z=1000;
  },
  update:function(dt){
    if(this.type==="a"){var d=g.webaudioData;}else{var d=g.audioData;}
    this.pos.y=parseInt(g.cfg.screen.width/4.9)+parseInt(d[this.id]);
    this.body.update(dt);this._super(me.Entity,"update",[dt]);return true;
  },
  oncollision:function(r,o){return false;},
  draw:function(c){
    if(g.data[3]===undefined){return;}
    if(this.type==="a"){var d=g.webaudioData, ts=4;}else{var d=g.audioData, ts=3;}
    var col="#"+g.cfg.seed.substr(parseInt(d[this.id]),6), w=ts, h=ts;
    if(g.data[3]!==undefined){var r=challenge(3,"audiotile",this);if(r.h>0){h=r.h;}}
    if(g.data[4]!==undefined){var r=challenge(4,"audiotile",this);if(r.col!==""){col=r.col, h=r.h;}}
    if(g.data[5]!==undefined){var r=challenge(5,"audiotile",this);if(r.col!==""){col=r.col, h=r.h, w=r.w;}}
    if(g.data[6]!==undefined){var r=challenge(6,"audiotile",this);if(r.col!==""){col=r.col, h=r.h, w=r.w;}}
    if(g.data[7]!==undefined){var r=challenge(7,"audiotile",this);if(r.col!==""){col=r.col, h=r.h, w=r.w;}}
    if(g.data[8]!==undefined){var r=challenge(8,"audiotile",this);if(r.h>0){h=r.h, w=r.w;}}
    this.width=w, this.height=h;
    c.setColor(col);c.fillRect(0,0,this.width,this.height);
  }
});


// IMG TILE FUNCTIONS
// IMG TILES
function imgTiles(id){
  z=500;
  if(id==="sym"){  var x=270, y=180, w=64, h=64, z=550;}
  if(id==="flag"){ var x=352, y=170, w=64, h=64, z=550;}
  if(id==="clock"){var x=parseInt((g.cfg.screen.width/2)-300), y=parseInt((g.cfg.screen.height/2)-(128+(128/2))), w=128, h=128;}
  if(id==="hand"){ var x=400, y=100, w=64, h=64;}
  if(id==="riot"){ var x=80, y=240, w=64, h=64, z=150;}
  me.game.world.addChild(new imgTile(id,x,y,w,h),z);
}

// IMG TILE
var imgTile=me.Entity.extend({
  init:function(id,x,y,w,h,ani){
    this._super(me.Entity,"init",[x,y,{width:w,height:h,id:id}]);
    this.collisionType=me.collision.types.NONE;
    this.body.gravity=0;
    if(id==="sym"){
      this.renderable=g.gfx.sym.createAnimationFromName([0,1,2,3,4,5,6,7]);
      this.renderable.addAnimation("shift",[5,0,1,2,3,6,4,7],450);
      this.renderable.setCurrentAnimation("shift");
    }
    if(id==="flag"){
      this.renderable=g.gfx.flag.createAnimationFromName([0,1,2,3,4]);
      this.renderable.addAnimation("shift",[0,1,2,3,4],450);
      this.renderable.setCurrentAnimation("shift");
    }
    if(id==="clock"){
      this.renderable=g.gfx.clock.createAnimationFromName([0,1,2,3]);
      this.renderable.addAnimation("shift",[0,1,2,3],600);
      this.renderable.setCurrentAnimation("shift");
    }
    if(id==="riot"){
      this.renderable=g.gfx.riot.createAnimationFromName([0]);
      this.renderable.addAnimation("shift",[0],450);
      this.renderable.setCurrentAnimation("shift");
    }
    if(id==="hand"){
      this.renderable=g.gfx.hand.createAnimationFromName([0]);
      this.renderable.addAnimation("shift",[0],450);
      this.renderable.setCurrentAnimation("shift");
    }
  },
  update:function(dt){this.body.update(dt);this._super(me.Entity,"update",[dt]);return true;},
  oncollision:function(r,o){return false;},
});

// FLASH TILE
var flashTile=me.Entity.extend({
  init:function(id,x,y,w,h){
    this._super(me.Entity,"init",[x,y,{width:w,height:h,id:id}]);this.collisionType=me.collision.types.NONE;this.body.gravity=0;
    if(this.id==="red"){  g.data[8].seq.red=0;  g.data[8].timer.red=new Date().getTime()+500;}
    if(this.id==="blue"){ g.data[8].seq.blue=0; g.data[8].timer.blue=new Date().getTime()+500;}
    if(this.id==="green"){g.data[8].seq.green=0;g.data[8].timer.green=new Date().getTime()+500;}
    if(this.id==="black"){g.data[8].seq.black=0;g.data[8].timer.black=new Date().getTime()+500;}
    if(this.id==="white"){g.data[8].seq.white=0;g.data[8].timer.white=new Date().getTime()+500;}
  },
  update:function(dt){this.body.update(dt);this._super(me.Entity,"update",[dt]);return true;},
  draw:function(c){
    if(g.data[8]!==undefined){
      var flash, col="#ffffff", t=0, del=750;
      if(this.id==="red"){
        col="#ff0000";flash=g.data[8].flash.red[g.data[8].seq.red];t=g.data[8].timer.red-250;
        if((new Date().getTime())>=g.data[8].timer.red){
          g.data[8].seq.red++;if(g.data[8].seq.red>=g.data[8].flash.red.length){g.data[8].seq.red=0;}
          g.data[8].timer.red=new Date().getTime()+del;
        }
      }
      if(this.id==="blue"){
        col="#0000ff";flash=g.data[8].flash.blue[g.data[8].seq.blue];t=g.data[8].timer.blue-250;
        if((new Date().getTime())>=g.data[8].timer.blue){
          g.data[8].seq.blue++;if(g.data[8].seq.blue>=g.data[8].flash.blue.length){g.data[8].seq.blue=0;}
          g.data[8].timer.blue=new Date().getTime()+del;
        }
      }
      if(this.id==="green"){
        col="#00ff00";flash=g.data[8].flash.green[g.data[8].seq.green];t=g.data[8].timer.green-250;
        if((new Date().getTime())>=g.data[8].timer.green){
          g.data[8].seq.green++;if(g.data[8].seq.green>=g.data[8].flash.green.length){g.data[8].seq.green=0;}
          g.data[8].timer.green=new Date().getTime()+del;
        }
      }
      if(this.id==="black"){
        col="#000000";flash=g.data[8].flash.black[g.data[8].seq.black];t=g.data[8].timer.black-250;
        if((new Date().getTime())>=g.data[8].timer.black){
          g.data[8].seq.black++;if(g.data[8].seq.black>=g.data[8].flash.black.length){g.data[8].seq.black=0;}
          g.data[8].timer.black=new Date().getTime()+del;
        }
      }
      if(this.id==="white"){
        col="#ffffff";flash=g.data[8].flash.white[g.data[8].seq.white];t=g.data[8].timer.white-250;
        if((new Date().getTime())>=g.data[8].timer.white){
          g.data[8].seq.white++;if(g.data[8].seq.white>=g.data[8].flash.white.length){g.data[8].seq.white=0;}
          g.data[8].timer.white=new Date().getTime()+del;
        }
      }
      if(t>=(new Date().getTime())){
        this.font=new me.Font("Ariel","12pt",col,"left");
        if(parseInt(flash)===0){this.text="0";}
        if(parseInt(flash)===1){this.text="1";}
        if(parseInt(flash)===2){this.text="2";}
        this.font.draw(c,this.text,0,0);
      }
    }
  },
  oncollision:function(r,o){return false;},
});
