module.exports={
	outputDir: "../dist",
	chainWebpack: config => {
		config
		.plugin('html')
		.tap(args => {
			args[0].title= '凡劫'
			return args
		})
	}
}