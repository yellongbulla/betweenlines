var express=require('express');
var bodyParser=require('body-parser');
var qrand=require('qrand');
var app=express();
app.use(bodyParser.json());

// QUANTUM RANDOM NUMBER
app.get('/qrand',function(req,res){
  console.log("QRAND");
  //qrand.getRandomHexOctets(1024,function(e,d){
  //  if(e===null){var r="";for(var i in d){if(!isNaN(d[i])){r+=d[i];}}var o=new Object();o.random=r.substr(0,640);res.status(200);res.send(o);}
  //  else{console.log("ERROR: "+e);}
  //});
  var o=new Object();
  o.random="2096827251420928680054318987926956223138726545634937920181698833889499802476532641168412233816360468779143542240513597674505868584773084429337881240286149891157885566032714059864588858262688353565079256163190715942732275370047999016343208737480529218175537139114378759734353550082084475386380426257017253536021641753270960180100234640018696258676439493277276581267261392097598494800588634277198805343264372687876241275983920249573259700339445687334515972101040132593555607874331027999584001970774957452666015885092766983448879618448830064517057350305808976423342617690336682942285805368169505756968556853381251524290501127140672335184155736";
  res.status(200);res.send(o);
});

// CHALLENGES
app.get('/challenge',function(req,res){
  var r=new Object();
  r.status=false;
  var seed=req.query.seed, id=parseInt(req.query.id), type=req.query.type;
  console.log("PUZZLE: "+type+" - "+id);

  // PUZZLE 0
  if(id===0){
    if(type==="init"){
      var o="If you make people think they're thinking, they'll love you;<br><br>";
         o+="... but if you really make them think, they'll hate you.<br>";
      r.quote=o;
      r.status=true;
    }
  }

  // PUZZLE 1
  if(id===1){
    if(type==="init"){
      var c0=seedColor(seed,"r"), c1=seedColor(seed,"b"), c2=seedColor(seed,"g");
      r.r=c0, r.b=c1, r.g=c2;
      var o="There is nothing wrong with your television set.<br>";
         o+="Do not attempt to adjust the picture.<br>";
         o+="We are controlling transmission.<br>";
         o+="If we wish to make it louder, we will bring up the volume.<br>";
         o+="If we wish to make it softer, we will tune it to a whisper.<br>";
         o+="<div style='width:50%;text-align:center;'>x</div>";
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
      var o="As different as we have been taught to look at each other by colonial society, we are in the same struggle ";
         o+="and until we realize that, we'll be fighting for scraps from the table of a system that has kept us ";
         o+="subservient instead of being self-determined.";
      r.quote=o;
      var c0=seedColor(seed,"b").substr(5,2), c1=seedColor(seed,"g").substr(3,2), c2=seedColor(seed,"r").substr(1,2);
      var k0=seedKey(seedColor2GridKey(c0)), k1=seedKey(seedColor2GridKey(c1)), k2=seedKey(seedColor2GridKey(c2));
      var key=2+3+3+1;
      var msg="thumb over camera click where t should be";
      var msgS="", msgA=msg.split(""), ks=0;
      for(var m in msgA){
        if(ks>2){ks=0;}
        if(ks===0){var salt=k0;}
        if(ks===1){var salt=k1;}
        if(ks===2){var salt=k2;}
        var mv=charTextToDigit(msgA[m]);
        var mv=mv+key;
        var mv=mv+salt;
        msgS+=mv+", ";
        ks++;
      }
      msgS=msgS.substr(0,(msgS.length-2));
      r.text="... thank you.<br><br>"+msgS;
      r.hint="cargo number sequence. caesar shift alpha. loop key function(lp){return ((csa+key[lp])+cns)}";
      r.status=true;
    }
    if(type==="chk"){
      // min:1475000 - max:16000000
      if(parseInt(req.query.a)<=16000000){
        if(parseInt(req.query.b)>256 && parseInt(req.query.b)<320){
          if(parseInt(req.query.c)>256 && parseInt(req.query.c)<320){r.status=true;}
        }
      }
    }
  }

  if(id===4){
    if(type==="init"){
      var o="Life itself has no rules. That is its mystery and its unknown law. ";
         o+="What you call knowledge is an attempt to impose something comprehensible on life.<br>";
      r.quote=o;
      var c0=seedColor(seed,"b").substr(5,2), c1=seedColor(seed,"g").substr(3,2), c2=seedColor(seed,"r").substr(1,2);
      var k0=seedKey(seedColor2GridKey(c0)), k1=seedKey(seedColor2GridKey(c1)), k2=seedKey(seedColor2GridKey(c2));
      var key=2+3+3+1;
      var msg="listen quiet abstract click same spot";
      var msgS="", msgA=msg.split(""), ks=0;
      for(var m in msgA){
        if(ks>2){ks=0;}
        if(ks===0){var salt=k0;}
        if(ks===1){var salt=k1;}
        if(ks===2){var salt=k2;}
        var mv=charTextToDigit(msgA[m]);
        var mv=mv+key;
        var mv=mv+salt;
        msgS+=mv+", ";
        ks++;
      }
      msgS=msgS.substr(0,(msgS.length-2));
      r.text="... but are you paying attention?<br><br>"+msgS;
      r.status=true;
    }
    if(type==="chk"){
      if(req.query.a==="0"){
        if(parseInt(req.query.b)>256 && parseInt(req.query.b)<320){
          if(parseInt(req.query.c)>256 && parseInt(req.query.c)<320){r.status=true;}
        }
      }
    }
  }

  if(id===5){
    if(type==="init"){
      var o="What was your name?<br>";
         o+="... and why don’t you now know what your name was then?<br><br>";
         o+="Where did it go? Where did you lose it? Who took it?<br>";
         o+="... and how did he take it?<br><br>";
         o+="What tongue did you speak?<br>";
         o+="How did the man take your tongue?<br><br>";
         o+="Where is your history?<br>";
         o+="How did the man wipe out your history?";
      r.quote=o;
      r.text="Initial clue. Symbol animation. Second clue. Quote. All caps everything...<br>";
      r.text+="i. Negate doubles on ends, second in doubles. ii. Remove the odd one out keep first and last only.<br>";
      r.status=true;
    }
    if(type==="chk"){
      if(req.query.a==="RACISTDMSAFCCJMX"){r.status=true;}
    }
  }

  if(id===6){
    if(type==="init"){
      var o="It is 'society' which provides man with food, clothing, a home, the tools of work, language, the forms of thought, ";
         o+="and most of the content of thought; ";
         o+="his life is made possible through the labor and the accomplishments of the many millions ";
         o+="past and present who are all hidden behind the small word 'society.'<br>";
      r.quote=o;
      r.hint="arcmin";
      var str="verifiability";str=str.split(""), bit=new Array(), but="";
      for(var i=0;i<str.length;i++){bit[i]=charTextToDigit(str[i]);}
      for(var i=0;i<bit.length;i++){but+=convertBase(bit[i].toString(),10,60)+", ";}
      r.text="Wikipedia:"+but+", not ";
      r.status=true;
    }
    if(type==="chk"){
      if(req.query.a==="truth"){r.status=true;}
    }
  }

  if(id===7){
    if(type==="init"){
      var o="Dr. King's policy was that nonviolence would achieve the gains for black people in the United States. ";
         o+="His major assumption was that if you are nonviolent, ";
         o+="if you suffer, your opponent will see your suffering and will be moved to change his heart. ";
         o+="That's very good. He only made one fallacious assumption: ";
         o+="In order for nonviolence to work, your opponent must have a conscience.";
      r.quote=o;
      r.hint="est-il temps de faire l'ancien régime? Saros DYH";
      r.blob="Options have been violently constrained. See 224";
      r.text="The human species is the enemy? Green.<br>";
      r.status=true;
    }
    if(type==="chk"){
      if(req.query.a==="Fourth World War" && req.query.b==="indigenous"){r.status=true;}
    }
  }

  if(id===8){
    if(type==="init"){
      var o="It is a historical fact that blacks were brought to this country ";
         o+="for the profit of the ruling class which at the time were landowners. ";
         o+="They needed someone to till the soil and grow profitable crops. ";
         o+="Today we have shifted from an agrarian economy to a goods-production economy. ";
         o+="But the same relationships exist between the private owner and the worker. Nothing has changed. ";
         o+="Therefore, for working people to be free, they must seize control of the means of production.";
      r.quote=o;
      r.hint="";
      r.text="Nonviolent activists go further than endorsing state violence with their ";
      r.status=true;
    }
    if(type==="chk"){
      if(req.query.a==="Fourth World War" && req.query.b==="indigenious"){r.status=true;}
    }
  }

  res.status(200);res.json(r);
});

app.use(express.static('client'));
app.listen(3000,()=>{console.log("Listening on port 3000");});


// SEED FUNCTIONS
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
