import Vue from 'vue'
import VueRouter from 'vue-router'
import Signup from './components/signup'
import Game from './components/game'
import Pay from './components/pay'
import auth from './auth'

Vue.use(VueRouter)

function requireAuth(to, from, next) {
	if (!auth.loggedIn()) {
		next({
			path: '/login',
		})
	} else {
		next()
	}
}

const router=new VueRouter({
	routes:[
		{path:'/', component:Signup},
		{path:'/login',component:Signup},
		{path:'/game',component:Game, beforeEnter:requireAuth, name:'game'},
		{path:'/pay', component:Pay, beforeEnter:requireAuth},
		{ path: '/logout',
			beforeEnter (to, from, next) {
				auth.logout()
				next('/')
			}
		}
	] 
});

export default router;

