<template>
<div class="w-100 h-100">
	<b-modal id="qr" hide-footer static>
		<template v-slot:modal-title>
			{{qr_method}}扫码
		</template>
		<canvas id="qrcode"></canvas>
	</b-modal>
	<div class="w-100 h-100 text-left">
		<div class="h-100 p-3 m-3 bg-white">
			<b-form class="h-100 border p-5">
				<b-overlay :show="longop" rounded="sm">
				<p>充值到《凡劫》 角色名{{name}}</p>
				<b-form-group class="mt-5">
					<b-form-radio-group
						required
						v-model="method"
						:options="[{text:'微信支付', value:'WECHATPAY'}, {text:'支付宝支付',value:'ALIPAY'}, {text:'ceshi', value:'ceshi'}]"
						buttons
						button-variant="radio methodselector"
						size='lg'
					>
					</b-form-radio-group>
				</b-form-group>

				<b-form-group class="mt-3">
				<b-form-radio-group
					required
					id="btn-radios-1"
					v-model="money"
					:options="[10, 50, 100, 500, 1000, 5000]"
					buttons
					name="radios-btn-default"
					button-variant="radio"
					size="lg"
				>
					<b-form-radio value="custom">
						<b-input-group>
							<b-form-input size="sm" style="max-width:80px" placeholder="其他金额" v-model="amount"></b-form-input>
							<b-input-group-append>
							元
							</b-input-group-append>
						</b-input-group>
					</b-form-radio>
				</b-form-radio-group>
				</b-form-group>
				<b-form-group class="mt-5 pt-3">
					<b-button type="submit" @click="pay" size="lg" variant="primary">提交支付</b-button>
				</b-form-group>
			</b-overlay>
			</b-form>
		</div>
	</div>
</div>
</template>

<script>
import url from 'url'
import {post} from "vue-xhr"
import {serverpath} from '../etc'
import QRCode from 'qrcode'

export default {
	name:'Pay',
	computed:{
		name() {
			return sessionStorage.getItem('logined');
		},
		money :{
			get: function() {
				if (this.amount==null) return null;
				if ([10, 50, 100, 500, 1000, 5000].indexOf(this.amount)>=0) return this.amount;
				return 'custom';
			},
			set: function(v) {
				if (v==null) return;
				if (typeof v!='number') return;
				this.amount=v;
			}
		}
	},
	methods:{
		linkClass(idx) {
			if (this.tabIndex === idx) {
				return ['bg-primary', 'text-white']
			} else {
				return ['bg-white', 'text-secondary', 'border']
			}
		},
		async pay(e) {
			e.preventDefault();
			
			var method=this.method, money=this.amount, name=this.name;
			
			var srv_url=Object.assign({}, serverpath);
			srv_url.query=null;
			srv_url.search='';
			srv_url.pathname=url.resolve(srv_url.pathname, 'createOrder');

			this.longop=true;
			try {
				var {data}=await post(url.format(srv_url), {name, money, method});
				if (data.err) throw data.err;
				await QRCode.toCanvas(document.getElementById('qrcode'), data.to);
				this.longop=false;
				this.qr_method={
					'ALIPAY':'支付宝',
					'WECHATPAY':'微信',
				}[data.pay_type];
				this.$bvModal.show('qr');
			} catch(e) {
				this.longop=false;
				alert(e);
			}
		}
	},
	data() {
		return {
			tabIndex:0,
			amount:500,
			method:'WECHATPAY',
			longop:false,
			qr_method:null
		}
	}
}
</script>
<style>
	p {
		font-size: 18px;
		color:#666666;
	}
	.pt-10px {
		padding-top: 10px !important;
	}
	.methodselector {
		min-width: 140px;
		font-size: 16px;
	}
</style>