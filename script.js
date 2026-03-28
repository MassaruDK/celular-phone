/**
 * Orca Phone v24.0 Elite - Master Controller
 * Design System: iPhone 15 Pro Max (iOS 17)
 */

const phoneMaster = {
    isOpen: false,
    activeApp: null,
    isAnimating: false,
    bankData: { bank: 0, wallet: 0, name: 'Cidadão' },
    
    init() {
        console.log("Orca Phone v24.0 [Master Elite] Online");

        window.addEventListener('message', (event) => {
            const data = event.data;
            if (data.action === "open") this.open();
            if (data.action === "close") this.close();
            if (data.action === "updateStatus") this.updateStatus(data);
        });

        window.addEventListener('keydown', (event) => {
            if (event.key === "Escape") this.handleEscape();
        });

        // Configura o gesto de voltar universal
        document.getElementById('gesture-bar-home').addEventListener('click', () => {
            this.handleEscape();
        });

        // Inicializa ícones
        lucide.createIcons();
    },

    open() {
        if (this.isOpen || this.isAnimating) return;
        this.isOpen = true; this.isAnimating = true;

        const wrapper = document.getElementById('phone-wrapper');
        const container = document.getElementById('phone-container');
        
        wrapper.style.opacity = "1";
        wrapper.style.pointerEvents = "all";
        
        gsap.to(container, { 
            duration: 0.6, y: 0, opacity: 1, ease: "power4.out",
            onComplete: () => {
                this.isAnimating = false;
                this.notify("Master Elite v24.0", 3000);
            }
        });
    },

    close() {
        if (!this.isOpen || this.isAnimating) return;
        this.isAnimating = true;

        const wrapper = document.getElementById('phone-wrapper');
        const container = document.getElementById('phone-container');
        
        this.postToLua('closeHandshake', {});
        this.isOpen = false; 

        gsap.to(container, { 
            duration: 0.5, y: "110%", opacity: 0, ease: "power3.in",
            onComplete: () => {
                this.isAnimating = false;
                wrapper.style.opacity = "0";
                wrapper.style.pointerEvents = "none";
                if (this.activeApp) this.closeApp(true);
            }
        });
    },

    handleEscape() { (this.activeApp) ? this.closeApp() : this.close(); },

    postToLua(path, data) {
        fetch(`https://${GetParentResourceName()}/${path}`, {
            method: 'POST',
            body: JSON.stringify(data)
        }).catch(() => {});
    },

    updateStatus(data) {
        if (data.time) document.getElementById('clock-native').innerText = data.time;
    },

    notify(text, duration = 3000) {
        const di = document.getElementById('dynamic-island');
        const content = document.getElementById('di-content');
        if (!di || !content) return;
        
        gsap.to(di, { width: "24vh", height: "6vh", borderRadius: "2.5vh", duration: 0.5, ease: "back.out(1.5)" });
        content.innerText = text;
        gsap.fromTo(content, { opacity: 0, rotateX: 90 }, { opacity: 1, rotateX: 0, duration: 0.4, delay: 0.2 });

        setTimeout(() => {
            if (!this.isOpen) return;
            gsap.to(content, { opacity: 0, duration: 0.25 });
            gsap.to(di, { width: "13.5vh", height: "3.5vh", borderRadius: "999vh", duration: 0.5 });
        }, duration);
    },

    openApp(id) {
        if (this.activeApp || this.isAnimating) return;
        this.activeApp = id;
        const layer = document.getElementById('app-layer');
        if (!layer) return;
        
        layer.innerHTML = this.getAppTemplate(id);
        layer.classList.add('active'); // CSS Transition
        
        this.handleAppLoading(id);
        lucide.createIcons();
    },

    closeApp(instant = false) {
        const layer = document.getElementById('app-layer');
        if (!layer) return;
        layer.classList.remove('active');
        setTimeout(() => { layer.innerHTML = ''; this.activeApp = null; }, (instant ? 0 : 450));
    },

    getAppTemplate(id) {
        if (id === 'orcaBank') return this.getBankTemplate();
        return `
            <div class="flex flex-col h-full bg-[#000] text-white overflow-hidden font-['Outfit']">
                <div class="px-[4vh] pt-[8.5vh] pb-[2vh] flex items-center gap-[2vh] border-b border-white/5 bg-black/40 backdrop-blur-3xl">
                    <div class="w-[5vh] h-[5vh] rounded-[1.6vh] bg-white/5 flex items-center justify-center cursor-pointer active:scale-90" onclick="phoneMaster.closeApp()">
                        <i data-lucide="chevron-left" class="w-[3vh] h-[3vh]"></i>
                    </div>
                    <h1 class="text-[2vh] font-black uppercase tracking-widest">${id}</h1>
                </div>
                <div class="flex-grow flex items-center justify-center opacity-10">
                    <p class="font-black text-[1.4vh] tracking-[0.5em] uppercase">Orca Master OS</p>
                </div>
            </div>
        `;
    },

    getBankTemplate() {
        return `
            <div class="bank-app-container animator-ios-slide p-[3vh]">
                 <div class="flex flex-col gap-1 pt-[6vh] mb-[4vh]">
                    <span class="text-white/30 text-[0.8vh] font-black uppercase tracking-widest">Bem-vindo ao Elite Bank,</span>
                    <h1 id="bank-user" class="text-[3vh] font-black italic">...</h1>
                </div>

                <div class="bank-card mb-[4vh]">
                    <div class="flex justify-between items-start">
                         <div class="flex flex-col gap-0.5">
                            <span class="text-white/40 text-[0.9vh] font-black uppercase tracking-widest">Saldo Atual</span>
                            <h2 id="bank-val" class="text-[4.5vh] font-black tracking-tighter italic">$ 0</h2>
                         </div>
                         <i data-lucide="waves" class="text-cyan-200"></i>
                    </div>
                </div>

                <div class="flex flex-col gap-4">
                    <input type="number" id="bank-amt" placeholder="VALOR PIX $" class="bg-white/5 border border-white/10 p-5 rounded-[2.5vh] text-white font-bold text-[1.4vh]">
                    <input type="number" id="bank-pid" placeholder="ID DO DESTINATÁRIO" class="bg-white/5 border border-white/10 p-5 rounded-[2.5vh] text-white font-bold text-[1.4vh]">
                    <button onclick="phoneMaster.bankAction('transfer')" class="w-full h-[8vh] bg-cyan-500 text-black font-black text-[1.8vh] rounded-[3vh] active:scale-95 transition-all">ENVIAR PIX</button>
                    <div class="flex gap-4">
                        <button onclick="phoneMaster.bankAction('deposit')" class="flex-grow h-[7vh] bg-white/5 border border-white/10 text-white font-bold rounded-[2.5vh] active:bg-white/10">DEPÓSITO</button>
                        <button onclick="phoneMaster.bankAction('withdraw')" class="flex-grow h-[7vh] bg-white/5 border border-white/10 text-white font-bold rounded-[2.5vh] active:bg-white/10">SACAR</button>
                    </div>
                </div>
            </div>
        `;
    },

    async handleAppLoading(id) {
        if (id === 'orcaBank') {
            const resp = await fetch(`https://${GetParentResourceName()}/getBankData`, { method: 'POST', body: '{}' }).catch(() => null);
            if (resp) {
                const data = await resp.json();
                document.getElementById('bank-user').innerText = data.name || 'Cidadão';
                document.getElementById('bank-val').innerText = `$ ${data.bank.toLocaleString('pt-BR')}`;
            }
        }
    },

    bankAction(type) {
        const id = document.getElementById('bank-pid')?.value;
        const amt = document.getElementById('bank-amt')?.value;
        this.postToLua('bankAction', { type, id, amt });
        this.notify("Processando Transação...", 2500);
        setTimeout(() => this.closeApp(), 2600);
    }
};

// HELPER GLOBAL para o onclick do HTML
const openApp = (id) => phoneMaster.openApp(id);

document.addEventListener('DOMContentLoaded', () => phoneMaster.init());
