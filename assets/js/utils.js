const Utils={renderCard(e,t,a){const n=this.isHighlighted(e,t)?"highlighted":"",c=e.category.toLowerCase().replace(/\s+/g,"-"),i=this.getActionButtonText(a),s=this.generateCategoryTags(e,a);return`
            <article class="tool-card color-${e.color} ${n}" data-category="${c}" data-id="${e.id}">
                <div class="card-icon-wrapper">
                    <i class="${e.icon}"></i>
                </div>
                <h3>${this.escapeHtml(e.name)}</h3>
                <span class="category">${this.escapeHtml(e.category)}</span>
                <p class="description">${this.escapeHtml(e.description)}</p>
                ${s}
                <div class="card-footer">
                    <a href="pages/${e.filename}" class="btn btn-primary" aria-label="${i} ${this.escapeHtml(e.name)}">
                        <i class="fas fa-arrow-right mr-2"></i>${i}
                    </a>
                </div>
            </article>
        `},getActionButtonText(e){return{calculator:"Calcular",scale:"Classificar",other:"Consultar"}[e]||"Acessar"},generateCategoryTags(e,t){const a={calculator:"Calculadora",scale:"Escala",other:"Informa\xE7\xE3o"},r={calculator:"blue",scale:"emerald",other:"amber"};return`
            <div class="card-tags">
                <span class="card-tag type-tag" data-type="${t}">${a[t]||"Ferramenta"}</span>
                <span class="card-tag category-tag" data-category="${this.escapeHtml(e.category)}">${this.escapeHtml(e.category)}</span>
            </div>
        `},isHighlighted(e,t){return!t||!t.filterCategory||t.filterCategory==="all"?!1:e.category===t.filterCategory},debounce(e,t){let a;return function(...n){const c=()=>{clearTimeout(a),e(...n)};clearTimeout(a),a=setTimeout(c,t)}},throttle(e,t){let a;return function(...n){a||(e(...n),a=!0,setTimeout(()=>a=!1,t))}},onReady(e){document.readyState==="loading"?document.addEventListener("DOMContentLoaded",e):e()},createElement(e,t={},a=""){const r=document.createElement(e);return Object.entries(t).forEach(([n,c])=>{n==="className"?r.className=c:n.startsWith("on")&&typeof c=="function"?r.addEventListener(n.slice(2).toLowerCase(),c):r.setAttribute(n,c)}),a instanceof HTMLElement?r.appendChild(a):a&&(r.innerHTML=a),r},escapeHtml(e){const t=document.createElement("div");return t.textContent=e,t.innerHTML},formatDate(e){return new Date(e).toLocaleDateString("pt-BR",{day:"2-digit",month:"2-digit",year:"numeric"})},getUrlParam(e){return new URLSearchParams(window.location.search).get(e)},scrollTo(e,t=0){const a=typeof e=="string"?document.querySelector(e):e;if(a){const r=a.getBoundingClientRect(),n=window.pageYOffset||document.documentElement.scrollTop;window.scrollTo({top:r.top+n-t,behavior:"smooth"})}},async copyToClipboard(e){try{return await navigator.clipboard.writeText(e),!0}catch{return!1}},isElementInViewport(e){const t=e.getBoundingClientRect();return t.top>=0&&t.left>=0&&t.bottom<=(window.innerHeight||document.documentElement.clientHeight)&&t.right<=(window.innerWidth||document.documentElement.clientWidth)}};window.Utils=Utils;
