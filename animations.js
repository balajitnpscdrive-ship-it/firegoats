/**
 * SPECIAL ANIMATIONS AND VISUAL EFFECTS
 */
const animations = {
    burstConfetti() {
        const count = 200;
        const defaults = {
            origin: { y: 0.7 },
            colors: ['#6366f1', '#a855f7', '#ec4899', '#ffffff']
        };
        function fire(particleRatio, opts) {
            confetti({
                ...defaults,
                ...opts,
                particleCount: Math.floor(count * particleRatio)
            });
        }
        fire(0.25, { spread: 26, startVelocity: 55 });
        fire(0.2, { spread: 60 });
        fire(0.35, { spread: 100, decay: 0.91, scalar: 0.8 });
        fire(0.1, { spread: 120, startVelocity: 25, decay: 0.92, scalar: 1.2 });
        fire(0.1, { spread: 120, startVelocity: 45 });
    },
    showSadFace() {
        const popup = document.createElement('div');
        popup.className = 'fixed inset-0 flex items-center justify-center pointer-events-none z-[101]';
        popup.innerHTML = `<div class="text-9xl animate-bounce">😢</div>`;
        document.body.appendChild(popup);
        
        gsap.to(popup, { opacity: 0, y: -100, duration: 1.5, delay: 0.5, onComplete: () => popup.remove() });
    },
    showPopup(student, house, points, wording) {
        const container = document.getElementById('popup-layer');
        const id = 'p-' + Date.now();
        
        const card = document.createElement('div');
        card.id = id;
        card.className = 'point-popup glass p-8 rounded-3xl border-2 border-white/20 shadow-2xl flex flex-col items-center gap-4 min-w-[320px] transition-all duration-500';
        
        const isPos = points > 0;
        const color = isPos ? '#10b981' : '#f43f5e';
        
        card.innerHTML = `
            <div class="w-20 h-20 rounded-full flex items-center justify-center text-white" style="background: ${color}">
                <i data-lucide="${isPos ? 'check-circle' : 'alert-circle'}" class="w-12 h-12"></i>
            </div>
            <div class="text-center">
                <div class="text-sm uppercase tracking-widest text-slate-400 font-bold mb-1">${wording}</div>
                <div class="text-4xl font-black italic mb-2">${isPos ? '+' : ''}${points} POINTS</div>
                <div class="h-px w-full bg-white/10 my-4"></div>
                <div class="text-xl font-bold">${student}</div>
                <div class="text-sm uppercase font-black" style="color: ${color}">${house} HOUSE</div>
            </div>
        `;
        
        container.appendChild(card);
        lucide.createIcons();
        
        // GSAP Animation
        gsap.fromTo(card, { y: 100, opacity: 0, scale: 0.8 }, { y: 0, opacity: 1, scale: 1, duration: 0.6, ease: 'back.out(1.7)' });
        
        setTimeout(() => {
            gsap.to(card, { x: 500, opacity: 0, duration: 0.4, onComplete: () => card.remove() });
        }, 3000);
    }
};
