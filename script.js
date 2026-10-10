const cover=document.getElementById('cover'), reveal=document.getElementById('reveal'), details=document.getElementById('details'), toast=document.getElementById('toast');
const eventText='دعوة عيد ميلاد مينا فؤاد مرقص 🎂\nالجمعة ٦ نوفمبر ٢٠٢٦ - الساعة ٥:٠٠ مساءً\nقاعة جرين لاند – مدينة نصر، القاهرة';
function say(t){toast.textContent=t;toast.classList.add('show');clearTimeout(say.timer);say.timer=setTimeout(()=>toast.classList.remove('show'),3000)}
let fireworksRAF = null, fireworksTimer = null, audioCtx = null, celebrationOn = false;
const canvas = document.getElementById('fireworks');
const ctx = canvas.getContext('2d');
let particles = [];
function resizeFireworks(){canvas.width=window.innerWidth*devicePixelRatio;canvas.height=window.innerHeight*devicePixelRatio;ctx.setTransform(devicePixelRatio,0,0,devicePixelRatio,0,0)}
window.addEventListener('resize',resizeFireworks); resizeFireworks();
function burst(){
  const x=Math.random()*window.innerWidth, y=45+Math.random()*window.innerHeight*.58;
  const colors=['#e62932','#ffffff','#ffb36b','#f7d7c0','#ff5361'];
  const count=35+Math.floor(Math.random()*26);
  for(let i=0;i<count;i++){const a=Math.PI*2*i/count, speed=1.1+Math.random()*3.4;
    particles.push({x,y,vx:Math.cos(a)*speed,vy:Math.sin(a)*speed,life:45+Math.random()*30,max:75,r:1.4+Math.random()*2.1,color:colors[Math.floor(Math.random()*colors.length)]})}
  popSound();
}
function popSound(){
  try{
    audioCtx=audioCtx||new (window.AudioContext||window.webkitAudioContext)();
    if(audioCtx.state==='suspended') audioCtx.resume();
    const now=audioCtx.currentTime;
    // A short, celebratory crack/pop synthesized in the browser; no extra audio file needed.
    const duration=.09, buffer=audioCtx.createBuffer(1,Math.floor(audioCtx.sampleRate*duration),audioCtx.sampleRate);
    const data=buffer.getChannelData(0);
    for(let i=0;i<data.length;i++) data[i]=(Math.random()*2-1)*(1-i/data.length);
    const noise=audioCtx.createBufferSource(); noise.buffer=buffer;
    const filter=audioCtx.createBiquadFilter(); filter.type='highpass'; filter.frequency.value=900+Math.random()*1300;
    const gain=audioCtx.createGain(); gain.gain.setValueAtTime(.0001,now); gain.gain.exponentialRampToValueAtTime(.18,now+.008); gain.gain.exponentialRampToValueAtTime(.0001,now+duration);
    noise.connect(filter);filter.connect(gain);gain.connect(audioCtx.destination);noise.start(now);noise.stop(now+duration);
    const osc=audioCtx.createOscillator(), og=audioCtx.createGain();osc.type='sine';osc.frequency.setValueAtTime(180+Math.random()*120,now);osc.frequency.exponentialRampToValueAtTime(65,now+.12);
    og.gain.setValueAtTime(.0001,now);og.gain.exponentialRampToValueAtTime(.12,now+.006);og.gain.exponentialRampToValueAtTime(.0001,now+.13);
    osc.connect(og);og.connect(audioCtx.destination);osc.start(now);osc.stop(now+.14);
  }catch(e){}
}
function drawFireworks(){
  if(!celebrationOn)return;
  ctx.clearRect(0,0,window.innerWidth,window.innerHeight);
  particles=particles.filter(p=>p.life>0);
  for(const p of particles){p.x+=p.vx;p.y+=p.vy;p.vx*=.985;p.vy=p.vy*.985+.025;p.life--;
    ctx.globalAlpha=Math.max(0,p.life/p.max);ctx.fillStyle=p.color;ctx.beginPath();ctx.arc(p.x,p.y,p.r,0,Math.PI*2);ctx.fill()}
  ctx.globalAlpha=1;
  fireworksRAF=requestAnimationFrame(drawFireworks);
}
function startCelebration(){
  celebrationOn=true;document.body.classList.add('celebrating');resizeFireworks();
  burst();fireworksTimer=setInterval(()=>{if(celebrationOn)burst()},850);
  if(fireworksRAF)cancelAnimationFrame(fireworksRAF);drawFireworks();
}
function stopCelebration(){
  celebrationOn=false;document.body.classList.remove('celebrating');
  if(fireworksTimer)clearInterval(fireworksTimer);if(fireworksRAF)cancelAnimationFrame(fireworksRAF);
  particles=[];ctx.clearRect(0,0,window.innerWidth,window.innerHeight);
}
document.getElementById('openBtn').addEventListener('click',()=>{
  cover.classList.add('hidden');reveal.classList.remove('hidden');reveal.setAttribute('aria-hidden','false');
  window.scrollTo({top:0,behavior:'smooth'});
  setTimeout(()=>{
    reveal.classList.add('hidden');reveal.setAttribute('aria-hidden','true');
    details.classList.remove('hidden');details.setAttribute('aria-hidden','false');
    window.scrollTo({top:0,behavior:'smooth'});startCelebration();
    const music=document.getElementById('birthdayMusic');
    if(music){music.volume=0.72;music.play().catch(()=>say('لو الأغنية ما بدأتش، اضغطي على الشاشة مرة 🎵'));}
  },2200);
});
document.getElementById('backBtn').addEventListener('click',()=>{stopCelebration();const music=document.getElementById('birthdayMusic');if(music)music.pause();details.classList.add('hidden');cover.classList.remove('hidden');window.scrollTo({top:0,behavior:'smooth'})});
document.getElementById('shareBtn').addEventListener('click',async()=>{const data={title:'دعوة عيد ميلاد مينا',text:eventText,url:location.href};try{if(navigator.share)await navigator.share(data);else if(navigator.clipboard&&isSecureContext){await navigator.clipboard.writeText(eventText+'\n'+location.href);say('تم نسخ تفاصيل الدعوة ❤️')}else prompt('انسخي رابط الدعوة وابعتيه:',location.href)}catch(e){if(e.name!=='AbortError')say('انسخي رابط الصفحة من شريط العنوان وابعتيه لأصحابك')}});
document.getElementById('rsvpBtn').addEventListener('click',async()=>{const name=prompt('اكتبي اسمك لتأكيد الحضور:');if(!name||!name.trim())return;const msg='تأكيد حضور عيد ميلاد مينا 🎉\nالاسم: '+name.trim()+'\n'+eventText;try{if(navigator.share)await navigator.share({title:'تأكيد الحضور',text:msg});else prompt('انسخي رسالة التأكيد وابعتيها لمنظم الحفلة:',msg)}catch(e){if(e.name!=='AbortError')prompt('انسخي رسالة التأكيد:',msg)}});
document.getElementById('photosBtn').addEventListener('click',()=>say('صور الحفلة هتكون متاحة بعد الاحتفال 📸'));