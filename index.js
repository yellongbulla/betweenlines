var g=new Object();
g.debug=false;
g.seed="";

var express=require('express');
var bodyParser=require('body-parser');
var qrand=require('qrand');
var app=express();
app.use(bodyParser.json());
app.use(express.static('client'));
seedUpdate();
g.timer=setInterval(seedUpdate,((3600)*1000));
app.listen(3000,()=>{console.log("Listening on port 3000");});

// SEED FUNCTIONS
function seedDebug(){var s="1234567890";g.seed="";for(var i=0;i<64;i++){g.seed+=s;}}
function seedUpdate(){
  console.log("SEED UPDATE");
  if(g.debug!==true){
    qrand.getRandomHexOctets(1024,function(e,d){
      console.log(" - QUANTUM");
      if(e===null){var r="";for(var i in d){if(!isNaN(d[i])){r+=d[i];}}g.seed=r.substr(0,640);}else{console.log("ERROR: "+e);}
    });
  }else{seedDebug();console.log(" - DEBUG");}
}

// RANDOM SEED
app.get('/qrand',function(req,res){
  if(g.seed.length===0){return;}
  else{var o=new Object();o.random=g.seed;res.status(200);res.send(o);}
});

// CHALLENGES
app.get('/challenge',function(req,res){
  var r=new Object(), seed=req.query.seed, id=parseInt(req.query.id), type=req.query.type;
  console.log("PUZZLE: "+type+" - "+id);
  r.status=false;

  // PUZZLE 0
  if(id===0){
    if(type==="init"){
      r.title="Oh, what a day! What a lovely day!";
      r.quote="If you make people think they're thinking, they'll love you;<br><br>";
      r.quote+="... but if you really make them think, they'll hate you.<br>";
      r.status=true;
    }
  }

  // PUZZLE 1
  if(id===1){
    if(type==="init"){
      var c0=seedColor(seed,"r"), c1=seedColor(seed,"b"), c2=seedColor(seed,"g");
      r.r=c0, r.b=c1, r.g=c2;
      r.title="A flight not only from point A to point B...";
      var o="There is nothing wrong with your television set.<br>";
         o+="Do not attempt to adjust the picture.<br>";
         o+="We are controlling transmission.<br>";
         o+="If we wish to make it louder, we will bring up the volume.<br>";
         o+="If we wish to make it softer, we will tune it to a whisper.<br>";
         o+="<div style='width:75%;text-align:center;'>x</div>";
         o+="We will control the horizontal. We will control the vertical.<br>";
         o+="We can roll the image, make it flutter.<br>";
         o+="We can change the focus to a soft blur or sharpen it to crystal clarity.<br>";
         o+="We can shape your vision to anything our imagination can conceive.<br>";
         o+="Sit quietly and we will control all that you see and hear.<br>";
      r.quote=o;
      r.status=true;
    }else if(type==="chk"){
      var c0=seedColor(seed,"b"), c1=seedColor(seed,"g"), c2=seedColor(seed,"r");
      var t0="#4444"+req.query.a, t1="#44"+req.query.b+"44", t2="#"+req.query.c+"4444";
      if(c0===t0){r.b=true;}
      if(c1===t1){r.g=true;}
      if(c2===t2){r.r=true;}
      if(c0===t0 && c1===t1 && c2===t2){r.status=true;}
    }
  }

  // PUZZLE 2
  if(id===2){
    if(type==="init"){
      var o="A day will come when sacred Troy shall perish;<br><br>... and Priam and his people shall be slain.<br>";
      r.quote=o;
      r.title="What if one day those in the depths rise up against you?";
      r.status=true;
    }
    if(type==="chk"){
      var a=req.query.a, b=req.query.b, c=req.query.c;
      var seed=req.query.seed;
      var c0=seedColor(seed,"b").substr(5,2);
      var c1=seedColor(seed,"g").substr(3,2);
      var c2=seedColor(seed,"r").substr(1,2);
      if(seedColor2Grid(c0,req.query.a)===true){r.a=true;}
      if(seedColor2Grid(c1,req.query.b)===true){r.b=true;}
      if(seedColor2Grid(c2,req.query.c)===true){r.c=true;}
      if(seedColor2Grid(c0,req.query.a)===true && seedColor2Grid(c1,req.query.b)===true && seedColor2Grid(c2,req.query.c)===true){
        r.status=true;
      }
    }
  }

  // PUZZLE 3
  if(id===3){
    if(type==="init"){
      r.title="Listen, kid, we're all in this together.";
      var o="As different as we have been taught to look at each other by colonial society, we are in the same struggle ";
         o+="and until we realize that, we'll be fighting for scraps from the table of a system that has kept us ";
         o+="subservient instead of being self-determined.";
      r.quote=o;
      var c0=seedColor(seed,"b").substr(5,2), c1=seedColor(seed,"g").substr(3,2), c2=seedColor(seed,"r").substr(1,2);
      var k0=seedKey(seedColor2GridKey(c0)), k1=seedKey(seedColor2GridKey(c1)), k2=seedKey(seedColor2GridKey(c2));
      var key=2+3+3+1;
      var msg="thumb over camera left mouse where t should be";
      var msgE=stringToShift(msg,[k0,k1,k2],key);
      r.text="... thank you.<br><br>"+msgE;
      r.hint="cargo number sequence. caesar shift alpha. loop key function(lp){return ((csa+key[lp])+cns)}";
      r.status=true;
    }
    if(type==="chk"){
      if(parseInt(req.query.a)<=80000000){
        if(parseInt(req.query.b)>(64*3) && parseInt(req.query.b)<(64*5)){
          if(parseInt(req.query.c)>(64*3) && parseInt(req.query.c)<(64*5)){r.status=true;}
        }
      }
    }
  }

  // PUZZLE 4
  if(id===4){
    if(type==="init"){
      r.title="It's not your story. It's my story...";
      var o="Life itself has no rules. That is its mystery and its unknown law. ";
         o+="What you call knowledge is an attempt to impose something comprehensible on life.<br>";
      r.quote=o;
      var c0=seedColor(seed,"b").substr(5,2), c1=seedColor(seed,"g").substr(3,2), c2=seedColor(seed,"r").substr(1,2);
      var k0=seedKey(seedColor2GridKey(c0)), k1=seedKey(seedColor2GridKey(c1)), k2=seedKey(seedColor2GridKey(c2));
      var key=2+3+3+1;
      var msg="listen quiet abstract left mouse same spot";
      var msgE=stringToShift(msg,[k0,k1,k2],key);
      r.text="... but are you paying attention?<br><br>"+msgE;
      r.status=true;
    }
    if(type==="chk"){
      if(req.query.a==="0"){
        if(parseInt(req.query.b)>(64*3) && parseInt(req.query.b)<(64*5)){
          if(parseInt(req.query.c)>(64*3) && parseInt(req.query.c)<(64*5)){r.status=true;}
        }
      }
    }
  }

  // PUZZLE 5
  if(id===5){
    if(type==="init"){
      r.title="Call 348-844 immediately.";
      var o="What was your name?<br>";
         o+="... and why don’t you now know what your name was then?<br><br>";
         o+="Where did it go? Where did you lose it? Who took it?<br>";
         o+="... and how did he take it?<br><br>";
         o+="What tongue did you speak?<br>";
         o+="How did the man take your tongue?<br><br>";
         o+="Where is your history?<br>";
         o+="How did the man wipe out your history?";
      r.quote=o;
      r.text="Initial clue. Symbol animation. Second clue. Negate doubles on ends, second in doubles.<br>";
      r.status=true;
    }
    if(type==="chk" && req.query.a==="RACIST"){r.status=true;}
  }

  // PUZZLE 6
  if(id===6){
    if(type==="init"){
      r.title="This is my ship, the Nebuchadnezzar.";
      var o="It is 'society' which provides man with food, clothing, a home, the tools of work, language, the forms of thought, ";
         o+="and most of the content of thought; his life is made possible through the labor and the accomplishments of the many millions ";
         o+="past and present who are all hidden behind the small word 'society.'<br>";
      r.quote=o;
      r.hint="arcmin";
      var str="verifiability";str=str.split(""), bit=new Array(), but="";
      for(var i=0;i<str.length;i++){bit[i]=charTextToDigit(str[i]);}
      for(var i=0;i<bit.length;i++){but+=convertBase(bit[i].toString(),10,60)+", ";}
      r.text="Wikipedia:"+but+", not ";
      r.status=true;
    }
    if(type==="chk" && req.query.a==="truth"){r.status=true;}
  }

  // PUZZLE 7
  if(id===7){
    if(type==="init"){
      r.title="One of these days I'm gonna get organized.";
      var o="Dr. King's policy was that nonviolence would achieve the gains for black people in the United States. ";
         o+="His major assumption was that if you are nonviolent, ";
         o+="if you suffer, your opponent will see your suffering and will be moved to change his heart. ";
         o+="That's very good. He only made one fallacious assumption: ";
         o+="In order for nonviolence to work, your opponent must have a conscience.";
      r.quote=o;
      r.hint="est-il temps de faire l'ancien régime? Saros YDH";
      r.blob="Options have been violently constrained. See 224";
      r.text="Binary existence… I can show you that one plus one equals three.<br>";
      r.text+="function(){return (Y+D+H)-(cargoSequence)/humanSpeciesEnemyFor;}";
      r.status=true;
    }
    if(type==="chk"){
      var a=parseFloat(req.query.a), b=parseFloat(req.query.b);
      if((a-b)===34.75 || (b-a)===34.75){r.status=true;}
    }
  }

  // PUZZLE 8
  if(id===8){
    if(type==="init"){
      r.title="Don't be resigned to that. Break out!";
      var o="It is a historical fact that blacks were brought to this country ";
         o+="for the profit of the ruling class which at the time were landowners. ";
         o+="They needed someone to till the soil and grow profitable crops. ";
         o+="Today we have shifted from an agrarian economy to a goods-production economy. ";
         o+="But the same relationships exist between the private owner and the worker. Nothing has changed. ";
         o+="Therefore, for working people to be free, they must seize control of the means of production.";
      r.quote=o;
      r.hint="Support every revolutionary movement against the existing social and political order of things.";
      r.text="i: title 2nd word. ii: author is of. iii: author m is to r. iv: sequence each.";
      r.hint0="       i. Join us in making the revolution a game;";
      r.hint1="    ii. Majorities too may err and destroy our civilization.";
      r.hint2="iii. not planting new seeds but expecting flowers from dying weeds.";
      r.status=true;
    }
    if(type==="chk"){
      if(req.query.a==="98" && req.query.b==="62" && req.query.c==="9"){r.status=true;}
    }
  }

  // PUZZLE 9
  if(id===9){
    if(type==="init"){
      r.title="There is nothing in the desert, and no man needs nothing.";
      r.quote="Our posturings, our imagined self-importance, ";
     r.quote+="the delusion that we have some privileged position in the universe, are challenged by this point of pale light.";
      var t0="carpe diem";
      var t1="sequence r4g g4w";
      var t2="mic up";
      var t3="thiscolor out camera left mouse here";
      var t4="shouts into the dark counting the seconds until a voice returns from";
      var s0=morseSeq(t0);
      var s1=morseSeq(t1);
      var s4=morseSeq(t4);
      // TURN T0 INTO KEY FOR T2
      var seq0=t0.split(""), k0=0;
      for(var i=0;i<seq0.length;i++){k0=k0+charTextToDigit(seq0[i]);}
      // TURN T2 INTO KEY FOR T3
      var seq2=t2.split(""), k2=0;
      for(var i=0;i<seq2.length;i++){k2=k2+charTextToDigit(seq2[i]);}
      // SHIFT T2 USING KEY0 INTO CAESAR DIGITS
      var s2=t2.split(""), c2="";
      for(var i=0;i<s2.length;i++){c2+=charTextToDigit(s2[i])+k0;}
      var s2=morseSeq(c2);
      // SHIFT T3 USING KEY2 INTO CAESAR DIGITS
      var s3=t3.split(""), c3="";
      for(var i=0;i<s3.length;i++){c3+=charTextToDigit(s3[i])+k2;}
      var s3=morseSeq(c3);
      r.flash=new Object();
      r.flash.red=new Array();  var s0=s0.split("");for(var i=0;i<s0.length;i++){r.flash.red[i]=s0[i];}
      r.flash.blue=new Array(); var s1=s1.split("");for(var i=0;i<s1.length;i++){r.flash.blue[i]=s1[i];}
      r.flash.green=new Array();var s2=s2.split("");for(var i=0;i<s2.length;i++){r.flash.green[i]=s2[i];}
      r.flash.black=new Array();var s3=s3.split("");for(var i=0;i<s3.length;i++){r.flash.black[i]=s3[i];}
      r.flash.white=new Array();var s4=s4.split("");for(var i=0;i<s4.length;i++){r.flash.white[i]=s4[i];}
      r.status=true;
    }
    if(type==="chk"){
      if(parseInt(req.query.a)>=22000000 && parseInt(req.query.b)>=512){
        if(parseInt(req.query.c)>=452 && parseInt(req.query.c)<=468){
          if(parseInt(req.query.d)>=140 && parseInt(req.query.d)<=160){r.status=true;}
        }
      }
    }
  }

  // PUZZLE 10
  if(id===10){
    if(type==="init"){
      r.title="Reports incredible as they may seem are not the results of mass hysteria.";
      r.quote="You can keep your gold. We just want our land back.";
       r.text="";
      r.status=true;
    }
    if(type==="chk"){
      if(req.query.a==="fuck" && req.query.b==="classical liberalism"){r.status=true;}
    }
  }

  res.status(200);res.json(r);
});


