import router from './router'

export default {
    loggedIn() {
        return !!sessionStorage.logined;
    },
    logout() {
        delete sessionStorage.logined;
    },
    stdret(cb) {
        return function(err) {
            if (err && err=='access denied') {
                delete sessionStorage.logged;
                router.push('/login');
            }
            else cb.apply(null, arguments);
        }
    }
}