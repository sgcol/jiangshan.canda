<template>
	<div>
		<b-card v-show="loginMode===false" class="text-center" style="max-width:28rem; margin:38px; padding:0px 30px;" tag="article">
			<p class="title">注册</p>
			<p class="description">已有账号？请直接<a href="#" @click="loginMode=!loginMode">登录</a></p>
			<b-form>
				<b-form-group>
					<b-form-input required placeholder="请输入账号" v-model="name" :state="chkName" aria-describedby="input-live-help input-live-feedback"></b-form-input>
					<b-form-invalid-feedback id="input-live-feedback"></b-form-invalid-feedback>
					<b-form-text class="text-left" id="input-live-help">请使用邮箱或手机号作为账号</b-form-text>
				</b-form-group>
				<b-form-group>
					<b-form-input required type="password" placeholder="请输入密码" v-model="pass" :state="chkPass"></b-form-input>
					<b-form-invalid-feedback id="input-live-feedback" class="text-left">至少6个字符</b-form-invalid-feedback>
				</b-form-group>
				<b-form-group>
					<b-form-input type="password" placeholder="请确认密码" v-model="confirm_pass" :state="chkCfmPass"></b-form-input>
					<b-form-invalid-feedback id="input-live-feedback" class="text-left">必须与密码一致</b-form-invalid-feedback>
				</b-form-group>
				<b-form-group>
					<b-button  type="submit" variant="primary" style="min-width:10.3rem; color:white" @click="reg">注册</b-button>
				</b-form-group> 
			</b-form>
		</b-card>
		<b-card v-show="loginMode===true" class="text-center" style="max-width:28rem; margin:38px; padding:0px 30px;" tag="article">
			<p class="title">安全登录</p>
			<p class="description">还没有账号？立即<a href="#" @click="loginMode=!loginMode">注册</a></p>
			<b-form>
				<b-form-group>
					<b-form-input placeholder="请输入账号" v-model="name" :state="chkName"></b-form-input>
					<b-form-text class="text-left" id="input-live-help">邮箱或手机号</b-form-text>
				</b-form-group>
				<b-form-group>
					<b-form-input type="password" placeholder="请输入密码" v-model="pass" :state="chkPass"></b-form-input>
					<b-form-invalid-feedback id="input-live-feedback" class="text-left">至少6个字符</b-form-invalid-feedback>
				</b-form-group>
				<b-form-group>
					<b-button  variant="primary" style="min-width:10.3rem; color:white" @click="login">登录</b-button>
				</b-form-group> 
			</b-form>
		</b-card>
		<b-navbar fixed="bottom" type="dark" variant="primary">
			<b-navbar-brand>上海光游网络科技有限公司 copyright 2020.
			</b-navbar-brand>
		</b-navbar>
	</div>
</template>

<script>
import {serverpath} from "../etc"
import {post} from "vue-xhr"
import md5 from 'md5'
import url from 'url'
import router from '../router'

export default {
	name: 'Signup',
	components: {
	},
	computed:{
		chkName() {
			if (!this.name) return null;
			if (this.name.indexOf('@')>0) return true;
			if (this.name.length==11 && /^\d+$/.test(this.name)) return true;
			return false;
		},
		chkPass() {
			return this.pass?(this.pass.length>=6):null;
		},
		chkCfmPass() {
			return this.confirm_pass?(this.pass==this.confirm_pass):null;
		}
	},
	data() {
		return {
			loginMode:null,
			name:null,
			pass:null,
			confirm_pass:null
		}
	},
	methods:{
		async reg(e) {
			e.preventDefault();
			try {
				var reg_url=Object.assign({}, serverpath);
				reg_url.query=null;
				reg_url.search='';
				reg_url.pathname=url.resolve(reg_url.pathname, 'reg');
				var {data}=await post(url.format(reg_url), {name:this.name, pass:this.pass});
			} catch(e) {
				return alert(e);
			}
			if (data.err) return alert(data.err);
			localStorage.setItem('name', this.name);
			sessionStorage.setItem('logined', this.name);
			this.launchGame();			
		},
		async login(e) {
			e.preventDefault();
			var name=this.name, pass=this.pass;
			try {
				var salt_url=Object.assign({}, serverpath);
				salt_url.query=null;
				salt_url.search='';
				salt_url.pathname=url.resolve(salt_url.pathname, 'salt');
				var {data}=await post(url.format(salt_url), {name});
				if (data.err) return alert(data.err);
				var pwd=md5(''+data.message+pass);

				var login_url=Object.assign({}, serverpath);
				login_url.query=null;
				login_url.search='';
				login_url.pathname=url.resolve(login_url.pathname, 'login');
				var ret=await post(url.format(login_url), {name, pwd:pwd});
				if (ret.data.err) return alert(ret.data.err);
			} catch(e) {
				return alert(e);
			}
			localStorage.setItem('name', this.name);
			sessionStorage.setItem('logined', this.name);
			this.launchGame();
		},
		launchGame() {
			router.push({name:'game', params:{name:this.name}});
		}
	},
	mounted() {
		this.name=localStorage.getItem('name');
		this.loginMode=!!this.name;
	}
}
</script>

<style scoped>
.title {
	font-size:18px;
	color:#ff9933;
}
.description {
	font-size:14px;
	color:#666666;
}
</style>
