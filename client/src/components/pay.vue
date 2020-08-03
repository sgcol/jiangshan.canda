<template>
	<div class="w-100 h-100 text-left">
		<div class="h-100 p-3 m-3 bg-white">
			<b-form class="h-100 border p-5">
				<p>充值到《仙道传说》 角色名{{name}}</p>
				<b-tabs class="mt-5" content-class="mt-4" v-model="tabIndex">
					<b-tab title="扫码支付" :title-link-class="linkClass(0)" active>
						<b-form-radio-group
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
					</b-tab>
					<b-tab title="网银支付" :title-link-class="linkClass(1)"><p>test 2</p></b-tab>
				</b-tabs>
			</b-form>
		</div>
	</div>
</template>

<script>
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
		}
	},
	data() {
		return {
			tabIndex:0,
			amount:null,
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
</style>