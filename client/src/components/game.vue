<template>
	<div style="width:100%">
		<b-navbar toggleable="md" type="dark" variant="dark py-1">
			<b-navbar-brand><span class="text-primary">凡劫</span> 1服</b-navbar-brand>
				<b-navbar-toggle target="nav-collapse"></b-navbar-toggle>
				<b-collapse id="nav-collapse" is-nav>
					<b-navbar-nav>
						<b-nav-item to='/pay' target="_blank"><img src="../assets/chongzhi.png" style="height:22px"></b-nav-item>
					</b-navbar-nav>
					<b-navbar-nav class="ml-auto">
						<b-nav-item href="#" disabled>{{name}}</b-nav-item>
						<b-nav-item to="/logout" right>退出</b-nav-item>
					</b-navbar-nav>
				</b-collapse>
		</b-navbar>
		<div id="game">
      <p class="mt-5">您的Flash配置不正确</p>
      <b-carousel
      :interval="2500"
      controls
      indicators
      img-width="689"
      img-height="459"
      style="width:689px; height:459px; margin:auto">
      <b-carousel-slide><template v-slot:img><img src="../assets/slide1.jpg"></template></b-carousel-slide>
      <b-carousel-slide><template v-slot:img><img src="../assets/slide2.jpg"></template></b-carousel-slide>
      <b-carousel-slide><template v-slot:img><img src="../assets/slide3.jpg"></template></b-carousel-slide>
      </b-carousel>
    </div>
	</div>
</template>

<script>
// eslint-disable-next-line
import url from 'url'
import router from "../router";
import md5 from "md5";
import {get} from "vue-xhr"
import {serverpath} from '../etc'

const { embedSWF } = require("../../swfobject/swfobject/src/swfobject");

function ELFHash(str) {
  str += "";
  var hash = 0;
  var x = 0,
    i = 0;
  while (i < str.length) {
    hash = (hash << 4) + str.charCodeAt(i++);
    hash = parseFloat(hash >>> 0);
    if ((x = parseFloat((hash & 0xf0000000) >>> 0)) != 0) {
      hash ^= x >>> 24;
      hash &= ~x;
      hash = hash >>> 0;
    }
  }
  return hash & 0x7fffffff;
}

window.gopay = ()=>{
  let routeData = router.resolve({ path: "/pay" });
  window.open(routeData.href, "_blank");
};

function flashHeight() {
  var nodes=document.getElementById('app').childNodes;
  var idealHeight=window.innerHeight;
  if (nodes[0]) idealHeight-=nodes[0].offsetHeight;
  if (nodes[1]) nodes[1].setAttribute('height', idealHeight+'px');
  return idealHeight+'px'
}

window.onresize=flashHeight;

export default {
  name: "Game",
  components: {},
	computed:{
		name() {
			return this.$route.params.name
		}
	},
  data() {
    return {};
  },
  methods: {
    async launchGame(name) {
			var srv_url=Object.assign({}, serverpath);
			srv_url.query=null;
			srv_url.search='';
			srv_url.pathname=url.resolve(srv_url.pathname, 'gs');
			var {data}=await get(url.format(srv_url));

      var param = "",
        tarstr = "";

      param += "nettype=" + 1;
      tarstr += 1 + "_";

      param += "&accid=" + ELFHash(name);
      tarstr += ELFHash(name) + "_";

      param += "&account=" + name;
      tarstr += name + "_";

      param += "&fcm=" + 1;
      tarstr += 1 + "_";

      param += "&game=" + 1;
      tarstr += 1 + "_";

      param += "&zone=" + 1;
      tarstr += 1 + "_";

      param += "&ip=" + data.ip//"192.168.1.240";
      tarstr += data.ip+'_'//"192.168.1.240" + "_";

      param += "&port=" + data.port//"7755";
      tarstr += data.port+'_' //"7755" + "_";

      param += "&pay_url=" + "javascript:gopay()";
      // param += "&pay_url=" + "http://47.105.144.3:7777/#/pay";

      param +=
        "&vipType=0&vipLevel=0&vipParam0=0&vipParam1=0&vipParam2=0&vipParam3=0";
      tarstr += "0_0_0_0_0_0_";

      param += "&sign=" + md5(tarstr + "Q@ABc#d27poss");

      param += "&ad=" + 0;

      console.log("dddd", name);

      param += "&home_url=";
      param += "&bbs_url=";

      var flashvars = {},
        attributes = {},
        params = {}; // eslint-disable-line no-unused-vars
      (flashvars = {
        param: encodeURIComponent(param)
      }),
        (params = {
          base: ".",
          wmode: "direct"
        }),
        (attributes = { wmode: "direct" });

      console.log(flashvars);
      embedSWF(
        `./Preloader.swf?` + Math.random(),
        document.getElementById(`game`),
        `100%`,
        flashHeight(),
        `11.8.0`,
        `./playerProductInstall.swf`,
        flashvars,
        params,
        attributes
      );
    }
  },
  mounted() {
    setTimeout(() => {
      if (this.$route.params.name) this.launchGame(this.$route.params.name);
      else router.push("/login");
    }, 1000);
  },
  beforeDestroy() {
    // delete flash here
  }
};
</script>


<style scoped>
.game {
  width: 100%;
  text-align:center;
}
</style>


