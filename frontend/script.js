// =========================
// CONFIGURATION
// =========================
const API_BASE_URL = 'https://2b4b-154-72-153-100.ngrok-free.app/api/v1';  // URL absolue du backend
const API_KEY = "pk_4718c4780eadc86927119c3d3d47475baeb9fbf289ce9b32"; // Ta clé API
const AMOUNT = 100;       // 💰 100 FCFA pour les tests, passer à 10000 plus tard

let selectedGateway = 'CM_ORANGE';
let timerInterval = null;
let timeLeft = 120;

// =========================
// DROPDOWN
// =========================
function toggleDropdown() {
    const dropdown = document.getElementById('dropdown');
    dropdown.style.display = dropdown.style.display === 'flex' ? 'none' : 'flex';
}

function selectOption(value) {
    selectedGateway = value;
    document.getElementById('selected').innerText = value === 'CM_ORANGE' ? 'Orange Money' : 'MTN Money';
    document.getElementById('dropdown').style.display = 'none';
}

window.onclick = function (event) {
    if (!event.target.closest('.select-container')) {
        document.getElementById('dropdown').style.display = 'none';
    }
};

function cancelPayment() {
    document.getElementById('phone').value = '';
}

// =========================
// TIMER
// =========================
function formatTime(seconds) {
    const min = Math.floor(seconds / 60);
    const sec = seconds % 60;
    return `${min}:${sec < 10 ? '0' : ''}${sec}`;
}

function startTimer() {
    stopTimer();
    timeLeft = 120;
    timerInterval = setInterval(() => {
        timeLeft--;
        document.getElementById('modal-timer').innerText = formatTime(timeLeft);
        if (timeLeft <= 0) {
            stopTimer();
            openModal("Temps expiré. Veuillez relancer le paiement", false);
        }
    }, 1000);
}

function stopTimer() {
    if (timerInterval) {
        clearInterval(timerInterval);
        timerInterval = null;
    }
}

// =========================
// MODAL
// =========================
function openModal(message, loading = true) {
    const modal = document.getElementById('modal');
    modal.style.display = 'flex';
    document.getElementById('modal-text').innerText = message;
    document.getElementById('modal-loader').style.display = loading ? 'block' : 'none';
    document.getElementById('modal-close').style.display = loading ? 'none' : 'inline-block';
    document.getElementById('modal-amount').innerText = `${AMOUNT.toLocaleString()} FCFA`;
}

function closeModal() {
    document.getElementById('modal').style.display = 'none';
    stopTimer();
}

function getInstruction() {
    return selectedGateway === 'CM_ORANGE'
        ? "Tapez #150*50# puis validez votre transaction sur votre téléphone"
        : "Tapez *126# puis validez votre paiement";
}

// =========================
// POLLING STATUT
// =========================
async function pollStatus(reference) {
    const interval = setInterval(async () => {
        try {
            const res = await fetch(`${API_BASE_URL}/payments/status/${reference}`);
            const data = await res.json();
            if (data.success && data.data.status === 'SUCCESS') {
                clearInterval(interval);
                stopTimer();
                openModal("✅ Paiement confirmé ! Merci.", false);
            } else if (data.data.status === 'FAILED') {
                clearInterval(interval);
                stopTimer();
                openModal("❌ Paiement échoué. Contactez votre opérateur.", false);
            }
        } catch (e) {
            console.warn("Polling error", e);
        }
    }, 3000);
}

// =========================
// PAIEMENT
// =========================
async function pay() {
    const phoneInput = document.getElementById('phone').value.replace(/\s/g, '');
    if (!phoneInput || phoneInput.length < 9) {
        openModal("Numéro invalide (9 chiffres requis)", false);
        return;
    }

    let fullPhone = phoneInput;
    if (!phoneInput.startsWith('237') && !phoneInput.startsWith('+237')) {
        fullPhone = '237' + phoneInput;
    }

    openModal(getInstruction(), true);
    startTimer();

    try {
        const response = await fetch(`${API_BASE_URL}/payments/initiate`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'x-api-key': API_KEY
            },
            body: JSON.stringify({
                amount: AMOUNT,
                customer_phone: fullPhone,
                operator: selectedGateway === 'CM_ORANGE' ? 'ORANGE' : 'MTN',
                metadata: { source: 'web_widget' }
            })
        });

        const text = await response.text();
        console.log("Raw response:", text);

        let data;
        try {
            data = JSON.parse(text);
        } catch (e) {
            throw new Error("Le serveur a répondu avec un format invalide (non-JSON)");
        }

        if (!response.ok || !data.success) {
            throw new Error(data.message || "Échec de l'initiation");
        }

        const reference = data.data.reference;
        console.log("Transaction créée :", reference);

        stopTimer();
        openModal("Paiement en cours... Vérifiez votre téléphone", false);
        pollStatus(reference);

    } catch (err) {
        console.error("Erreur:", err);
        stopTimer();
        openModal("Erreur : " + err.message + ". Veuillez réessayer", false);
    }
}