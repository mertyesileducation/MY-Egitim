const Pomodoro = {
    calismaSaniyesi: 25 * 60,
    molaSaniyesi: 5 * 60,
    kalanSaniye: 25 * 60,
    zamanlayici: null,
    durum: 'calisma',
    toplamSeans: 0,

    formatZaman: function(saniye) {
        const dk = Math.floor(saniye / 60).toString().padStart(2, '0');
        const sn = (saniye % 60).toString().padStart(2, '0');
        return `${dk}:${sn}`;
    },

    baslatDurdur: function(guncellemeCallback) {
        if (this.zamanlayici) {
            clearInterval(this.zamanlayici);
            this.zamanlayici = null;
            return false;
        } else {
            this.zamanlayici = setInterval(() => {
                if (this.kalanSaniye > 0) {
                    this.kalanSaniye--;
                } else {
                    this.sesCal();
                    if (this.durum === 'calisma') this.toplamSeans++;
                    this.durumDegistir();
                }
                if (guncellemeCallback) {
                    guncellemeCallback(this.formatZaman(this.kalanSaniye), this.durum, this.getOran(), this.toplamSeans);
                }
            }, 1000);
            return true;
        }
    },

    getOran: function() {
        const toplam = this.durum === 'calisma' ? this.calismaSaniyesi : this.molaSaniyesi;
        return (toplam - this.kalanSaniye) / toplam;
    },

    durumDegistir: function() {
        if (this.durum === 'calisma') {
            this.durum = 'mola';
            this.kalanSaniye = this.molaSaniyesi;
        } else {
            this.durum = 'calisma';
            this.kalanSaniye = this.calismaSaniyesi;
        }
    },

    sifirla: function() {
        if (this.zamanlayici) {
            clearInterval(this.zamanlayici);
            this.zamanlayici = null;
        }
        this.durum = 'calisma';
        this.kalanSaniye = this.calismaSaniyesi;
        return this.formatZaman(this.kalanSaniye);
    },

    sesCal: function() {
        try {
            const ctx = new (window.AudioContext || window.webkitAudioContext)();
            const osc = ctx.createOscillator();
            osc.type = 'sine';
            osc.frequency.setValueAtTime(880, ctx.currentTime);
            osc.connect(ctx.destination);
            osc.start();
            osc.stop(ctx.currentTime + 0.5);
        } catch(e) {}
    }
};

const timerDisplay = document.getElementById('timerDisplay');
const statusBadge = document.getElementById('statusBadge');
const startBtn = document.getElementById('startBtn');
const progressCircle = document.getElementById('progressCircle');
const streakCount = document.getElementById('streakCount');
const circleCevre = 2 * Math.PI * 85; // 534

function setProgress(oran, durum) {
    const offset = circleCevre - (oran * circleCevre);
    progressCircle.style.strokeDashoffset = offset;
    progressCircle.style.stroke = durum === 'calisma' ? '#238636' : '#1f6feb';
}

function setPreset(calismaMins, molaMins, btn) {
    document.querySelectorAll('.mode-btn').forEach(b => b.classList.remove('active'));
    btn.classList.add('active');

    Pomodoro.calismaSaniyesi = calismaMins * 60;
    Pomodoro.molaSaniyesi = molaMins * 60;
    sifirlaTetikle();
}

function baslatTetikle() {
    const calisiyor = Pomodoro.baslatDurdur((zaman, durum, oran, seans) => {
        timerDisplay.innerText = zaman;
        setProgress(oran, durum);
        streakCount.innerText = seans;
        
        if (durum === 'calisma') {
            statusBadge.innerText = 'ODAKLANMA';
            statusBadge.classList.remove('mola');
        } else {
            statusBadge.innerText = 'MOLA';
            statusBadge.classList.add('mola');
        }
    });

    if (calisiyor) {
        startBtn.innerText = 'Duraklat';
        startBtn.classList.add('working');
    } else {
        startBtn.innerText = 'Devam Et';
        startBtn.classList.remove('working');
    }
}

function sifirlaTetikle() {
    const baslangicZamani = Pomodoro.sifirla();
    timerDisplay.innerText = baslangicZamani;
    statusBadge.innerText = 'ODAKLANMA';
    statusBadge.classList.remove('mola');
    startBtn.innerText = 'Başlat';
    startBtn.classList.remove('working');
    setProgress(0, 'calisma');
}