// SEED FUNCTIONS
// CREATE MORSE CODE SEQUENCE
function morseSeq(t){
  var bits=t.split(""), o="21212";
  for(var i=0;i<bits.length;i++){
    var b=bits[i], s="";
    if(b==="k"){b="c";}
    if(b===" "){s="12121";}
    if(b==="a"){s="12000";}
    if(b==="b"){s="21110";}
    if(b==="c"){s="21210";}
    if(b==="d"){s="21100";}
    if(b==="e"){s="10000";}
    if(b==="f"){s="11210";}
    if(b==="g"){s="22100";}
    if(b==="h"){s="11110";}
    if(b==="i"){s="11000";}
    if(b==="j"){s="12220";}
    if(b==="l"){s="12110";}
    if(b==="m"){s="22000";}
    if(b==="n"){s="21000";}
    if(b==="o"){s="22200";}
    if(b==="p"){s="12210";}
    if(b==="q"){s="22120";}
    if(b==="r"){s="12100";}
    if(b==="s"){s="11100";}
    if(b==="t"){s="20000";}
    if(b==="u"){s="11200";}
    if(b==="v"){s="11120";}
    if(b==="w"){s="12200";}
    if(b==="x"){s="21120";}
    if(b==="y"){s="21220";}
    if(b==="z"){s="22110";}
    if(b==="0"){s="22222";}
    if(b==="1"){s="12222";}
    if(b==="2"){s="11222";}
    if(b==="3"){s="11122";}
    if(b==="4"){s="11112";}
    if(b==="5"){s="11111";}
    if(b==="6"){s="21111";}
    if(b==="7"){s="22111";}
    if(b==="8"){s="22211";}
    if(b==="9"){s="22221";}
    o+=s;
  }
  o+="111212";
  return o;
}

