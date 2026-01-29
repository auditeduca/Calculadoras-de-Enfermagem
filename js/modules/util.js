const UTIL = {
    validateInputs(containerId) {
        const fields = document.querySelectorAll(`#${containerId} input[required], #patient_name, #patient_dob`);
        let isValid = true;
        
        fields.forEach(f => {
            if (!f.value || (f.type === 'number' && parseFloat(f.value) < 0)) {
                f.classList.add('error', 'animate-shake');
                isValid = false;
                setTimeout(() => f.classList.remove('animate-shake'), 400);
            } else {
                f.classList.remove('error');
            }
        });

        const dobInput = document.getElementById('patient_dob');
        if (dobInput.value && dobInput.value.length !== 4) {
            dobInput.classList.add('error');
            isValid = false;
        }

        if (!isValid) VOICE.speak("Verifique os campos obrigatórios e valores negativos.");
        return isValid;
    },

    getAge(year) {
        const current = new Date().getFullYear();
        const age = current - parseInt(year);
        if (age < 0 || age > 120) {
            CORE.notify("Idade incoerente detetada!", "error");
            return null;
        }
        return age;
    },

    checkAnomalous(value, type) {
        if (type === 'insulina' && value > 100) {
            CORE.notify("Alerta: Dose de insulina elevada (>100UI)!", "error");
            VOICE.speak("Atenção: Dose de insulina superior a cem unidades detetada.");
        }
    }
};

// Listener para cálculo automático de idade no input
document.addEventListener('input', (e) => {
    if (e.target.id === 'patient_dob' && e.target.value.length === 4) {
        const age = UTIL.getAge(e.target.value);
        const badge = document.getElementById('age-badge');
        if (badge && age !== null) badge.innerText = `${age} anos`;
    }
});