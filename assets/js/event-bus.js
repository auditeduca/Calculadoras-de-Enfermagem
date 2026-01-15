/**
 * EventBus - Sistema de Comunicação entre Módulos
 * Implementação de Publisher/Subscriber para comunicação desacoplada
 * Version: 1.0.0
 */
(function() {
    "use strict";

    // ============================================
    // CONFIGURAÇÕES E CONSTANTES
    // ============================================
    const CONFIG = {
        namespaceSeparator: ':',
        wildcard: '*',
        maxListeners: 50
    };

    // ============================================
    // ESTADO DO EVENTBUS
    // ============================================
    const state = {
        listeners: new Map(), // Map<eventName, Set<listener>>
        onceListeners: new Map(), // Map<eventName, Set<listener>>
        eventHistory: [], // Histórico de eventos para debugging
        maxHistoryLength: 100,
        initialized: false,
        debugMode: false
    };

    // ============================================
    // UTILITÁRIOS
    // ============================================
    function log(message, type = 'info', data = null) {
        const prefix = '[EventBus]';
        const logMethod = console[type] || console.log;
        if (data) {
            logMethod(`${prefix} ${message}`, data);
        } else {
            logMethod(`${prefix} ${message}`);
        }
    }

    function formatEventName(eventName) {
        if (typeof eventName !== 'string' || eventName.trim() === '') {
            throw new Error('Event name must be a non-empty string');
        }
        return eventName.trim().toLowerCase();
    }

    function parseNamespace(eventName) {
        const parts = eventName.split(CONFIG.namespaceSeparator);
        return {
            full: eventName,
            base: parts[0],
            namespace: parts.length > 1 ? parts.slice(1).join(CONFIG.namespaceSeparator) : null,
            parts: parts
        };
    }

    function isMatch(pattern, eventName) {
        // Caso exato
        if (pattern === eventName) return true;
        
        // Wildcard em todo o padrão
        if (pattern === CONFIG.wildcard) return true;
        
        // Parse dos namespaces
        const patternParts = parseNamespace(pattern);
        const eventParts = parseNamespace(eventName);
        
        // Matcher de padrão com wildcard no base
        if (patternParts.base === CONFIG.wildcard && !patternParts.namespace) {
            return true;
        }
        
        // Matcher com namespace wildcard
        if (patternParts.base === eventParts.base) {
            if (!patternParts.namespace || patternParts.namespace === CONFIG.wildcard) {
                return true;
            }
            
            // Comparação de namespace específica
            const patternNS = patternParts.parts.slice(1);
            const eventNS = eventParts.parts.slice(1);
            
            if (patternNS.length !== eventNS.length) return false;
            
            return patternNS.every((part, index) => 
                part === CONFIG.wildcard || part === eventNS[index]
            );
        }
        
        return false;
    }

    // ============================================
    // GERENCIAMENTO DE LISTENERS
    // ============================================
    function addListener(eventName, listener, options = {}) {
        const formattedEvent = formatEventName(eventName);
        const map = options.once ? state.onceListeners : state.listeners;
        
        if (!map.has(formattedEvent)) {
            map.set(formattedEvent, new Set());
        }
        
        const listeners = map.get(formattedEvent);
        
        // Verificar limite de listeners
        if (listeners.size >= CONFIG.maxListeners) {
            log(`Maximum listeners (${CONFIG.maxListeners}) reached for event: ${eventName}`, 'warn');
            return false;
        }
        
        // Verificar duplicata
        for (const existing of listeners) {
            if (existing === listener || (existing.callback && existing.callback === listener.callback)) {
                log(`Listener already registered for event: ${eventName}`, 'warn');
                return false;
            }
        }
        
        const listenerWrapper = {
            callback: listener,
            context: options.context || null,
            priority: options.priority || 0,
            id: generateListenerId(),
            module: options.module || detectModule()
        };
        
        listeners.add(listenerWrapper);
        
        // Manter ordem de prioridade
        if (options.priority !== undefined) {
            const sorted = Array.from(listeners).sort((a, b) => b.priority - a.priority);
            listeners.clear();
            sorted.forEach(l => listeners.add(l));
        }
        
        log(`Listener added for event: ${eventName}`, 'debug', { module: listenerWrapper.module });
        return true;
    }

    function removeListener(eventName, listener) {
        const formattedEvent = formatEventName(eventName);
        
        // Remover de listeners normais
        if (state.listeners.has(formattedEvent)) {
            const listeners = state.listeners.get(formattedEvent);
            for (const wrapper of listeners) {
                if (wrapper.callback === listener || (wrapper.callback.callback && wrapper.callback.callback === listener)) {
                    listeners.delete(wrapper);
                    log(`Listener removed from event: ${eventName}`, 'debug');
                    return true;
                }
            }
        }
        
        // Remover de listeners once
        if (state.onceListeners.has(formattedEvent)) {
            const listeners = state.onceListeners.get(formattedEvent);
            for (const wrapper of listeners) {
                if (wrapper.callback === listener || (wrapper.callback.callback && wrapper.callback.callback === listener)) {
                    listeners.delete(wrapper);
                    log(`Once-listener removed from event: ${eventName}`, 'debug');
                    return true;
                }
            }
        }
        
        return false;
    }

    function getListeners(eventName) {
        const formattedEvent = formatEventName(eventName);
        const result = [];
        
        // Listeners específicos
        if (state.listeners.has(formattedEvent)) {
            result.push(...state.listeners.get(formattedEvent));
        }
        
        // Listeners once específicos
        if (state.onceListeners.has(formattedEvent)) {
            result.push(...state.onceListeners.get(formattedEvent));
        }
        
        // Listeners com padrão wildcard
        for (const [pattern, listeners] of state.listeners) {
            if (pattern !== formattedEvent && isMatch(pattern, formattedEvent)) {
                result.push(...listeners);
            }
        }
        
        for (const [pattern, listeners] of state.onceListeners) {
            if (pattern !== formattedEvent && isMatch(pattern, formattedEvent)) {
                result.push(...listeners);
            }
        }
        
        return result;
    }

    function generateListenerId() {
        return 'listener_' + Math.random().toString(36).substr(2, 9);
    }

    function detectModule() {
        // Tentar detectar qual módulo está chamando
        const stack = new Error().stack;
        if (stack) {
            const matches = stack.match(/(\w+)\.js/);
            if (matches && matches[1]) {
                return matches[1];
            }
        }
        return 'unknown';
    }

    // ============================================
    // ARMAZENAMENTO DE HISTÓRICO
    // ============================================
    function addToHistory(eventName, data, source) {
        const entry = {
            event: eventName,
            data: data,
            source: source,
            timestamp: Date.now()
        };
        
        state.eventHistory.push(entry);
        
        // Limitar histórico
        if (state.eventHistory.length > state.maxHistoryLength) {
            state.eventHistory.shift();
        }
    }

    function getHistory(filter = null) {
        if (!filter) {
            return [...state.eventHistory];
        }
        
        return state.eventHistory.filter(entry => {
            if (typeof filter === 'string') {
                return entry.event.includes(filter);
            }
            if (filter.event && entry.event !== filter.event) return false;
            if (filter.source && entry.source !== filter.source) return false;
            if (filter.since && entry.timestamp < filter.since) return false;
            return true;
        });
    }

    // ============================================
    // API PÚBLICA DO EVENTBUS
    // ============================================
    const EventBus = {
        /**
         * Inicializa o EventBus
         */
        init() {
            if (state.initialized) {
                log('EventBus already initialized', 'warn');
                return this;
            }
            
            state.initialized = true;
            log('EventBus initialized successfully');
            
            // Disparar evento de ready
            this.emit('eventbus:ready', { timestamp: Date.now() });
            
            return this;
        },

        /**
         * Subscribe to an event
         * @param {string} eventName - Event name (can use namespaces like 'theme:changed')
         * @param {Function} callback - Callback function
         * @param {Object} options - Options (context, priority, module)
         * @returns {boolean} Success status
         */
        on(eventName, callback, options = {}) {
            return addListener(eventName, callback, { ...options, once: false });
        },

        /**
         * Subscribe to an event once (auto-removes after execution)
         * @param {string} eventName - Event name
         * @param {Function} callback - Callback function
         * @param {Object} options - Options
         * @returns {boolean} Success status
         */
        once(eventName, callback, options = {}) {
            return addListener(eventName, callback, { ...options, once: true });
        },

        /**
         * Unsubscribe from an event
         * @param {string} eventName - Event name
         * @param {Function} callback - Callback to remove
         * @returns {boolean} Success status
         */
        off(eventName, callback) {
            return removeListener(eventName, callback);
        },

        /**
         * Emit/publish an event
         * @param {string} eventName - Event name
         * @param {any} data - Event data
         * @param {Object} options - Options (async, source)
         * @returns {Promise<Array>} Results from all listeners
         */
        emit(eventName, data = {}, options = {}) {
            const formattedEvent = formatEventName(eventName);
            const source = options.source || detectModule();
            
            // Adicionar ao histórico
            addToHistory(formattedEvent, data, source);
            
            log(`Emitting event: ${eventName}`, 'debug', { source, data });
            
            const listeners = getListeners(formattedEvent);
            const results = [];
            
            if (options.async) {
                return Promise.all(
                    listeners.map(wrapper => {
                        try {
                            const result = wrapper.callback(data, {
                                event: formattedEvent,
                                source: source,
                                listener: wrapper
                            });
                            
                            // Remover listeners once após execução
                            if (state.onceListeners.has(formattedEvent)) {
                                state.onceListeners.get(formattedEvent).delete(wrapper);
                                if (state.onceListeners.get(formattedEvent).size === 0) {
                                    state.onceListeners.delete(formattedEvent);
                                }
                            }
                            
                            return result;
                        } catch (error) {
                            log(`Error in listener for ${eventName}: ${error.message}`, 'error', error);
                            return Promise.reject(error);
                        }
                    })
                );
            } else {
                listeners.forEach(wrapper => {
                    try {
                        const result = wrapper.callback(data, {
                            event: formattedEvent,
                            source: source,
                            listener: wrapper
                        });
                        results.push(result);
                        
                        // Remover listeners once após execução
                        if (state.onceListeners.has(formattedEvent)) {
                            state.onceListeners.get(formattedEvent).delete(wrapper);
                            if (state.onceListeners.get(formattedEvent).size === 0) {
                                state.onceListeners.delete(formattedEvent);
                            }
                        }
                    } catch (error) {
                        log(`Error in listener for ${eventName}: ${error.message}`, 'error', error);
                        results.push({ error: error.message });
                    }
                });
                
                return results;
            }
        },

        /**
         * Emit event asynchronously
         * @param {string} eventName - Event name
         * @param {any} data - Event data
         * @param {string} source - Source module name
         * @returns {Promise<Array>} Results from all listeners
         */
        emitAsync(eventName, data = {}, source = null) {
            return this.emit(eventName, data, { async: true, source });
        },

        /**
         * Check if event has listeners
         * @param {string} eventName - Event name
         * @returns {boolean}
         */
        hasListeners(eventName) {
            const listeners = getListeners(eventName);
            return listeners.length > 0;
        },

        /**
         * Get all registered event names
         * @returns {Array<string>}
         */
        getEventNames() {
            const events = new Set([
                ...state.listeners.keys(),
                ...state.onceListeners.keys()
            ]);
            return Array.from(events);
        },

        /**
         * Get listener count for an event
         * @param {string} eventName - Event name
         * @returns {number}
         */
        listenerCount(eventName) {
            const listeners = getListeners(eventName);
            return listeners.length;
        },

        /**
         * Remove all listeners for an event or all events
         * @param {string} eventName - Event name (optional)
         */
        removeAllListeners(eventName = null) {
            if (eventName) {
                const formattedEvent = formatEventName(eventName);
                state.listeners.delete(formattedEvent);
                state.onceListeners.delete(formattedEvent);
                log(`All listeners removed for event: ${eventName}`);
            } else {
                state.listeners.clear();
                state.onceListeners.clear();
                log('All listeners removed');
            }
        },

        /**
         * Get event history
         * @param {Object} filter - Filter options
         * @returns {Array}
         */
        getHistory(filter = null) {
            return getHistory(filter);
        },

        /**
         * Enable/disable debug mode
         * @param {boolean} enabled
         */
        setDebug(enabled) {
            state.debugMode = enabled;
            log(`Debug mode ${enabled ? 'enabled' : 'disabled'}`);
        },

        /**
         * Get internal state for debugging
         * @returns {Object}
         */
        getState() {
            return {
                initialized: state.initialized,
                eventCount: state.listeners.size + state.onceListeners.size,
                historyLength: state.eventHistory.length,
                events: this.getEventNames()
            };
        },

        /**
         * Wait for an event to be emitted once
         * @param {string} eventName - Event name
         * @param {number} timeout - Timeout in ms
         * @returns {Promise}
         */
        waitFor(eventName, timeout = 5000) {
            return new Promise((resolve, reject) => {
                const timer = timeout > 0 ? setTimeout(() => {
                    this.off(eventName, handler);
                    reject(new Error(`Timeout waiting for event: ${eventName}`));
                }, timeout) : null;

                const handler = (data) => {
                    if (timer) clearTimeout(timer);
                    this.off(eventName, handler);
                    resolve(data);
                };

                this.once(eventName, handler);
            });
        },

        /**
         * Create a namespaced EventBus
         * @param {string} namespace - Namespace prefix
         * @returns {Object} Namespaced EventBus
         */
        namespace(namespace) {
            const ns = namespace + CONFIG.namespaceSeparator;
            return {
                on: (event, callback, options) => this.on(ns + event, callback, options),
                once: (event, callback, options) => this.once(ns + event, callback, options),
                off: (event, callback) => this.off(ns + event, callback),
                emit: (event, data, options) => this.emit(ns + event, data, options),
                hasListeners: (event) => this.hasListeners(ns + event),
                listenerCount: (event) => this.listenerCount(ns + event),
                removeAllListeners: (event) => this.removeAllListeners(event ? ns + event : null)
            };
        }
    };

    // ============================================
    // EXPOSIÇÃO GLOBAL
    // ============================================
    window.EventBus = EventBus;
    
    // Alias para facilitar uso
    window.PubSub = EventBus;
    window.publish = EventBus.emit.bind(EventBus);
    window.subscribe = EventBus.on.bind(EventBus);
    window.unsubscribe = EventBus.off.bind(EventBus);

    // ============================================
    // INICIALIZAÇÃO AUTOMÁTICA
    // ============================================
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', () => setTimeout(() => EventBus.init(), 10));
    } else {
        setTimeout(() => EventBus.init(), 10);
    }

    // ============================================
    // FIM DO MÓDULO
    // ============================================
})();