// CONVERT BASE NUMBERING
function convertBase(value, from_base, to_base) {
  var range = '0123456789abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ+/'.split('');
  var from_range = range.slice(0, from_base);
  var to_range = range.slice(0, to_base);
  
  var dec_value = value.split('').reverse().reduce(function (carry, digit, index) {
    if (from_range.indexOf(digit) === -1) throw new Error('Invalid digit `'+digit+'` for base '+from_base+'.');
    return carry += from_range.indexOf(digit) * (Math.pow(from_base, index));
  }, 0);
  
  var new_value = '';
  while (dec_value > 0) {
    new_value = to_range[dec_value % to_base] + new_value;
    dec_value = (dec_value - (dec_value % to_base)) / to_base;
  }
  return new_value || '0';
}

function charTextToDigit(t){
  var v=0;
  if(t==="k"){t="c";}
  if(t===" "){v=" ";}
  if(t==="a"){v=1;}
  if(t==="b"){v=2;}
  if(t==="c"){v=3;}
  if(t==="d"){v=4;}
  if(t==="e"){v=5;}
  if(t==="f"){v=6;}
  if(t==="g"){v=7;}
  if(t==="h"){v=8;}
  if(t==="i"){v=9;}
  if(t==="j"){v=10;}
  if(t==="l"){v=11;}
  if(t==="m"){v=12;}
  if(t==="n"){v=13;}
  if(t==="o"){v=14;}
  if(t==="p"){v=15;}
  if(t==="q"){v=16;}
  if(t==="r"){v=17;}
  if(t==="s"){v=18;}
  if(t==="t"){v=19;}
  if(t==="u"){v=20;}
  if(t==="v"){v=21;}
  if(t==="w"){v=22;}
  if(t==="x"){v=23;}
  if(t==="y"){v=24;}
  if(t==="z"){v=25;}
  return v;
}

