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
function openGame(id){modal.classList.add('open');modal.setAttribute('aria-hidden','false');const g=games.find(x=>x.id===id);$('#modalTitle').textContent=g.name;$('#modalEyebrow').textContent=g.cat.toUpperCase();body.innerHTML='';if(id==='blackjack')blackjack();else if(id==='roulette')roulette();else if(id==='poker')poker();else if(id==='solitaire')solitaire();else if(['crimson7s','royalreels','moonlight'].includes(id))slots(id);else if(id==='aviadash')aviaDash();else if(id==='coin')coin();else if(id==='dice')dice();else if(id==='double')doubleGame()}
window.openGame=openGame;
function closeGame(){modal.classList.remove('open');modal.setAttribute('aria-hidden','true');body.innerHTML=''}
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
 const t=slotThemes[theme];
 body.innerHTML=`<div class="game-stage slots-stage ${t.accent}-slot"><div class="slot-topline"><div><span class="eyebrow">${t.name.toUpperCase()}</span><h3>Spin the reels</h3></div><div class="slot-status"><span id="slotStatusDot"></span><span id="slotStatus">READY</span></div></div><div class="slot-cabinet"><div class="slot-lights"></div><div class="reels-window"><div class="reel" id="s1"><span>${t.symbols[0]}</span></div><div class="reel" id="s2"><span>${t.symbols[2]}</span></div><div class="reel" id="s3"><span>${t.symbols[1]}</span></div></div><div class="payline"></div><div class="slot-result" id="slotResult">GOOD LUCK</div></div><div class="message" id="smsg">Three of a kind pays the most. Any pair returns 2×.</div><div class="bet-bar"><div class="bet-control"><span>BET</span><input class="bet-input" id="sbet" type="number" value="50" min="1"></div><button class="chip" onclick="document.querySelector('#sbet').value=25">25</button><button class="chip" onclick="document.querySelector('#sbet').value=100">100</button><button class="chip" onclick="document.querySelector('#sbet').value=250">250</button><button class="mini-btn red spin-big" id="sspin">SPIN</button></div><div class="slot-pay-strip">${Object.entries(t.pays).map(([sym,m])=>`<span>${sym}${sym}${sym} <b>${m}×</b></span>`).join('')}<span>ANY PAIR <b>2×</b></span></div></div>`;
 const rs=[$('#s1'),$('#s2'),$('#s3')];
 $('#sspin').onclick=()=>{
   const bet=Number($('#sbet').value);
   if(!validBet(bet))return;
   $('#sspin').disabled=true;
   $('#slotStatus').textContent='SPINNING';
   $('#slotResult').textContent='…';
   $('#smsg').textContent='Reels are rolling…';
   rs.forEach(r=>r.classList.add('slot-spinning'));
   const stops=[650,950,1250];
   stops.forEach((ms,i)=>{
     setTimeout(()=>{
       rs[i].classList.remove('slot-spinning');
       rs[i].classList.add('reel-stop');
       const sym=weighted(t);
       rs[i].querySelector('span').textContent=sym;
       setTimeout(()=>rs[i].classList.remove('reel-stop'),350);
       if(i!==2)return;
       const a=rs[0].querySelector('span').textContent,b=rs[1].querySelector('span').textContent,c=rs[2].querySelector('span').textContent;
       let mult=0;
       if(a===b&&b===c)mult=t.pays[a]||5;
       else if(a===b||b===c||a===c)mult=2;
       const pay=bet*mult;
       const delta=record(t.name,bet,pay);
       $('#slotStatus').textContent=delta>=0?'WIN':'NO WIN';
       $('#slotResult').textContent=delta>0?'WIN '+money(delta):mult===0?'NO MATCH':'RETURN '+money(pay);
       $('#smsg').textContent=delta>0?`Beautiful spin — ${money(delta)} profit.`:'No match this time.';
       if(delta>0){$('#slotResult').classList.add('slot-win');setTimeout(()=>$('#slotResult').classList.remove('slot-win'),700)}
       $('#sspin').disabled=false;
     },ms);
   });
 };
}
function poker(){
 body.innerHTML=`<div class="game-stage poker-stage"><div class="poker-table"><div class="poker-seat opponent"><span>HOUSE</span><div id="aiCards" class="poker-cards"></div><strong id="aiScore">Waiting</strong></div><div class="community"><div class="hand-title">COMMUNITY</div><div id="communityCards" class="poker-cards"></div><div class="pot-line">POT <b id="pot">$0.00</b></div></div><div class="poker-seat player"><span>YOU</span><div id="yourCards" class="poker-cards"></div><strong id="yourScore">Waiting</strong></div></div><div class="message" id="pokerMsg">Place a bet to deal a heads-up hand.</div><div class="bet-bar"><input class="bet-input" id="pbet" type="number" value="100" min="1"><button class="mini-btn red" id="pdeal">DEAL</button><button class="mini-btn" id="pcheck" disabled>CHECK</button><button class="mini-btn" id="pcall" disabled>CALL</button><button class="mini-btn" id="praise" disabled>RAISE</button><button class="mini-btn" id="pfold" disabled>FOLD</button></div><div class="poker-note">Heads-up Texas Hold’em: best five-card hand wins. House makes simple automatic decisions.</div></div>`;
 let deck=[],hole=[],aiHole=[],community=[],pot=0,bet=0,stage=0,active=false,playerTurn=false;
 const ranks=['2','3','4','5','6','7','8','9','T','J','Q','K','A'],suits=['♠','♥','♦','♣'];
 function makeDeck(){const a=[];for(const s of suits)for(const r of ranks)a.push({r,s});return a.sort(()=>Math.random()-.5)}function draw(){return deck.pop()}
 function card(c){const red='♥♦'.includes(c.s);return `<div class="poker-card ${red?'red-suit':''}"><b>${c.r}</b><span>${c.s}</span></div>`}
 function score5(cs){const vals=cs.map(c=>ranks.indexOf(c.r)+2).sort((a,b)=>b-a),counts={};cs.forEach(c=>counts[c.r]=(counts[c.r]||0)+1);const uniq=[...new Set(vals)];if(uniq.includes(14))uniq.push(1);let straight=0;for(let i=0;i<=uniq.length-5;i++){const a=uniq.slice(i,i+5);if(a[0]-a[4]===4)straight=Math.max(straight,a[0])}const flush=cs.every(c=>c.s===cs[0].s);const groups=Object.entries(counts).map(([r,n])=>({r:ranks.indexOf(r)+2,n})).sort((a,b)=>b.n-a.n||b.r-a.r);if(straight&&flush)return [8,straight,'Straight Flush'];if(groups[0].n===4)return [7,groups[0].r,'Four of a Kind'];if(groups[0].n===3&&groups[1].n===2)return [6,groups[0].r,'Full House'];if(flush)return [5,...vals,'Flush'];if(straight)return [4,straight,'Straight'];if(groups[0].n===3)return [3,groups[0].r,...vals,'Three of a Kind'];if(groups[0].n===2&&groups[1].n===2)return [2,Math.max(groups[0].r,groups[1].r),Math.min(groups[0].r,groups[1].r),...vals,'Two Pair'];if(groups[0].n===2)return [1,groups[0].r,...vals,'Pair'];return [0,...vals,'High Card']}
 function best7(cs){let best=null;for(let a=0;a<cs.length-4;a++)for(let b=a+1;b<cs.length-3;b++)for(let c=b+1;c<cs.length-2;c++)for(let d=c+1;d<cs.length-1;d++)for(let e=d+1;e<cs.length;e++){const s=score5([cs[a],cs[b],cs[c],cs[d],cs[e]]);if(!best||s.slice(0,-1).some((v,i)=>v>(best[i]??-1)&&s.slice(0,i).every((x,j)=>x===best[j])))best=s}return best||[0,0,'High Card']}
 function render(){const shown=community.map(card).join('');$('#communityCards').innerHTML=shown||'<span class="muted">—</span>';$('#yourCards').innerHTML=hole.map(card).join('');$('#aiCards').innerHTML=aiHole.map((c,i)=>stage<4?'<div class="poker-card back-card">T</div>':card(c)).join('');$('#pot').textContent=money(pot);if(hole.length)$('#yourScore').textContent=stage>=3?best7([...hole,...community]).at(-1):'In play';if(stage>=4)$('#aiScore').textContent=best7([...aiHole,...community]).at(-1);else $('#aiScore').textContent='Hidden'}
 function controls(on){$('#pcheck').disabled=$('#pcall').disabled=$('#praise').disabled=$('#pfold').disabled=!on}
 function finish(result){active=false;controls(false);let pay=result==='win'?pot*2:result==='tie'?pot:0;balance+=pay;const delta=pay-bet;stats.rounds++;stats.wagered+=bet;stats.returned+=pay;if(delta>0){stats.wins++;stats.bigWin=Math.max(stats.bigWin,delta)}else if(delta<0)stats.losses++;history.unshift({game:'Texas Hold’em',delta,time:new Date().toLocaleTimeString([], {hour:'2-digit',minute:'2-digit'})});history=history.slice(0,12);save();render();$('#pokerMsg').textContent=result==='win'?`You win ${money(delta)} profit.`:result==='tie'?'Split pot — your wager is returned.':'House wins.'}
 function houseDecision(){if(!active)return;const strength=best7([...aiHole,...community])[0];if(stage<4){dealNext();return}if(strength>=2||Math.random()<.45){$('#pokerMsg').textContent='House calls.';dealNext()}else{$('#pokerMsg').textContent='House folds.';finish('win')}}
 function dealNext(){if(stage===1)community.push(draw(),draw(),draw());else if(stage===2)community.push(draw());else if(stage===3)community.push(draw());stage++;render();if(stage>=4){const p=best7([...hole,...community]),a=best7([...aiHole,...community]);let cmp=0;for(let i=0;i<Math.max(p.length,a.length);i++){if((p[i]??-1)>(a[i]??-1)){cmp=1;break}if((p[i]??-1)<(a[i]??-1)){cmp=-1;break}}finish(cmp>0?'win':cmp<0?'lose':'tie')}}
 $('#pdeal').onclick=()=>{if(active)return;bet=Number($('#pbet').value);if(!validBet(bet))return;balance-=bet;pot=bet*2;deck=makeDeck();hole=[draw(),draw()];aiHole=[draw(),draw()];community=[];stage=1;active=true;render();$('#pokerMsg').textContent='Pre-flop. Check, raise, or fold.';controls(true);$('#pcall').disabled=true};
 $('#pcheck').onclick=()=>{if(!active)return;$('#pokerMsg').textContent='House is thinking…';controls(false);setTimeout(houseDecision,500)};
 $('#pcall').onclick=()=>{if(!active)return;if(balance<bet){toast('Not enough credits to call.');return}balance-=bet;pot+=bet;controls(false);$('#pokerMsg').textContent='Call accepted. House is thinking…';setTimeout(houseDecision,500)};
 $('#praise').onclick=()=>{if(!active)return;const raise=Math.min(bet,Math.max(25,Math.floor(bet*.5)));if(balance<raise){toast('Not enough credits to raise.');return}balance-=raise;pot+=raise;controls(false);$('#pokerMsg').textContent=`You raise ${money(raise)}. House is thinking…`;setTimeout(houseDecision,500)};
 $('#pfold').onclick=()=>{if(!active)return;finish('lose');$('#pokerMsg').textContent='You folded.'};
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
 body.innerHTML=`<div class="game-stage avia-stage"><div class="avia-hud"><div><span class="eyebrow">TOMA'S ORIGINAL</span><h3>Aero Dash</h3></div><div class="avia-mult" id="aviaMult">1.00×</div><div class="avia-speed"><button class="speed active" data-speed="1">SLOW</button><button class="speed" data-speed="1.6">NORMAL</button><button class="speed" data-speed="2.3">FAST</button><button class="speed" data-speed="3">TURBO</button></div></div><div class="avia-sky" id="aviaSky"><div class="carrier"></div><div class="plane" id="plane">✈</div><div class="avia-trail" id="aviaTrail"></div><div class="avia-item item1" id="aviaItem1">+2</div><div class="avia-item item2" id="aviaItem2">×2</div><div class="avia-item item3" id="aviaItem3">🚀</div><div class="avia-alt" id="aviaAlt">ALT 000</div></div><div class="avia-controls"><div class="bet-control"><span>STAKE</span><input class="bet-input" id="aviaBet" type="number" value="100" min="1"></div><div class="bet-control"><span>AUTO CASHOUT</span><input class="bet-input" id="aviaAuto" type="number" value="2.00" min="1.01" step="0.1"></div><button class="mini-btn red" id="aviaStart">LAUNCH</button><button class="mini-btn" id="aviaCash" disabled>CASH OUT</button></div><div class="message" id="aviaMsg">Launch the plane, collect bonuses, and cash out before the flight ends.</div><div class="avia-note">Original TOMA'S gameplay inspired by the crash-flight genre — not a reproduction of any third-party game, brand, or artwork.</div></div>`;
 let speed=1,active=false,mult=1,stake=0,start=0,last=0,raf=0,target=0,cashed=false,events=[];
 $$('.speed').forEach(b=>b.onclick=()=>{$$('.speed').forEach(x=>x.classList.remove('active'));b.classList.add('active');speed=Number(b.dataset.speed)});
 function resetItems(){['aviaItem1','aviaItem2','aviaItem3'].forEach((id,i)=>{const e=$('#'+id);e.classList.remove('hit');e.style.left=(28+i*20+Math.random()*8)+'%';e.style.top=(30+Math.random()*35)+'%'})}
 function finish(result){active=false;cancelAnimationFrame(raf);$('#aviaStart').disabled=false;$('#aviaCash').disabled=true;const pay=result==='cash'?stake*mult:0,delta=record('Aero Dash',stake,pay);$('#aviaMsg').textContent=result==='cash'?`Cashed out at ${mult.toFixed(2)}× — ${money(delta)} profit.`:'The flight ended before cashout.';$('#aviaMult').textContent=mult.toFixed(2)+'×';}
 function loop(ts){if(!active)return;if(!last)last=ts;const dt=Math.min(40,ts-last);last=ts;mult+=dt*0.00032*speed;$('#aviaMult').textContent=mult.toFixed(2)+'×';$('#aviaAlt').textContent='ALT '+String(Math.floor((mult-1)*420)).padStart(3,'0');const elapsed=(ts-start)*0.001*speed;$('#plane').style.transform=`translate(${Math.min(70,elapsed*5.5)}%, ${-Math.min(48,elapsed*2.1)}%) rotate(-8deg)`;if(mult>=Number($('#aviaAuto').value)){finish('cash');return}if(elapsed>5+Math.random()*5){finish('crash');return}if(elapsed>1.4&&!events[0]&&mult>1.25){events[0]=1;mult+=2;$('#aviaItem1').classList.add('hit');$('#aviaMsg').textContent='Bonus collected: +2×';}if(elapsed>2.8&&!events[1]&&mult>2){events[1]=1;mult*=2;$('#aviaItem2').classList.add('hit');$('#aviaMsg').textContent='Boost collected: ×2';}if(elapsed>3.8&&!events[2]&&mult>2.4&&Math.random()<.65){events[2]=1;mult=Math.max(1,mult/2);$('#aviaItem3').classList.add('hit');$('#aviaMsg').textContent='Rocket hit — multiplier halved.'}raf=requestAnimationFrame(loop)}
 $('#aviaStart').onclick=()=>{if(active)return;stake=Number($('#aviaBet').value);if(!validBet(stake))return;mult=1;start=performance.now();last=0;events=[];active=true;cashed=false;resetItems();$('#aviaStart').disabled=true;$('#aviaCash').disabled=false;$('#aviaMsg').textContent='In flight… watch the multiplier.';raf=requestAnimationFrame(loop)};
 $('#aviaCash').onclick=()=>{if(!active)return;cashed=true;finish('cash')};
}

