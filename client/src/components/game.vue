<template>
	<div id="game"></div>
</template>

<script>
// eslint-disable-next-line
import router from '../router'
const {embedSWF}= require('../../swfobject/swfobject/src/swfobject');

function  ELFHash(str)
{
		str+='';
		var  hash  =   0 ;
		var  x     =   0 ,i=0;
		while  (i<str.length)
		{
				hash  =  (hash  <<   4 )  +  str.charCodeAt(i++);
				hash=parseFloat(hash>>>0);
				if  ((x  =  parseFloat((hash&0xF0000000)>>>0))  !=   0 )
				{
						hash  ^=  (x  >>>   24 );
						hash  &=   ~ x;
						hash=hash>>>0;
				}
		}
		return  (hash  &   0x7FFFFFFF );
}

export default {
	name: 'Game',
	components: {
	},
	data() {
		return {
		}
	},
	methods:{
		launchGame(name) {
			var flashvars={
				param:encodeURIComponent({
					account:name,
					accid:ELFHash(name),
					fcm:1,
					pay_url:'javascript:router.push("/pay");'
				})
			},
			params = {
				allowScriptAccess: "always",
				wmode:'direct'
			};
			embedSWF('./PreLoader.swf', 'game', '100%', '100%', '9.0.0', 'swf/playerProductInstall.swf', flashvars, params, {})
		}
	},
	created() {
		if (this.$route.params.name) this.launchGame(this.$route.params.name);
		else router.push('/login');
	}
}
</script>

<style scoped>
.game {
	width:100%;
	height:100%;
}
</style>