function stringToShift(txt,keys,salt){
  var o="", t=txt.split(""), k=0;
  for(var m in t){
    var d=charTextToDigit(t[m]);
    if(d===" "){var d="-";}
    else{
      if(k>(keys.length-1)){k=0;}
      var d=d+keys[k]+salt;
    }
    o+=d+", ";
    k++;
  }
  var o=o.substr(0,(o.length-2));
  return o;
}

function seedKey(t){
  var k=t.split(""), r=0;
  for(var i in k){
    if(k[i]==="k"){k[i]="c";}
    if(k[i]==="a"){r=r+1;}
    if(k[i]==="b"){r=r+2;}
    if(k[i]==="c"){r=r+3;}
    if(k[i]==="d"){r=r+4;}
    if(k[i]==="e"){r=r+5;}
    if(k[i]==="f"){r=r+6;}
    if(k[i]==="g"){r=r+7;}
    if(k[i]==="h"){r=r+8;}
    if(k[i]==="i"){r=r+9;}
    if(k[i]==="j"){r=r+10;}
    if(k[i]==="l"){r=r+11;}
    if(k[i]==="m"){r=r+12;}
    if(k[i]==="n"){r=r+13;}
    if(k[i]==="o"){r=r+14;}
    if(k[i]==="p"){r=r+15;}
    if(k[i]==="q"){r=r+16;}
    if(k[i]==="r"){r=r+17;}
    if(k[i]==="s"){r=r+18;}
    if(k[i]==="t"){r=r+19;}
    if(k[i]==="u"){r=r+20;}
    if(k[i]==="v"){r=r+21;}
    if(k[i]==="w"){r=r+22;}
    if(k[i]==="x"){r=r+23;}
    if(k[i]==="y"){r=r+24;}
    if(k[i]==="z"){r=r+25;}
  }
  if(r===0){r=t;}
  return r;
}