function coin(){body.innerHTML=`<div class="game-stage coin-flip"><div class="coin" id="coin">T</div><div class="message" id="cmsg">Call heads or tails. Correct calls pay 2×.</div><div class="bet-bar"><input class="bet-input" id="cbet" type="number" value="100" min="1"><button class="mini-btn" id="heads">HEADS</button><button class="mini-btn red" id="tails">TAILS</button></div></div>`;['heads','tails'].forEach(x=>$('#'+x).onclick=()=>{const bet=Number($('#cbet').value);if(!validBet(bet))return;$('#heads').disabled=$('#tails').disabled=true;$('#coin').classList.remove('flip');void $('#coin').offsetWidth;$('#coin').classList.add('flip');setTimeout(()=>{const result=Math.random()<.5?'heads':'tails',win=result===x,pay=win?bet*2:0,delta=record('High / Low',bet,pay);$('#coin').textContent=result==='heads'?'H':'T';$('#cmsg').textContent=win?`It was ${result}. You win ${money(delta)} profit!`:`It was ${result}. Better luck next time.`;$('#heads').disabled=$('#tails').disabled=false},850)})}
function dice(){body.innerHTML=`<div class="game-stage coin-flip"><div class="coin" id="die">⚄</div><div class="message" id="dmsg">Roll 1–6. Pick over or under 3.5.</div><div class="bet-bar"><input class="bet-input" id="dbet" type="number" value="100" min="1"><button class="mini-btn" id="under">UNDER</button><button class="mini-btn red" id="over">OVER</button></div></div>`;['under','over'].forEach(x=>$('#'+x).onclick=()=>{const bet=Number($('#dbet').value);if(!validBet(bet))return;$('#under').disabled=$('#over').disabled=true;$('#die').classList.add('flip');setTimeout(()=>{const n=1+Math.floor(Math.random()*6),win=x==='over'?n>3:n<4,pay=win?bet*2:0,delta=record('Lucky Dice',bet,pay);$('#die').textContent=['','⚀','⚁','⚂','⚃','⚄','⚅'][n];$('#dmsg').textContent=win?`Rolled ${n} — WIN ${money(delta)} profit!`:`Rolled ${n} — loss.`;$('#under').disabled=$('#over').disabled=false},800)})}
function doubleGame(){body.innerHTML=`<div class="game-stage coin-flip"><div class="coin" id="dg">×2</div><div class="message" id="dgm">The button is the bet. 50% chance to double your wager.</div><div class="bet-bar"><input class="bet-input" id="dgb" type="number" value="100" min="1"><button class="mini-btn red" id="dgo">DOUBLE OR NOTHING</button></div></div>`;$('#dgo').onclick=()=>{const bet=Number($('#dgb').value);if(!validBet(bet))return;$('#dgo').disabled=true;setTimeout(()=>{const win=Math.random()<.5,pay=win?bet*2:0,delta=record('Double or Nothing',bet,pay);$('#dg').textContent=win?'2×':'0';$('#dgm').textContent=win?`Doubled! You made ${money(delta)} profit.`:'Nothing this time.';$('#dgo').disabled=false},650)}}
function start(){renderCards();renderTopAnd();const r=location.hash.replace('#','')||'home';if($('#'+r))nav(r);else nav('home')}
window.addEventListener('hashchange',()=>{const r=location.hash.replace('#','');if($('#'+r))nav(r)});start();


