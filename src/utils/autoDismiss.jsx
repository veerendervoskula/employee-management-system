/**
 * Auto-dismiss a state property after a given timeout.
 * @param {Function} setState - The component's setState function.
 * @param {string} key - The key in state to clear.
 * @param {number} timeout - Time in milliseconds (default: 10000).
 */
export const autoDismiss = (setState, key, timeout = 10000) => {
    if (key) {
        setTimeout(() => {
            setState(prevState => ({
                ...prevState,
                [key]: null
            }));
        }, timeout);
    }

};