const $=s=>document.querySelector(s), $$=s=>[...document.querySelectorAll(s)];
const money=n=>"$"+Number(n).toLocaleString(undefined,{minimumFractionDigits:2,maximumFractionDigits:2});
const store={get(k,d){try{return JSON.parse(localStorage.getItem("tomas_"+k))??d}catch{return d}},set(k,v){localStorage.setItem("tomas_"+k,JSON.stringify(v))}};
let balance=store.get("balance",10000), stats=store.get("stats",{wins:0,losses:0,rounds:0,bigWin:0,wagered:0,returned:0}), history=store.get("history",[]);
function save(){store.set("balance",balance);store.set("stats",stats);store.set("history",history);renderTop();renderStats();renderHistory()}
function renderTop(){$("#balance").textContent=money(balance)}
function toast(t){let x=$("#toast");x.textContent=t;x.className="show";clearTimeout(window.__toast);window.__toast=setTimeout(()=>x.className="",2200)}
function validBet(v){v=Number(v);if(!Number.isFinite(v)||v<=0){toast("Enter a valid bet.");return false}if(v>balance){toast("Not enough virtual credits.");return false}return true}
function record(game,bet,payout,msg){balance-=bet;balance+=payout;stats.rounds++;stats.wagered+=bet;stats.returned+=payout;const delta=payout-bet;if(delta>0){stats.wins++;stats.bigWin=Math.max(stats.bigWin,delta)}else if(delta<0)stats.losses++;history.unshift({game,delta,time:new Date().toLocaleTimeString([], {hour:"2-digit",minute:"2-digit"})});history=history.slice(0,12);save();if(msg)toast(msg);return delta}
function nav(route){$$('.page').forEach(p=>p.classList.toggle('active',p.id===route));$$('.side-link').forEach(b=>b.classList.toggle('active',b.dataset.route===route));$('#sidebar').classList.remove('open');location.hash=route}
$$('[data-route]').forEach(b=>b.addEventListener('click',()=>{const r=b.dataset.route;if(r)nav(r)}));
$('#mobileMenu').onclick=()=>$('#sidebar').classList.toggle('open');
$('#resetBtn').onclick=()=>{if(confirm("Reset TOMA'S CASINO to $10,000 and clear statistics?")){balance=10000;stats={wins:0,losses:0,rounds:0,bigWin:0,wagered:0,returned:0};history=[];save();toast("Casino reset.")}};
$('#searchInput').addEventListener('input',e=>{const q=e.target.value.toLowerCase();$$('.game-card').forEach(c=>c.style.display=c.dataset.name.includes(q)?'':'none')});

const games=[
 {id:'blackjack',name:'Blackjack',cat:'Table Game',art:'♠',theme:'red',desc:'Beat the dealer',tag:'CLASSIC'},
 {id:'roulette',name:'Roulette',cat:'Table Game',art:'0',theme:'black',desc:'Spin the wheel',tag:'CLASSIC'},
 {id:'poker',name:'Texas Hold’em',cat:'Table Game',art:'A♠',theme:'red',desc:'Heads-up poker',tag:'TABLE'},
 {id:'solitaire',name:'Solitaire',cat:'Card Game',art:'♣',theme:'white',desc:'Classic Klondike',tag:'CARDS'},
 {id:'crimson7s',name:'Crimson 7s',cat:'Slot',art:'7',theme:'red',desc:'Classic crimson reels',tag:'SLOT'},
 {id:'royalreels',name:'Royal Velvet',cat:'Slot',art:'♛',theme:'black',desc:'Luxury high-roller reels',tag:'SLOT'},
 {id:'moonlight',name:'Moonlight Gems',cat:'Slot',art:'✦',theme:'white',desc:'Midnight gem reels',tag:'SLOT'},
 {id:'aviadash',name:'Aero Dash',cat:'Original',art:'✈',theme:'red',desc:'Flight, boosts & hazards',tag:'ORIGINAL'},
 {id:'coin',name:'High / Low',cat:'Original',art:'◆',theme:'white',desc:'Call the flip',tag:'ORIGINAL'},
 {id:'dice',name:'Lucky Dice',cat:'Original',art:'⚄',theme:'black',desc:'Over or under',tag:'ORIGINAL'},
 {id:'double',name:'Double or Nothing',cat:'Original',art:'×2',theme:'red',desc:'Pick a side',tag:'ORIGINAL'}
];
function card(g){return `<article class="game-card" data-name="${g.name.toLowerCase()}" onclick="openGame('${g.id}')"><div class="game-art ${g.theme}"><span class="badge">${g.tag}</span><div class="art-symbol">${g.art}</div></div><div class="game-info"><strong>${g.name}</strong><small>${g.desc}</small></div></article>`}
function renderCards(){
 const featured=[games[0],games[2],games[4],games[7]], table=[games[0],games[1],games[2],games[3]], slots=games.filter(g=>g.cat==='Slot'), originals=games.filter(g=>g.cat==='Original');
 $('#featuredGrid').innerHTML=featured.map(card).join('');$('#tableGrid').innerHTML=table.map(card).join('');$('#slotsGrid').innerHTML=slots.map(card).join('');$('#tableFullGrid').innerHTML=table.map(card).join('');$('#cardsGrid').innerHTML=games.filter(g=>['Blackjack','Texas Hold’em','Solitaire'].includes(g.name)).map(card).join('');$('#originalsGrid').innerHTML=originals.map(card).join('');
}
function renderStats(){$('#sWins').textContent=stats.wins;$('#sLosses').textContent=stats.losses;$('#sRounds').textContent=stats.rounds;$('#sBigWin').textContent=money(stats.bigWin);$('#sNet').textContent=money(stats.returned-stats.wagered)}
function renderHistory(){const html=history.length?history.map(h=>`<div class="history-row"><div><strong>${h.game}</strong><small>${h.time}</small></div><span>${h.delta>=0?'WIN':'LOSS'}</span><span class="${h.delta>=0?'positive':'negative'}">${h.delta>=0?'+':''}${money(h.delta)}</span><span></span></div>`).join(''):`<div class="empty">No rounds yet. Pick a game and take a seat.</div>`;$('#recentList').innerHTML=html;$('#recentHome').innerHTML=html}
function renderTopAnd(){renderTop();renderStats();renderHistory()}
const modal=$('#gameModal'),body=$('#gameBody');
let activeGameCleanup=null;
let gameSession=0;
function openGame(id){gameSession++; if(activeGameCleanup){try{activeGameCleanup()}catch(e){} activeGameCleanup=null;} modal.classList.add('open');modal.setAttribute('aria-hidden','false');const g=games.find(x=>x.id===id);$('#modalTitle').textContent=g.name;$('#modalEyebrow').textContent=g.cat.toUpperCase();body.innerHTML='';if(id==='blackjack')blackjack();else if(id==='roulette')roulette();else if(id==='poker')poker();else if(id==='solitaire')solitaire();else if(['crimson7s','royalreels','moonlight'].includes(id))slots(id);else if(id==='aviadash')aviaDash();else if(id==='coin')coin();else if(id==='dice')dice();else if(id==='double')doubleGame()}
window.openGame=openGame;
function closeGame(){gameSession++; if(activeGameCleanup){try{activeGameCleanup()}catch(e){} activeGameCleanup=null;} modal.classList.remove('open');modal.setAttribute('aria-hidden','true');body.innerHTML=''}
$('#closeModal').onclick=closeGame;$('#modalBackdrop').onclick=closeGame;document.addEventListener('keydown',e=>{if(e.key==='Escape')closeGame()});

