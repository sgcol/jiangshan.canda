<template>
	<div id="app">
		<router-view></router-view>
	</div>
</template>

<script>
export default {
	name: 'App',
	components: {
	},
}
</script>

<style>
html { 
	background: url("./assets/back.jpg") no-repeat center center fixed; 
	-webkit-background-size: cover;
	-moz-background-size: cover;
	-o-background-size: cover;
	background-size: cover;
}
#app {
	font-family: Avenir, Helvetica, Arial, sans-serif;
	-webkit-font-smoothing: antialiased;
	-moz-osx-font-smoothing: grayscale;
	text-align: center;
	margin: 0px;
	padding:0px;
	width:100%;
	height:100%;
	position:absolute;
	left:0px;
	top:0px;
}
</style>