function seedColor(s,t){
  var s=s.split(""), c=0, o=0;
  if(t==="r"){co=10;}if(t==="b"){co=25;}if(t==="g"){co=40;}
  for(var i in s){var b=parseInt(s[i]);if(b>0 && c>=co){o=parseInt(co*b);}c++;}
  var c=0, r="";
  for(var i in s){
    if(c>=o){
      if(r.length===2){break;}
      var b=parseInt(s[i]), bo=parseInt(o/b);
      if(b>0){r+=""+b+"";}
    }
    c++;
  }
  if(t==="r"){return "#"+r+"4444";}
  if(t==="b"){return "#4444"+r;}
  if(t==="g"){return "#44"+r+"44";}
  return false;
}

function seedColor2Grid(t,i){
  if(t===undefined){return false;}
  if(seedColor2GridKey(t)===i){return true;}
  return false;
}

function seedColor2GridKey(t){
  if(t===undefined){return false;}
  var ta=parseInt(t.substr(0,1)), tb=parseInt(t.substr(1,1));
  if(ta>5){ta=parseInt(ta/2);if(ta<1){ta=1;}}
  if(tb>5){tb=parseInt(tb/2);}if(tb<1){tb=1;}
  if(ta===1){
    if(tb===1){return "a";}
    if(tb===2){return "b";}
    if(tb===3){return "c";}
    if(tb===4){return "d";}
    if(tb===5){return "e";}
  }
  if(ta===2){
    if(tb===1){return "f";}
    if(tb===2){return "g";}
    if(tb===3){return "h";}
    if(tb===4){return "i";}
    if(tb===5){return "j";}
  }
  if(ta===3){
    if(tb===1){return "l";}
    if(tb===2){return "m";}
    if(tb===3){return "n";}
    if(tb===4){return "o";}
    if(tb===5){return "p";}
  }
  if(ta===4){
    if(tb===1){return "q";}
    if(tb===2){return "r";}
    if(tb===3){return "s";}
    if(tb===4){return "t";}
    if(tb===5){return "u";}
  }
  if(ta===5){
    if(tb===1){return "v";}
    if(tb===2){return "w";}
    if(tb===3){return "x";}
    if(tb===4){return "y";}
    if(tb===5){return "z";}
  }
  return false;
}