function blackjack(){
 body.innerHTML=`<div class="game-stage"><div class="blackjack-table"><div class="table-ribbon">BLACKJACK · DEALER STANDS ON 17</div><div class="hand"><div class="hand-title">DEALER <span id="dealerScore">?</span></div><div class="cards" id="dealerCards"></div></div><div class="hand"><div class="hand-title">PLAYER <span id="playerScore">0</span></div><div class="cards" id="playerCards"></div></div><div class="message" id="bjMsg">Place your bet and deal.</div></div><div class="bet-bar"><input class="bet-input" id="bjBet" type="number" value="100" min="1"><button class="chip" onclick="bjChip(25)">25</button><button class="chip" onclick="bjChip(100)">100</button><button class="chip" onclick="bjChip(500)">500</button><button class="mini-btn red" id="bjDeal">DEAL</button><button class="mini-btn" id="bjHit" disabled>HIT</button><button class="mini-btn" id="bjStand" disabled>STAND</button><button class="mini-btn" id="bjDouble" disabled>DOUBLE</button></div></div>`;
 let deck=[],p=[],d=[],bet=0,active=false,hidden=true;
 const ranks=['A','2','3','4','5','6','7','8','9','10','J','Q','K'],suits=['♠','♥','♦','♣'];
 function makeDeck(){const a=[];for(const s of suits)for(const r of ranks)a.push({s,r});return a.sort(()=>Math.random()-.5)}
 function val(c){return c.r==='A'?11:['J','Q','K'].includes(c.r)?10:+c.r} function total(h){let n=h.reduce((a,c)=>a+val(c),0),a=h.filter(c=>c.r==='A').length;while(n>21&&a--)n-=10;return n} function draw(){return deck.pop()}
 function face(c,back=false){if(back)return `<div class="card back center">T</div>`;const red=['♥','♦'].includes(c.s);return `<div class="card ${red?'red-suit':''}"><b>${c.r}</b><span>${c.s}</span><b>${c.r}</b></div>`}
 function render(){ $('#dealerCards').innerHTML=d.map((c,i)=>face(c,hidden&&i===0)).join('');$('#playerCards').innerHTML=p.map(c=>face(c)).join('');$('#playerScore').textContent=total(p);$('#dealerScore').textContent=hidden?'?':total(d)}
 function end(){active=false;$('#bjHit').disabled=$('#bjStand').disabled=$('#bjDouble').disabled=true}
 window.bjChip=n=>$('#bjBet').value=n;
 $('#bjDeal').onclick=()=>{if(active)return;bet=Number($('#bjBet').value);if(!validBet(bet))return;deck=makeDeck();p=[draw(),draw()];d=[draw(),draw()];balance-=bet;hidden=true;active=true;render();$('#bjMsg').textContent='Your move.';$('#bjHit').disabled=$('#bjStand').disabled=$('#bjDouble').disabled=false;if(total(p)===21)$('#bjStand').click()};
 $('#bjHit').onclick=()=>{if(!active)return;p.push(draw());render();if(total(p)>21){$('#bjMsg').textContent='Bust — dealer wins.';stats.rounds++;stats.wagered+=bet;stats.losses++;history.unshift({game:'Blackjack',delta:-bet,time:new Date().toLocaleTimeString([], {hour:'2-digit',minute:'2-digit'})});history=history.slice(0,12);save();end()}};
 $('#bjStand').onclick=()=>{if(!active)return;hidden=false;while(total(d)<17)d.push(draw());render();const pt=total(p),dt=total(d),pay=pt===21&&p.length===2&&dt!==21?bet*2.5:dt>21||pt>dt?bet*2:pt===dt?bet:0;balance+=pay;const delta=pay-bet;stats.rounds++;stats.wagered+=bet;stats.returned+=pay;if(delta>0){stats.wins++;stats.bigWin=Math.max(stats.bigWin,delta);$('#bjMsg').textContent='You win '+money(delta)+' profit.'}else if(delta<0){stats.losses++;$('#bjMsg').textContent='Dealer wins.'}else $('#bjMsg').textContent='Push — bet returned.';history.unshift({game:'Blackjack',delta,time:new Date().toLocaleTimeString([], {hour:'2-digit',minute:'2-digit'})});history=history.slice(0,12);save();end()};
 $('#bjDouble').onclick=()=>{if(!active)return;if(balance<bet){toast('Not enough credits to double.');return}balance-=bet;bet*=2;p.push(draw());render();$('#bjStand').click()};
}

