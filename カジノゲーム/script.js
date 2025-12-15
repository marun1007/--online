// ===== 共通 =====
const playerName = localStorage.getItem("currentPlayer");
if (!playerName) location.href = "login.html";

function getPlayers(){
  return JSON.parse(localStorage.getItem("players") || "{}");
}
function savePlayers(p){
  localStorage.setItem("players", JSON.stringify(p));
}

// ===== DOM =====
const reels = [r1, r2, r3];
const coinText = coin;
const message = document.getElementById("message");
const spinBtn = document.getElementById("spin");
const workBtn = document.getElementById("work");
const slotFrame = document.getElementById("slot-frame");

// ===== 設定 =====
const cost = 10;
const symbols = ["🍒","🍋","🍉","⭐"];
const payout = { "🍒":10, "🍋":30, "🍉":50, "⭐":120 };

const settingRate = {
  1:0.10, 2:0.20, 3:0.30,
  4:0.40, 5:0.50, 6:0.60
};

let coinVal = getPlayers()[playerName].coin;
coinText.textContent = "COIN: " + coinVal;

// ===== 確変状態 =====
function isKakuhen(){
  return getPlayers()[playerName].kakuhen;
}

function setKakuhen(v){
  const p = getPlayers();
  p[playerName].kakuhen = v;
  savePlayers(p);
  updateKakuhenEffect();
}

function updateKakuhenEffect(){
  if(isKakuhen()){
    slotFrame.classList.add("kakuhen");
  }else{
    slotFrame.classList.remove("kakuhen");
  }
}
updateKakuhenEffect();

// ===== 絵柄抽選（星をレアに調整）=====
function lotterySymbol(){
  const r = Math.random();

  if(isKakuhen()){
    // 確変中は★90%ヒット、★5%継続
    if(r<0.50) return "🍒";
    if(r<0.80) return "🍋";
    if(r<0.95) return "🍉";
    return "⭐";
  }else{
    if(r<0.50) return "🍒";
    if(r<0.80) return "🍋";
    if(r<0.95) return "🍉";
    return "⭐";
  }
}

// ===== 当たり率 =====
function getHitRate(){
  const p = getPlayers()[playerName];

  if(p.kakuhen) return 0.9; // 確変中は90%
  return settingRate[p.setting] ?? 0.3;
}

// ===== 保存 =====
function saveCoin(){
  const p = getPlayers();
  p[playerName].coin = coinVal;
  savePlayers(p);
}

// ===== スピン =====
spinBtn.onclick = () => {
  if(coinVal < cost){
    message.textContent = "コイン不足";
    return;
  }

  coinVal -= cost;
  coinText.textContent = "COIN: " + coinVal;
  message.textContent = "";

  reels.forEach(r=>{
    r.classList.add("spin");
    r.textContent = "❔";
  });

  const hit = Math.random() < getHitRate();
  const sym = lotterySymbol();
  const result = hit
    ? [sym,sym,sym]
    : symbols.slice().sort(()=>Math.random()-0.5).slice(0,3);

  [600,1000, hit?1600:1200].forEach((t,i)=>{
    setTimeout(()=>{
      reels[i].classList.remove("spin");
      reels[i].textContent = result[i];
    }, t);
  });

  setTimeout(()=>{
    if(hit){
      coinVal += payout[sym];

      if(sym === "⭐" && !isKakuhen()){
        setKakuhen(true);
        message.textContent = "🌈 BIG！確変突入！";
      }else{
        message.textContent = "当たり！ +" + payout[sym];
      }
    }else{
      message.textContent = "ハズレ";

      // ❌ 確変中にハズレたら終了
      if(isKakuhen()){
        setKakuhen(false);
        message.textContent += "（確変終了）";
      }
    }

    coinText.textContent = "COIN: " + coinVal;
    saveCoin();
  },1700);
};

// ===== 仕事（連打防止）=====
let canWork = true;
const WORK_COOLDOWN = 1000;

workBtn.onclick = () => {
  if(!canWork) return;

  canWork = false;
  workBtn.disabled = true;
  workBtn.textContent = "仕事中...";

  coinVal += 1;
  coinText.textContent = "COIN: " + coinVal;
  message.textContent = "仕事で +1 コイン";
  saveCoin();

  setTimeout(()=>{
    canWork = true;
    workBtn.disabled = false;
    workBtn.textContent = "仕事する（+1コイン）";
  }, WORK_COOLDOWN);
};