/* TOMA'S CASINO — polished game interactions */
(() => {
  "use strict";
  const $$=(s,r=document)=>[...r.querySelectorAll(s)];
  const sleep=ms=>new Promise(r=>setTimeout(r,ms));

  /* True scrolling slot reels */
  const slotThemes={
    crimson:["7","BAR","★","◆","♠","♥","♣","♦"],
    velvet:["👑","💎","🌙","A","K","Q","J","10"],
    moonlight:["💎","🔴","🟣","🟢","🌟","7","🍒","🔔"]
  };
  function pick(theme){const a=slotThemes[theme]||slotThemes.crimson;return a[Math.floor(Math.random()*a.length)]}
  window.TomaSlots={
    spin(container,theme="crimson"){
      const reels=$$(".slot-reel",container); if(reels.length<3)return Promise.resolve();
      const finals=[pick(theme),pick(theme),pick(theme)];
      reels.forEach((reel,i)=>{
        reel.innerHTML="";
        const strip=document.createElement("div"); strip.className="slot-reel-strip";
        for(let n=0;n<32;n++){const cell=document.createElement("div");cell.className="slot-symbol";cell.textContent=n===30?finals[i]:pick(theme);strip.append(cell)}
        reel.append(strip);
        reel.classList.add("spinning");
        reel.style.setProperty("--spin-duration",`${1.15+i*.35}s`);
      });
      return sleep(1250).then(async()=>{
        for(const reel of reels){reel.classList.remove("spinning");reel.classList.add("stopping");await sleep(260);reel.classList.remove("stopping")}
        return finals;
      });
    }
  };

  /* Click-to-move and drag/drop friendly Solitaire controller */
  const suits=["♠","♥","♦","♣"], ranks=["A","2","3","4","5","6","7","8","9","10","J","Q","K"];
  const red=s=>s==="♥"||s==="♦", value=r=>r==="A"?1:r==="J"?11:r==="Q"?12:r==="K"?13:+r;
  window.TomaSolitaire=class{
    constructor(root){this.root=root;this.selected=null;this.newGame();this.bind()}
    deck(){let d=[];for(const s of suits)for(const r of ranks)d.push({s,r,face:false,id:Math.random().toString(36)+Date.now()});for(let i=d.length-1;i;i--){let j=Math.floor(Math.random()*(i+1));[d[i],d[j]]=[d[j],d[i]]}return d}
    newGame(){let d=this.deck();this.t=[[],[],[],[],[],[],[]];this.f=[[],[],[],[]];this.w=[];for(let i=0;i<7;i++)for(let j=0;j<=i;j++){let c=d.pop();c.face=j===i;this.t[i].push(c)}this.s=d;this.selected=null;this.render()}
    cardAt(id){for(let i=0;i<7;i++)for(const c of this.t[i])if(c.id===id)return [c,{type:"t",i}];if(this.w.at(-1)?.id===id)return[this.w.at(-1),{type:"w"}];return[null,null]}
    canTable(c,top){return top?top.face&&red(c.s)!==red(top.s)&&value(c.r)===value(top.r)-1:c.r==="K"}
    canFoundation(c,i){let f=this.f[i];return !f.length?c.r==="A":f.at(-1).s===c.s&&value(c.r)===value(f.at(-1).r)+1}
    move(from,to){
      let c=from.c, pile=from.type==="t"?this.t[from.i]:this.w, idx=from.type==="t"?pile.findIndex(x=>x.id===c.id):pile.length-1;
      if(idx<0)return false;
      if(to.type==="f"){if(idx!==pile.length-1||!this.canFoundation(c,to.i))return false;this.f[to.i].push(c);pile.splice(idx,1)}
      else{let moving=from.type==="t"?pile.slice(idx):[c];if(!this.canTable(moving[0],this.t[to.i].at(-1)))return false;if(from.type==="t")pile.splice(idx);else pile.pop();this.t[to.i].push(...moving)}
      if(from.type==="t"&&pile.length&&!pile.at(-1).face)pile.at(-1).face=true;return true
    }
    bind(){
      this.root.addEventListener("click",e=>{
        if(e.target.closest("[data-new]"))return this.newGame();
        if(e.target.closest("[data-stock]")){if(this.s.length)this.w.push(this.s.pop());else{this.s=this.w.reverse();this.w=[];this.s.forEach(c=>c.face=false)}return this.render()}
        const cardEl=e.target.closest("[data-card-id]");
        if(cardEl){const [c,from]=this.cardAt(cardEl.dataset.cardId);if(!c||!c.face)return;
          if(this.selected){if(this.move(this.selected,{type:"t",i:Number(cardEl.closest("[data-col]")?.dataset.col)})){this.selected=null;this.render();return}}
          this.selected={c,...from};this.render();return}
        const col=e.target.closest("[data-col]");if(col&&this.selected){if(this.move(this.selected,{type:"t",i:+col.dataset.col})){this.selected=null;this.render()}}
        const f=e.target.closest("[data-foundation]");if(f&&this.selected){if(this.move(this.selected,{type:"f",i:+f.dataset.foundation})){this.selected=null;this.render()}}
      });
      this.root.addEventListener("dragstart",e=>{const el=e.target.closest("[data-card-id]");if(!el)return;const [c,from]=this.cardAt(el.dataset.cardId);if(c?.face)e.dataTransfer.setData("text/plain",JSON.stringify({id:c.id,type:from.type,i:from.i}))});
      this.root.addEventListener("dragover",e=>{if(e.target.closest("[data-col],[data-foundation]"))e.preventDefault()});
      this.root.addEventListener("drop",e=>{const destCol=e.target.closest("[data-col]"),destF=e.target.closest("[data-foundation]");if(!destCol&&!destF)return;e.preventDefault();try{const x=JSON.parse(e.dataTransfer.getData("text/plain"));const [c,from0]=this.cardAt(x.id);if(c&&this.move({c,...from0},destF?{type:"f",i:+destF.dataset.foundation}:{type:"t",i:+destCol.dataset.col}))this.render()}catch{}});
    }
    renderCard(c){let d=document.createElement("div");d.className="sol-card "+(c.face?"face-up":"face-down")+(this.selected?.c.id===c.id?" selected":"");d.dataset.cardId=c.id;d.draggable=!!c.face;d.innerHTML=c.face?`<span>${c.r}</span><span>${c.s}</span>`:`<span class="card-back">T</span>`;return d}
    render(){this.root.innerHTML=`<div class="sol-toolbar"><button class="game-btn" data-stock>${this.s.length?"🂠 "+this.s.length:"↻"}</button><div class="sol-waste"></div><div class="sol-foundations">${suits.map((_,i)=>`<div class="sol-foundation" data-foundation="${i}">${this.f[i]?.at(-1)?.r||"A"}</div>`).join("")}</div><button class="game-btn" data-new>New Deal</button></div><div class="sol-tableau">${this.t.map((_,i)=>`<div class="sol-column" data-col="${i}"></div>`).join("")}</div>`;
      if(this.w.length)this.root.querySelector(".sol-waste").append(this.renderCard(this.w.at(-1)));
      this.t.forEach((p,i)=>{let col=this.root.querySelector(`[data-col="${i}"]`);p.forEach((c,k)=>{let d=this.renderCard(c);d.style.marginTop=k?"-68px":"0";col.append(d)})})
    }
  };

  document.addEventListener("click",e=>{let b=e.target.closest("button");if(b){b.classList.add("pressed");setTimeout(()=>b.classList.remove("pressed"),120)}});
})();