function roulette(){
 body.innerHTML=`<div class="game-stage roulette-layout"><div class="wheel-wrap"><div class="roulette-pointer">▼</div><div class="wheel" id="rw"><div class="wheel-number" id="rn">?</div></div></div><div class="message" id="rmsg">Choose a wager.</div><div class="roulette-picks" id="picks"><button class="pick selected" data-t="red">RED · 1:1</button><button class="pick" data-t="black">BLACK · 1:1</button><button class="pick" data-t="odd">ODD · 1:1</button><button class="pick" data-t="even">EVEN · 1:1</button><button class="pick" data-t="low">1–18 · 1:1</button><button class="pick" data-t="high">19–36 · 1:1</button><button class="pick" data-t="number">EXACT NUMBER · 35:1</button></div><div id="numWrap" style="display:none;margin-top:12px"><input class="bet-input" id="rnum" type="number" min="0" max="36" value="7"></div><div class="bet-bar"><input class="bet-input" id="rbet" type="number" value="100" min="1"><button class="mini-btn red" id="spin">SPIN</button></div></div>`;
 let type='red',rot=0;const reds=[1,3,5,7,9,12,14,16,18,19,21,23,25,27,30,32,34,36];
 $$('#picks .pick').forEach(b=>b.onclick=()=>{$$('#picks .pick').forEach(x=>x.classList.remove('selected'));b.classList.add('selected');type=b.dataset.t;$('#numWrap').style.display=type==='number'?'block':'none'});
 $('#spin').onclick=()=>{const bet=Number($('#rbet').value);if(!validBet(bet))return;$('#spin').disabled=true;rot+=1440+Math.floor(Math.random()*360);$('#rw').style.transform=`rotate(${rot}deg)`;$('#rmsg').textContent='Spinning…';setTimeout(()=>{const n=Math.floor(Math.random()*37);$('#rn').textContent=n;let win=false,m=2;if(type==='red')win=reds.includes(n);if(type==='black')win=n!==0&&!reds.includes(n);if(type==='odd')win=n!==0&&n%2===1;if(type==='even')win=n!==0&&n%2===0;if(type==='low')win=n>=1&&n<=18;if(type==='high')win=n>=19&&n<=36;if(type==='number'){win=n===Number($('#rnum').value);m=36}const pay=win?bet*m:0,delta=record('Roulette',bet,pay);$('#rmsg').textContent=win?`Number ${n} — WIN ${money(delta)} profit!`:`Number ${n} — loss of ${money(bet)}.`;$('#spin').disabled=false},3600)}
}

