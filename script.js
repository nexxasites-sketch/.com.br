const PLANS={essencial:{name:"Essencial",price:399.99,maintenance:75},profissional:{name:"Profissional",price:599.99,maintenance:117},avancado:{name:"Avançado",price:799.99,maintenance:150}};
const extras={mapa:["Mapa / localização",49.99],pagina:["Página adicional",39.99],feedback:["Feedbacks / depoimentos",69.99],catalogo:["Catálogo de produtos",59.99],agendamento:["Agendamento",299.99],whatsapp:["WhatsApp",29.99],instagram:["Instagram",29.99],faq:["FAQ",159.99],galeria:["Galeria",189.99]};
let currentStep=1;
const brl=n=>n.toLocaleString("pt-BR",{style:"currency",currency:"BRL"});
const qs=s=>document.querySelector(s), qsa=s=>[...document.querySelectorAll(s)];
function selectedPlan(){return qs('input[name="plan"]:checked').value}
function calc(){
 const p=PLANS[selectedPlan()]; let extraTotal=0, details=[p.name];
 qsa('.extras input[type="checkbox"]:checked').forEach(input=>{
   const key=input.dataset.extra, [name,price]=extras[key]||["",0];
   let amount=price;
   if(key==="pagina"){const qty=Math.max(1,Math.min(20,Number(qs('[data-qty="pagina"]').value)||1));amount*=qty;details.push(`${qty}x ${name}`)}
   else {extraTotal+=price;details.push(name)}
   if(key==="pagina")extraTotal+=amount;
 });
 if(qs("#domainCheck").checked)details.push("Domínio próprio (custo + R$100)");
 const subtotal=p.price+extraTotal+(qs("#domainCheck").checked?100:0);
 const discount=subtotal*.20;
 const total=subtotal-discount;
 qs("#liveTotal").textContent=brl(total);
 qs("#liveMaintenance").textContent=`+ ${brl(p.maintenance)}/mês`;
 qs("#liveDetails").textContent=details.join(" • ");
 return {p,extraTotal,subtotal,discount,total,details,domain:qs("#domainCheck").checked};
}
function go(step){
 currentStep=step;
 qsa(".step-panel").forEach(x=>x.classList.toggle("active",Number(x.dataset.step)===step));
 qsa("[data-step-dot]").forEach(x=>{let n=Number(x.dataset.stepDot);x.classList.toggle("active",n===step);x.classList.toggle("done",n<step)});
 if(step===4)renderSummary();
 document.querySelector(".builder").scrollIntoView({behavior:"smooth",block:"start"});
}
function renderSummary(){
 const c=calc(), rows=[`<div class="summary-row"><span>${c.p.name}</span><b>${brl(c.p.price)}</b></div>`];
 qsa('.extras input[type="checkbox"]:checked').forEach(input=>{
   const key=input.dataset.extra,[name,price]=extras[key]||["",0];
   let qty=1;if(key==="pagina")qty=Math.max(1,Math.min(20,Number(qs('[data-qty="pagina"]').value)||1));
   rows.push(`<div class="summary-row"><span>${qty>1?qty+"x ":""}${name}</span><span>${brl(price*qty)}</span></div>`);
 });
 if(c.domain)rows.push(`<div class="summary-row"><span>Serviço de domínio</span><span>R$100,00 + custo do domínio</span></div>`);
 rows.push(`<div class="summary-row"><span>Subtotal da criação</span><span>${brl(c.subtotal)}</span></div>`);
 rows.push(`<div class="summary-row discount"><span>Desconto de 20%</span><span>− ${brl(c.discount)}</span></div>`);
 rows.push(`<div class="summary-row total"><span>Total estimado da criação</span><span>${brl(c.total)}</span></div>`);
 rows.push(`<div class="summary-row"><span>Manutenção mensal</span><span>${brl(c.p.maintenance)}/mês</span></div>`);
 qs("#summaryBox").innerHTML=rows.join("");
}
qsa('[data-next]').forEach(b=>b.addEventListener('click',()=>{
 const target=Number(b.dataset.next);
 if(target===4){
   const required=["#company","#person","#businessType"]; let ok=true;
   required.forEach(sel=>{const el=qs(sel); if(!el.value.trim()){el.focus();el.style.borderColor="#e53935";ok=false}else el.style.borderColor=""});
   if(!ok){alert("Preencha os campos obrigatórios antes de continuar.");return}
 }
 go(target);
}));
qsa('[data-prev]').forEach(b=>b.addEventListener("click",()=>go(Number(b.dataset.prev))));
qsa('input[name="plan"], .extras input, .qty').forEach(el=>el.addEventListener("change",calc));
qsa('[data-choose]').forEach(b=>b.addEventListener("click",()=>{qs(`input[name="plan"][value="${b.dataset.choose}"]`).checked=true;calc()}));
qs("#sendInstagram").addEventListener("click",()=>{
 const c=calc(), company=qs("#company").value.trim(), person=qs("#person").value.trim(), type=qs("#businessType").value.trim(), insta=qs("#clientInstagram").value.trim(), wa=qs("#clientWhatsapp").value.trim(), notes=qs("#notes").value.trim();
 const selected=[]; qsa('.extras input[type="checkbox"]:checked').forEach(i=>{const key=i.dataset.extra,[name,price]=extras[key];let qty=key==="pagina"?Number(qs('[data-qty="pagina"]').value)||1:1;selected.push(`${qty>1?qty+"x ":""}${name}`)}); if(c.domain)selected.push("Domínio próprio (custo do domínio + R$100)");
 const msg=`Olá, NEXXA! Quero solicitar um orçamento.%0A%0A*Minha empresa*%0AEmpresa: ${company}%0AResponsável: ${person}%0ATipo de negócio: ${type}%0AInstagram: ${insta||"Não informado"}%0AWhatsApp: ${wa||"Não informado"}%0A%0A*Meu projeto*%0APlano: ${c.p.name}%0AExtras: ${selected.length?selected.join(", "):"Nenhum"}%0AObservações: ${notes||"Nenhuma"}%0A%0A*Estimativa*%0ACriação com 20% OFF: ${brl(c.total)}%0AManutenção: ${brl(c.p.maintenance)}/mês%0A%0AEntendo que o valor é uma estimativa e quero conversar sobre os detalhes.`;
 window.open(`https://instagram.com/nexxa.sites?text=${msg}`,"_blank","noopener");
});
qs("#restart").addEventListener("click",()=>{document.querySelectorAll('input[type="checkbox"]').forEach(x=>x.checked=false);qs('input[name="plan"][value="essencial"]').checked=true;qs('[data-qty="pagina"]').value=1;qsa("#company,#person,#businessType,#clientInstagram,#clientWhatsapp,#notes").forEach(x=>x.value="");calc();go(1)});
qs("#year").textContent=new Date().getFullYear();
qs("#menuBtn").addEventListener("click",()=>qs("#nav").classList.toggle("open"));
qsa(".nav a").forEach(a=>a.addEventListener("click",()=>qs("#nav").classList.remove("open")));
const modal=qs("#demoModal"), modalTitle=qs("#modalTitle"), preview=qs("#modalPreview");
qsa("[data-demo]").forEach(card=>card.addEventListener("click",()=>{modalTitle.textContent=`Exemplo de ${card.dataset.demo}`;preview.textContent=card.dataset.demo.toUpperCase();preview.className="modal-preview";modal.classList.add("open");modal.setAttribute("aria-hidden","false")}));
function closeModal(){modal.classList.remove("open");modal.setAttribute("aria-hidden","true")}
qs("#modalClose").addEventListener("click",closeModal);modal.addEventListener("click",e=>{if(e.target===modal)closeModal()});
qs("#modalQuote").addEventListener("click",closeModal);
calc();
