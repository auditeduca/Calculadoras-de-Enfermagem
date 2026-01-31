/**
 * UTIL.JS - Funções Utilitárias do Sistema
 * Helpers para formatação, validação e operações comuns
 * 
 * @author Calculadoras de Enfermagem
 * @version 2.0.0
 */

class UtilityHelper {
  /**
   * Formatar número com casas decimais
   */
  static formatNumber(value, decimals = 2) {
    return parseFloat(value).toFixed(decimals);
  }

  /**
   * Formatar número como moeda
   */
  static formatCurrency(value, currency = 'BRL') {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: currency
    }).format(value);
  }

  /**
   * Formatar data
   */
  static formatDate(date, format = 'DD/MM/YYYY') {
    const d = new Date(date);
    const day = String(d.getDate()).padStart(2, '0');
    const month = String(d.getMonth() + 1).padStart(2, '0');
    const year = d.getFullYear();
    const hours = String(d.getHours()).padStart(2, '0');
    const minutes = String(d.getMinutes()).padStart(2, '0');
    const seconds = String(d.getSeconds()).padStart(2, '0');

    const formats = {
      'DD/MM/YYYY': `${day}/${month}/${year}`,
      'YYYY-MM-DD': `${year}-${month}-${day}`,
      'DD/MM/YYYY HH:mm': `${day}/${month}/${year} ${hours}:${minutes}`,
      'DD/MM/YYYY HH:mm:ss': `${day}/${month}/${year} ${hours}:${minutes}:${seconds}`,
      'HH:mm': `${hours}:${minutes}`,
      'HH:mm:ss': `${hours}:${minutes}:${seconds}`
    };

    return formats[format] || d.toLocaleString('pt-BR');
  }

  /**
   * Calcular idade a partir da data de nascimento
   */
  static calculateAge(birthDate) {
    const today = new Date();
    const birth = new Date(birthDate);
    let age = today.getFullYear() - birth.getFullYear();
    const monthDiff = today.getMonth() - birth.getMonth();

    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birth.getDate())) {
      age--;
    }

    return age;
  }

  /**
   * Validar email
   */
  static isValidEmail(email) {
    const regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return regex.test(email);
  }

  /**
   * Validar CPF
   */
  static isValidCPF(cpf) {
    cpf = cpf.replace(/\D/g, '');
    
    if (cpf.length !== 11 || /^(\d)\1{10}$/.test(cpf)) {
      return false;
    }

    let sum = 0;
    let remainder;

    for (let i = 1; i <= 9; i++) {
      sum += parseInt(cpf.substring(i - 1, i)) * (11 - i);
    }

    remainder = (sum * 10) % 11;
    if (remainder === 10 || remainder === 11) remainder = 0;
    if (remainder !== parseInt(cpf.substring(9, 10))) return false;

    sum = 0;
    for (let i = 1; i <= 10; i++) {
      sum += parseInt(cpf.substring(i - 1, i)) * (12 - i);
    }

    remainder = (sum * 10) % 11;
    if (remainder === 10 || remainder === 11) remainder = 0;
    if (remainder !== parseInt(cpf.substring(10, 11))) return false;

    return true;
  }

  /**
   * Formatar CPF
   */
  static formatCPF(cpf) {
    cpf = cpf.replace(/\D/g, '');
    return cpf.replace(/(\d{3})(\d{3})(\d{3})(\d{2})/, '$1.$2.$3-$4');
  }

  /**
   * Validar telefone
   */
  static isValidPhone(phone) {
    const regex = /^(\+55)?[\s]?(\(?\d{2}\)?[\s]?)?9?[\s]?\d{4}[\s]?\d{4}$/;
    return regex.test(phone.replace(/\D/g, ''));
  }

  /**
   * Formatar telefone
   */
  static formatPhone(phone) {
    phone = phone.replace(/\D/g, '');
    
    if (phone.length === 11) {
      return phone.replace(/(\d{2})(\d{5})(\d{4})/, '($1) $2-$3');
    } else if (phone.length === 10) {
      return phone.replace(/(\d{2})(\d{4})(\d{4})/, '($1) $2-$3');
    }
    
    return phone;
  }

  /**
   * Gerar UUID
   */
  static generateUUID() {
    return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
      const r = Math.random() * 16 | 0;
      const v = c === 'x' ? r : (r & 0x3 | 0x8);
      return v.toString(16);
    });
  }

  /**
   * Gerar hash simples
   */
  static generateHash(str) {
    let hash = 0;
    for (let i = 0; i < str.length; i++) {
      const char = str.charCodeAt(i);
      hash = ((hash << 5) - hash) + char;
      hash = hash & hash;
    }
    return Math.abs(hash).toString(16);
  }

  /**
   * Delay/Sleep
   */
  static delay(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  /**
   * Debounce
   */
  static debounce(func, wait) {
    let timeout;
    return function executedFunction(...args) {
      const later = () => {
        clearTimeout(timeout);
        func(...args);
      };
      clearTimeout(timeout);
      timeout = setTimeout(later, wait);
    };
  }

  /**
   * Throttle
   */
  static throttle(func, limit) {
    let inThrottle;
    return function(...args) {
      if (!inThrottle) {
        func.apply(this, args);
        inThrottle = true;
        setTimeout(() => inThrottle = false, limit);
      }
    };
  }

  /**
   * Deep Clone
   */
  static deepClone(obj) {
    if (obj === null || typeof obj !== 'object') return obj;
    if (obj instanceof Date) return new Date(obj.getTime());
    if (obj instanceof Array) return obj.map(item => this.deepClone(item));
    if (obj instanceof Object) {
      const clonedObj = {};
      for (const key in obj) {
        if (obj.hasOwnProperty(key)) {
          clonedObj[key] = this.deepClone(obj[key]);
        }
      }
      return clonedObj;
    }
  }

  /**
   * Mesclar objetos
   */
  static mergeObjects(target, source) {
    const output = { ...target };
    for (const key in source) {
      if (source.hasOwnProperty(key)) {
        if (typeof source[key] === 'object' && source[key] !== null) {
          output[key] = this.mergeObjects(output[key] || {}, source[key]);
        } else {
          output[key] = source[key];
        }
      }
    }
    return output;
  }

  /**
   * Verificar se objeto está vazio
   */
  static isEmpty(obj) {
    return Object.keys(obj).length === 0;
  }

  /**
   * Obter valor aninhado de objeto
   */
  static getNestedValue(obj, path, defaultValue = null) {
    const keys = path.split('.');
    let result = obj;

    for (const key of keys) {
      if (result && typeof result === 'object' && key in result) {
        result = result[key];
      } else {
        return defaultValue;
      }
    }

    return result;
  }

  /**
   * Definir valor aninhado em objeto
   */
  static setNestedValue(obj, path, value) {
    const keys = path.split('.');
    let current = obj;

    for (let i = 0; i < keys.length - 1; i++) {
      const key = keys[i];
      if (!(key in current) || typeof current[key] !== 'object') {
        current[key] = {};
      }
      current = current[key];
    }

    current[keys[keys.length - 1]] = value;
  }

  /**
   * Converter array para objeto com chave
   */
  static arrayToObject(array, keyField) {
    return array.reduce((obj, item) => {
      obj[item[keyField]] = item;
      return obj;
    }, {});
  }

  /**
   * Filtrar objeto por chaves
   */
  static filterObject(obj, keys) {
    return keys.reduce((filtered, key) => {
      if (key in obj) {
        filtered[key] = obj[key];
      }
      return filtered;
    }, {});
  }

  /**
   * Capitalizar primeira letra
   */
  static capitalize(str) {
    return str.charAt(0).toUpperCase() + str.slice(1).toLowerCase();
  }

  /**
   * Converter para slug
   */
  static toSlug(str) {
    return str
      .toLowerCase()
      .trim()
      .replace(/[^\w\s-]/g, '')
      .replace(/[\s_-]+/g, '-')
      .replace(/^-+|-+$/g, '');
  }

  /**
   * Truncar texto
   */
  static truncate(str, length = 100, suffix = '...') {
    if (str.length <= length) return str;
    return str.substring(0, length).trim() + suffix;
  }

  /**
   * Contar palavras
   */
  static countWords(str) {
    return str.trim().split(/\s+/).length;
  }

  /**
   * Verificar se está online
   */
  static isOnline() {
    return navigator.onLine;
  }

  /**
   * Obter informações do navegador
   */
  static getBrowserInfo() {
    const ua = navigator.userAgent;
    return {
      isMobile: /Mobile|Android|iPhone/.test(ua),
      isTablet: /iPad|Android/.test(ua),
      isChrome: /Chrome/.test(ua),
      isFirefox: /Firefox/.test(ua),
      isSafari: /Safari/.test(ua),
      isEdge: /Edge/.test(ua)
    };
  }

  /**
   * Obter tamanho da viewport
   */
  static getViewportSize() {
    return {
      width: window.innerWidth,
      height: window.innerHeight,
      isMobile: window.innerWidth < 768,
      isTablet: window.innerWidth >= 768 && window.innerWidth < 1024,
      isDesktop: window.innerWidth >= 1024
    };
  }

  /**
   * Verificar suporte a feature
   */
  static supportsFeature(feature) {
    const features = {
      localStorage: typeof Storage !== 'undefined',
      sessionStorage: typeof sessionStorage !== 'undefined',
      serviceWorker: 'serviceWorker' in navigator,
      notification: 'Notification' in window,
      vibration: 'vibrate' in navigator,
      geolocation: 'geolocation' in navigator,
      speechSynthesis: 'speechSynthesis' in window,
      speechRecognition: 'webkitSpeechRecognition' in window || 'SpeechRecognition' in window,
      clipboard: 'clipboard' in navigator,
      camera: 'mediaDevices' in navigator
    };

    return features[feature] || false;
  }
}

// Exportar para uso global
window.UtilityHelper = UtilityHelper;
window.Utils = UtilityHelper;