const slotThemes={
 crimson7s:{name:'Crimson 7s',symbols:['🍒','♣','7','♦','★'],weights:[28,23,18,16,15],pays:{'♦':25,'7':15,'♣':10,'🍒':8,'★':6},accent:'crimson'},
 royalreels:{name:'Royal Velvet',symbols:['♛','♦','♔','♜','♕'],weights:[18,20,17,23,22],pays:{'♛':24,'♦':18,'♔':12,'♜':9,'♕':7},accent:'royal'},
 moonlight:{name:'Moonlight Gems',symbols:['◆','✦','●','✧','☾'],weights:[22,24,18,21,15],pays:{'◆':22,'✦':16,'●':11,'✧':8,'☾':6},accent:'moon'}
};
function weighted(theme){const t=slotThemes[theme],sum=t.weights.reduce((a,b)=>a+b,0),r=Math.random()*sum;let x=0;for(let i=0;i<t.symbols.length;i++){x+=t.weights[i];if(r<x)return t.symbols[i]}return t.symbols.at(-1)}
function slots(theme='crimson7s'){
 const themes={
  crimson7s:{name:'Crimson 7s',symbols:['7','BAR','★','◆','♠','♥','♣','♦'],pays:{'7':12,'BAR':8,'★':6,'◆':5}},
  royalreels:{name:'Royal Velvet',symbols:['👑','💎','🌙','A','K','Q','J','10'],pays:{'👑':12,'💎':9,'🌙':7,'A':6}},
  moonlight:{name:'Moonlight Gems',symbols:['💎','🔴','🟣','🟢','🌟','7','🍒','🔔'],pays:{'💎':14,'🌟':9,'7':7,'🍒':5}}
 };
 const t=themes[theme]||themes.crimson7s;
 body.innerHTML=`<div class="game-stage slot-stage"><div class="slot-topline"><div><span class="eyebrow">${t.name}</span><h3>Premium Reels</h3></div><div class="slot-status"><span></span><b id="slotStatus">READY</b></div></div><div class="slot-cabinet"><div class="slot-lights"></div><div class="reels-window" id="slotReels"><div class="slot-reel" id="s1"><div class="slot-reel-strip"></div></div><div class="slot-reel" id="s2"><div class="slot-reel-strip"></div></div><div class="slot-reel" id="s3"><div class="slot-reel-strip"></div></div><div class="payline"></div></div><div class="slot-result" id="slotResult">MATCH 3 FOR THE BIGGEST WIN</div></div><div class="slot-pay-strip">${Object.entries(t.pays).map(([k,v])=>`<span>${k}<b>${v}×</b></span>`).join('')}<span>ANY PAIR<b>2×</b></span></div><div class="bet-bar"><input class="bet-input" id="sbet" type="number" value="100" min="1"><button class="chip" onclick="$('#sbet').value=25">25</button><button class="chip" onclick="$('#sbet').value=100">100</button><button class="chip" onclick="$('#sbet').value=500">500</button><button class="mini-btn red spin-big" id="sspin">SPIN REELS</button></div><div class="message" id="smsg">Set your stake and spin.</div></div>`;
 const rs=[$('#s1'),$('#s2'),$('#s3')];
 let spinning=false, rafs=[], token=gameSession;
 const pick=()=>t.symbols[Math.floor(Math.random()*t.symbols.length)];
 const build=(reel,final,offset)=>{
   const strip=reel.querySelector('.slot-reel-strip'); strip.innerHTML='';
   const cells=[]; for(let i=0;i<28;i++) cells.push(i===16?final:pick());
   cells.forEach(sym=>{const d=document.createElement('div');d.className='slot-symbol';d.textContent=sym;strip.appendChild(d)});
   strip.style.transform=`translateY(-${offset}px)`;
 };
 function stopOne(i,final){
   const reel=rs[i],strip=reel.querySelector('.slot-reel-strip');
   reel.classList.remove('slot-spinning'); reel.classList.add('reel-stop');
   strip.style.transform='translateY(-1472px)';
   strip.dataset.final=final;
   setTimeout(()=>{if(token===gameSession)reel.classList.remove('reel-stop')},260);
 }
 function finish(finals,bet){
   if(token!==gameSession)return; spinning=false; const [a,b,c]=finals; let mult=0;
   if(a===b&&b===c)mult=t.pays[a]||5; else if(a===b||b===c||a===c)mult=2;
   const pay=bet*mult,delta=record(t.name,bet,pay); $('#slotStatus').textContent=delta>=0?'WIN':'NO WIN'; $('#slotResult').textContent=delta>0?'WIN '+money(delta):mult?'RETURN '+money(pay):'NO MATCH'; $('#smsg').textContent=delta>0?`Beautiful spin — ${money(delta)} profit.`:'No match this time.'; $('#sspin').disabled=false;
   if(delta>0){$('#slotResult').classList.add('slot-win');setTimeout(()=>{if(token===gameSession)$('#slotResult').classList.remove('slot-win')},700)}
 }
 function spin(){
   if(spinning)return; const bet=Number($('#sbet').value); if(!validBet(bet))return; spinning=true; $('#sspin').disabled=true; $('#slotStatus').textContent='SPINNING'; $('#slotResult').textContent='…'; $('#smsg').textContent='Reels are rolling…';
   const finals=[pick(),pick(),pick()]; rs.forEach((r,i)=>{r.classList.add('slot-spinning'); build(r,finals[i],-Math.floor(Math.random()*8)*56);});
   const started=performance.now();
   const animate=ts=>{if(token!==gameSession||!spinning)return;const elapsed=ts-started;rs.forEach((r,i)=>{if(elapsed<650+i*330){const strip=r.querySelector('.slot-reel-strip');const y=-1200-Math.min(900,elapsed*1.8+i*80);strip.style.transform=`translateY(${y}px)`;}});if(elapsed<1450){rafs.push(requestAnimationFrame(animate));return}finals.forEach((f,i)=>setTimeout(()=>{if(token===gameSession)stopOne(i,f)},i*180));rafs.push(setTimeout(()=>finish(finals,bet),900));};
   rafs.push(requestAnimationFrame(animate));
 }
 $('#sspin').onclick=spin;
 activeGameCleanup=()=>{rafs.forEach(clearTimeout);rafs=[];spinning=false};
}
function poker(){
 body.innerHTML=`<div class="game-stage poker-stage"><div class="poker-table"><div class="poker-seat opponent"><span>HOUSE</span><div id="aiCards" class="poker-cards"></div><strong id="aiScore">Waiting</strong></div><div class="community"><div class="hand-title" id="pokerStreet">READY</div><div id="communityCards" class="poker-cards"></div><div class="pot-line">POT <b id="pot">$0.00</b></div></div><div class="poker-seat player"><span>YOU</span><div id="yourCards" class="poker-cards"></div><strong id="yourScore">Waiting</strong></div></div><div class="message" id="pokerMsg">Place a bet to deal a heads-up hand.</div><div class="bet-bar"><input class="bet-input" id="pbet" type="number" value="100" min="1"><button class="mini-btn red" id="pdeal">DEAL</button><button class="mini-btn" id="pcheck" disabled>CHECK</button><button class="mini-btn" id="pcall" disabled>CALL</button><button class="mini-btn" id="praise" disabled>RAISE</button><button class="mini-btn" id="pfold" disabled>FOLD</button></div><div class="poker-note">Heads-up Texas Hold’em. The house action is simulated without blocking the page.</div></div>`;
 let deck=[],hole=[],aiHole=[],community=[],pot=0,bet=0,stage=0,active=false,timers=[],token=gameSession;
 const ranks=['2','3','4','5','6','7','8','9','T','J','Q','K','A'],suits=['♠','♥','♦','♣'];
 const red=s=>'♥♦'.includes(s);
 function makeDeck(){const a=[];for(const s of suits)for(const r of ranks)a.push({r,s});return a.sort(()=>Math.random()-.5)}
 const draw=()=>deck.pop();
 function card(c){return `<div class="poker-card ${red(c.s)?'red-suit':''}"><b>${c.r}</b><span class="${red(c.s)?'card-red':'card-black'}">${c.s}</span></div>`}
 function score5(cs){const vals=cs.map(c=>ranks.indexOf(c.r)+2).sort((a,b)=>b-a),counts={};cs.forEach(c=>counts[c.r]=(counts[c.r]||0)+1);let uniq=[...new Set(vals)];if(uniq.includes(14))uniq.push(1);uniq.sort((a,b)=>b-a);let straight=0;for(let i=0;i<=uniq.length-5;i++){const a=uniq.slice(i,i+5);if(a[0]-a[4]===4){straight=Math.max(straight,a[0]);break}}const flush=cs.every(c=>c.s===cs[0].s),groups=Object.entries(counts).map(([r,n])=>({r:ranks.indexOf(r)+2,n})).sort((a,b)=>b.n-a.n||b.r-a.r);if(straight&&flush)return [8,straight];if(groups[0].n===4)return [7,groups[0].r,...vals.filter(v=>v!==groups[0].r)];if(groups[0].n===3&&groups[1]?.n===2)return [6,groups[0].r,groups[1].r];if(flush)return [5,...vals];if(straight)return [4,straight];if(groups[0].n===3)return [3,groups[0].r,...vals.filter(v=>v!==groups[0].r)];if(groups[0].n===2&&groups[1]?.n===2)return [2,Math.max(groups[0].r,groups[1].r),Math.min(groups[0].r,groups[1].r),...vals];if(groups[0].n===2)return [1,groups[0].r,...vals.filter(v=>v!==groups[0].r)];return [0,...vals]}
 function best7(cs){let best=null;for(let a=0;a<cs.length-4;a++)for(let b=a+1;b<cs.length-3;b++)for(let c=b+1;c<cs.length-2;c++)for(let d=c+1;d<cs.length-1;d++)for(let e=d+1;e<cs.length;e++){const x=score5([cs[a],cs[b],cs[c],cs[d],cs[e]]);if(!best||compare(x,best)>0)best=x}return best||[0]}
 function compare(a,b){for(let i=0;i<Math.max(a.length,b.length);i++){const av=a[i]??-1,bv=b[i]??-1;if(av!==bv)return av>bv?1:-1}return 0}
 function render(){if(token!==gameSession)return;$('#communityCards').innerHTML=community.map(card).join('')||'<span class="muted">—</span>';$('#yourCards').innerHTML=hole.map(card).join('');$('#aiCards').innerHTML=aiHole.map((c)=>stage>=4?card(c):'<div class="poker-card back-card">T</div>').join('');$('#pot').textContent=money(pot);$('#pokerStreet').textContent=stage===0?'READY':stage===1?'FLOP':stage===2?'TURN':stage===3?'RIVER':'SHOWDOWN';$('#yourScore').textContent=stage>=4?['High Card','Pair','Two Pair','Three of a Kind','Straight','Flush','Full House','Four of a Kind','Straight Flush'][best7([...hole,...community])[0]]:'In play';$('#aiScore').textContent=stage>=4?['High Card','Pair','Two Pair','Three of a Kind','Straight','Flush','Full House','Four of a Kind','Straight Flush'][best7([...aiHole,...community])[0]]:'Hidden'}
 function controls(on){$('#pcheck').disabled=$('#pcall').disabled=$('#praise').disabled=$('#pfold').disabled=!on}
 function finish(result){if(!active)return;active=false;controls(false);const pay=result==='win'?bet*2:result==='tie'?bet:0;const delta=record('Texas Hold’em',bet,pay);$('#pokerMsg').textContent=result==='win'?`You win ${money(delta)} profit.`:result==='tie'?`Split pot — ${money(pay)} returned.`:'House wins.';render()}
 function nextStreet(){
   if(!active)return;
   if(stage===1){community.push(draw(),draw(),draw());stage=2;$('#pokerStreet').textContent='FLOP';render();controls(true);$('#pcall').disabled=false;$('#pokerMsg').textContent='Flop is out. Your action.';return}
   if(stage===2){community.push(draw());stage=3;render();controls(true);$('#pokerMsg').textContent='Turn card is out. Your action.';return}
   if(stage===3){community.push(draw());stage=4;render();controls(false);$('#pokerMsg').textContent='River is out. Showdown…';window.setTimeout(()=>{if(!active||token!==gameSession)return;const cmp=compare(best7([...hole,...community]),best7([...aiHole,...community]));finish(cmp>0?'win':cmp<0?'lose':'tie')},500);return}
   const cmp=compare(best7([...hole,...community]),best7([...aiHole,...community]));finish(cmp>0?'win':cmp<0?'lose':'tie');
 }
 function think(){if(!active)return;$('#pokerMsg').textContent='House is thinking…';controls(false);const t=setTimeout(()=>{if(!active||token!==gameSession)return;const strength=best7([...aiHole,...community])[0]||0;$('#pokerMsg').textContent=(strength>=2&&Math.random()<.8)?'House calls.':'House checks.';nextStreet()},450);timers.push(t)}
 $('#pdeal').onclick=()=>{if(active)return;bet=Number($('#pbet').value);if(!validBet(bet))return;pot=bet*2;deck=makeDeck();hole=[draw(),draw()];aiHole=[draw(),draw()];community=[];stage=1;active=true;render();$('#pokerMsg').textContent='Flop incoming. Check, raise, or fold.';controls(true);$('#pcall').disabled=true};
 $('#pcheck').onclick=()=>{if(active)think()};
 $('#pcall').onclick=()=>{if(!active)return;pot=bet*2;think()};
 $('#praise').onclick=()=>{if(!active)return;pot=bet*2;$('#pokerMsg').textContent=`You raise. House is thinking…`;think()};
 $('#pfold').onclick=()=>{if(active)finish('lose')};
 activeGameCleanup=()=>{timers.forEach(clearTimeout);timers=[];active=false};
}
function solitaire(){
 body.innerHTML=`<div class="game-stage solitaire-stage"><div class="solitaire-top"><div class="sol-pile"><span>STOCK</span><button class="sol-card back-card" id="stock">T</button></div><div class="sol-pile"><span>WASTE</span><div class="sol-card empty-card" id="waste">—</div></div><div class="sol-spacer"></div><div class="foundations" id="foundations"></div></div><div class="sol-tableau" id="tableau"></div><div class="message" id="solMsg">Click a card, then click its destination. Build down in alternating colors.</div><button class="mini-btn" id="newSol">NEW DEAL</button></div>`;
 const ranks=['A','2','3','4','5','6','7','8','9','10','J','Q','K'],suits=['♠','♥','♦','♣'];let stock=[],waste=[],found=[[],[],[],[]],tabs=[[],[],[],[],[],[],[]],selected=null,turn=0;
 const red=s=>'♥♦'.includes(s);function makeDeck(){const a=[];for(const s of suits)for(const r of ranks)a.push({r,s,face:false,id:Math.random()});return a.sort(()=>Math.random()-.5)}
 function setup(){const d=makeDeck();stock=[];waste=[];found=[[],[],[],[]];tabs=[[],[],[],[],[],[],[]];selected=null;turn=0;for(let i=0;i<7;i++)for(let j=0;j<=i;j++){const c=d.pop();c.face=j===i;tabs[i].push(c)}stock=d;render()}
 function val(c){return ranks.indexOf(c.r)+1}function label(c){return `<span class="rank">${c.r}</span><span class="suit">${c.s}</span>`}
 function chtml(c,click){return `<button class="sol-card ${red(c.s)?'red-suit':''} ${c.face?'':'back-card'} ${selected&&selected.id===c.id?'selected-card':''}" data-cid="${c.id}" onclick="${click}">${c.face?label(c):'T'}</button>`}
 function render(){ $('#waste').innerHTML=waste.length?label(waste.at(-1)):'—';$('#foundations').innerHTML=found.map((f,i)=>`<button class="sol-found" onclick="solFoundation(${i})">${f.length?label(f.at(-1)):'A'+(i+1)}</button>`).join('');$('#tableau').innerHTML=tabs.map((pile,i)=>`<div class="sol-column" data-col="${i}">${pile.length?pile.map((c,j)=>chtml(c,`solSelect(${i},${j})`)).join(''):`<button class="sol-empty" onclick="solSelect(${i},-1)">K</button>`}</div>`).join('');$('#stock').textContent=stock.length?'T':'↻';}
 window.solSelect=(col,idx)=>{const pile=tabs[col];if(idx<0){selected={from:'empty',col};return}const c=pile[idx];if(!c.face){return}if(selected){moveSelected(col,idx);return}selected={from:'tab',col,idx};render()};
 function moveSelected(destCol,destIdx){if(selected.from==='tab'&&selected.col===destCol&&destIdx>=selected.idx){selected=null;render();return}let src=selected.from==='tab'?tabs[selected.col]:[waste.at(-1)];if(!src.length){selected=null;render();return}let moving=selected.from==='tab'?tabs[selected.col].slice(selected.idx):[waste.pop()];const lead=moving[0],dest=tabs[destCol],top=dest.at(-1);const valid=!top?(lead.r==='K'):top.face&&red(top.s)!==red(lead.s)&&val(top)===val(lead)-1;if(valid){if(selected.from==='tab')tabs[selected.col].splice(selected.idx);tabs[destCol].push(...moving);if(selected.from==='tab'&&tabs[selected.col].length)tabs[selected.col].at(-1).face=true;selected=null;render();checkWin()}else{toast('That move does not fit.');selected=null;render()}}
 window.solFoundation=i=>{let c=waste.at(-1);if(!c||val(c)!==found[i].length+1||c.s!==suits[i]){toast('Build foundations from Ace upward.');return}waste.pop();found[i].push(c);render();checkWin()};
 $('#stock').onclick=()=>{if(stock.length){const c=stock.pop();c.face=true;waste.push(c)}else{stock=waste.reverse().map(c=>({...c,face:false}));waste=[]}selected=null;render()};
 function checkWin(){if(found.reduce((n,f)=>n+f.length,0)===52){toast('Solitaire complete!');$('#solMsg').textContent='You cleared the deck — congratulations.'}}
 $('#newSol').onclick=setup;setup();
}

function aviaDash(){
 body.innerHTML=`<div class="game-stage avia-stage"><div class="avia-hud"><div><span class="eyebrow">TOMA'S ORIGINAL</span><h3>Aero Carrier Run</h3><small class="avia-sub">Fly the route between offshore carriers, collect boosts, and cash out.</small></div><div class="avia-mult" id="aviaMult">1.00×</div><div class="avia-speed"><button class="speed active" data-speed="1">CRUISE</button><button class="speed" data-speed="1.6">FAST</button><button class="speed" data-speed="2.3">TURBO</button></div></div><div class="avia-map" id="aviaMap"><div class="avia-cloud cloud1">☁</div><div class="avia-cloud cloud2">☁</div><div class="avia-cloud cloud3">☁</div><div class="island island1"></div><div class="island island2"></div><div class="carrier c1"><i></i><b>CV-01</b></div><div class="carrier c2"><i></i><b>CV-02</b></div><div class="carrier c3"><i></i><b>CV-03</b></div><div class="carrier c4"><i></i><b>CV-04</b></div><svg class="avia-route" viewBox="0 0 1000 500" preserveAspectRatio="none"><path id="flightPath" d="M120 380 C250 300 230 120 420 150 S650 390 760 290 S900 130 880 100"/></svg><div class="plane plane3d" id="plane">✈</div><div class="avia-trail" id="aviaTrail"></div><div class="avia-item item1" id="aviaItem1">+2×</div><div class="avia-item item2" id="aviaItem2">⚡ BOOST</div><div class="avia-item item3" id="aviaItem3">↯ SAFE LANE</div><div class="avia-alt" id="aviaAlt">ALT 000 · LEG 1/4</div></div><div class="avia-routebar"><span id="routeText">CARRIER 01 → CARRIER 02</span><span id="routeProgress">0%</span></div><div class="avia-controls"><div class="bet-control"><span>STAKE</span><input class="bet-input" id="aviaBet" type="number" value="100" min="1"></div><div class="bet-control"><span>AUTO CASHOUT</span><input class="bet-input" id="aviaAuto" type="number" value="3.00" min="1.01" step="0.1"></div><button class="mini-btn red" id="aviaStart">LAUNCH</button><button class="mini-btn" id="aviaCash" disabled>CASH OUT</button></div><div class="message" id="aviaMsg">Launch from the first carrier. The plane will cross the sea and visit the other decks.</div><div class="avia-note">Original TOMA'S flight game — a virtual-credit arcade experience, not a reproduction of Avia Masters.</div></div>`;
 let speed=1,active=false,mult=1,stake=0,start=0,last=0,raf=0,token=gameSession,leg=0,routeT=0,crashAt=0,boosts=[false,false,false];
 const carriers=[{x:12,y:76},{x:42,y:30},{x:76,y:58},{x:88,y:20}];
 const routeNames=['CARRIER 01 → CARRIER 02','CARRIER 02 → CARRIER 03','CARRIER 03 → CARRIER 04','CARRIER 04 → OPEN WATER'];
 $$('.speed').forEach(b=>b.onclick=()=>{$$('.speed').forEach(x=>x.classList.remove('active'));b.classList.add('active');speed=Number(b.dataset.speed)});
 function reset(){leg=0;routeT=0;boosts=[false,false,false];$('#plane').style.left=carriers[0].x+'%';$('#plane').style.top=carriers[0].y+'%';['aviaItem1','aviaItem2','aviaItem3'].forEach((id,i)=>{$('#'+id).classList.remove('hit');$('#'+id).style.left=(27+i*22)+'%';$('#'+id).style.top=(40-i*9)+'%'})}
 function point(t){const p=[carriers[Math.min(leg,3)],carriers[Math.min(leg+1,3)]];return {x:p[0].x+(p[1].x-p[0].x)*t,y:p[0].y+(p[1].y-p[0].y)*t}}
 function finish(result){if(!active)return;active=false;cancelAnimationFrame(raf);$('#aviaStart').disabled=false;$('#aviaCash').disabled=true;const pay=result==='cash'?stake*mult:0,delta=record('Aero Carrier Run',stake,pay);$('#aviaMsg').textContent=result==='cash'?`Cashed out at ${mult.toFixed(2)}× — ${money(delta)} profit.`:'The aircraft was lost before cashout.';$('#aviaMult').textContent=mult.toFixed(2)+'×'}
 function loop(ts){if(!active||token!==gameSession)return;if(!last)last=ts;const dt=Math.min(50,ts-last);last=ts;mult+=dt*.00028*speed;routeT+=dt*.000055*speed; if(routeT>=1){routeT=0;if(leg<3){leg++;$('#routeText').textContent=routeNames[leg];}else{leg=3;$('#routeText').textContent='CARRIER 04 → OPEN WATER'}} const pt=point(Math.min(routeT,1));$('#plane').style.left=pt.x+'%';$('#plane').style.top=pt.y+'%';$('#plane').style.transform=`translate(-50%,-50%) rotate(${Math.atan2((carriers[Math.min(leg+1,3)].y-carriers[leg].y),(carriers[Math.min(leg+1,3)].x-carriers[leg].x))*57.3}deg)`;$('#aviaTrail').style.left=Math.max(2,pt.x-12)+'%';$('#aviaTrail').style.top=pt.y+'%';$('#aviaMult').textContent=mult.toFixed(2)+'×';$('#aviaAlt').textContent='ALT '+String(Math.floor(180+(mult-1)*520)).padStart(3,'0')+' · LEG '+(Math.min(leg+1,4))+'/4';$('#routeProgress').textContent=Math.floor(((leg+routeT)/4)*100)+'%';
   if(!boosts[0]&&mult>1.35){boosts[0]=true;mult+=2;$('#aviaItem1').classList.add('hit');$('#aviaMsg').textContent='Boost collected: +2×'}
   if(!boosts[1]&&leg>=1&&routeT>.35){boosts[1]=true;mult*=1.5;$('#aviaItem2').classList.add('hit');$('#aviaMsg').textContent='Carrier corridor boost: ×1.5'}
   if(!boosts[2]&&leg>=2&&routeT>.55){boosts[2]=true;mult=Math.max(1,mult-0.35);$('#aviaItem3').classList.add('hit');$('#aviaMsg').textContent='Turbulence lane — multiplier dipped.'}
   if(mult>=Number($('#aviaAuto').value)){finish('cash');return} if(ts-start>crashAt){finish('crash');return} raf=requestAnimationFrame(loop)}
 $('#aviaStart').onclick=()=>{if(active)return;stake=Number($('#aviaBet').value);if(!validBet(stake))return;mult=1;start=performance.now();last=0;crashAt=9000+Math.random()*9000;active=true;reset();$('#aviaStart').disabled=true;$('#aviaCash').disabled=false;$('#aviaMsg').textContent='Takeoff! Crossing to Carrier 02…';raf=requestAnimationFrame(loop)};
 $('#aviaCash').onclick=()=>{if(active)finish('cash')};
 activeGameCleanup=()=>{cancelAnimationFrame(raf);active=false};
 reset();
}
function coin(){body.innerHTML=`<div class="game-stage coin-flip"><div class="coin" id="coin">T</div><div class="message" id="cmsg">Call heads or tails. Correct calls pay 2×.</div><div class="bet-bar"><input class="bet-input" id="cbet" type="number" value="100" min="1"><button class="mini-btn" id="heads">HEADS</button><button class="mini-btn red" id="tails">TAILS</button></div></div>`;['heads','tails'].forEach(x=>$('#'+x).onclick=()=>{const bet=Number($('#cbet').value);if(!validBet(bet))return;$('#heads').disabled=$('#tails').disabled=true;$('#coin').classList.remove('flip');void $('#coin').offsetWidth;$('#coin').classList.add('flip');setTimeout(()=>{const result=Math.random()<.5?'heads':'tails',win=result===x,pay=win?bet*2:0,delta=record('High / Low',bet,pay);$('#coin').textContent=result==='heads'?'H':'T';$('#cmsg').textContent=win?`It was ${result}. You win ${money(delta)} profit!`:`It was ${result}. Better luck next time.`;$('#heads').disabled=$('#tails').disabled=false},850)})}
function dice(){body.innerHTML=`<div class="game-stage coin-flip"><div class="coin" id="die">⚄</div><div class="message" id="dmsg">Roll 1–6. Pick over or under 3.5.</div><div class="bet-bar"><input class="bet-input" id="dbet" type="number" value="100" min="1"><button class="mini-btn" id="under">UNDER</button><button class="mini-btn red" id="over">OVER</button></div></div>`;['under','over'].forEach(x=>$('#'+x).onclick=()=>{const bet=Number($('#dbet').value);if(!validBet(bet))return;$('#under').disabled=$('#over').disabled=true;$('#die').classList.add('flip');setTimeout(()=>{const n=1+Math.floor(Math.random()*6),win=x==='over'?n>3:n<4,pay=win?bet*2:0,delta=record('Lucky Dice',bet,pay);$('#die').textContent=['','⚀','⚁','⚂','⚃','⚄','⚅'][n];$('#dmsg').textContent=win?`Rolled ${n} — WIN ${money(delta)} profit!`:`Rolled ${n} — loss.`;$('#under').disabled=$('#over').disabled=false},800)})}
function doubleGame(){body.innerHTML=`<div class="game-stage coin-flip"><div class="coin" id="dg">×2</div><div class="message" id="dgm">The button is the bet. 50% chance to double your wager.</div><div class="bet-bar"><input class="bet-input" id="dgb" type="number" value="100" min="1"><button class="mini-btn red" id="dgo">DOUBLE OR NOTHING</button></div></div>`;$('#dgo').onclick=()=>{const bet=Number($('#dgb').value);if(!validBet(bet))return;$('#dgo').disabled=true;setTimeout(()=>{const win=Math.random()<.5,pay=win?bet*2:0,delta=record('Double or Nothing',bet,pay);$('#dg').textContent=win?'2×':'0';$('#dgm').textContent=win?`Doubled! You made ${money(delta)} profit.`:'Nothing this time.';$('#dgo').disabled=false},650)}}
function start(){renderCards();renderTopAnd();const r=location.hash.replace('#','')||'home';if($('#'+r))nav(r);else nav('home')}
window.addEventListener('hashchange',()=>{const r=location.hash.replace('#','');if($('#'+r))nav(r)});start();


/* TOMA'S CASINO — non-blocking polished game interactions */
(() => {
  "use strict";
  const $$=(s,r=document)=>[...r.querySelectorAll(s)];

  const slotThemes={
    crimson:["7","BAR","★","◆","♠","♥","♣","♦"],
    velvet:["👑","💎","🌙","A","K","Q","J","10"],
    moonlight:["💎","🔴","🟣","🟢","🌟","7","🍒","🔔"]
  };
  const pick=theme=>{const a=slotThemes[theme]||slotThemes.crimson;return a[Math.floor(Math.random()*a.length)]};

  /* Animation uses requestAnimationFrame so it never blocks the browser/UI thread. */
  window.TomaSlots={
    spin(container,theme="crimson",onDone){
      const reels=$$(".slot-reel",container);
      if(reels.length<3)return;
      const finals=[pick(theme),pick(theme),pick(theme)];
      reels.forEach((reel,i)=>{
        reel.innerHTML="";
        const strip=document.createElement("div");
        strip.className="slot-reel-strip";
        for(let n=0;n<34;n++){
          const cell=document.createElement("div");
          cell.className="slot-symbol";
          cell.textContent=n===31?finals[i]:pick(theme);
          strip.appendChild(cell);
        }
        reel.appendChild(strip);
        reel.classList.remove("spinning","stopping");
        void reel.offsetWidth;
        reel.style.setProperty("--spin-duration",`${1.0+i*.28}s`);
        reel.classList.add("spinning");
      });

      // Never await/block the game. Let CSS animate and finish on its own.
      window.setTimeout(()=>{
        reels.forEach((r,i)=>{
          window.setTimeout(()=>{
            r.classList.remove("spinning");
            r.classList.add("stopping");
            window.setTimeout(()=>r.classList.remove("stopping"),260);
          },i*220);
        });
        window.setTimeout(()=>{ if(typeof onDone==="function") onDone(finals); },800);
      },950);
      return finals;
    }
  };

  /* Poker/other game UI should remain responsive while the house "thinks". */
  window.TomaHouseThink = function(ms=900, done){
    const start=performance.now();
    const tick=()=>{
      if(performance.now()-start>=ms){if(done)done();return}
      requestAnimationFrame(tick);
    };
    requestAnimationFrame(tick);
  };

  // Prevent accidental double-clicks from creating overlapping game rounds.
  document.addEventListener("click",e=>{
    const b=e.target.closest("button");
    if(!b)return;
    b.classList.add("pressed");
    window.setTimeout(()=>b.classList.remove("pressed"),120);
  });
})();
