/**
 * E2E测试配置
 * 使用微信官方自动化测试工具 @dcloudio/uni-automator
 */

module.exports = {
  // 测试配置
  test: {
    // 测试超时时间
    timeout: 30000,
    
    // 重试次数
    retries: 2,
    
    // 并发数
    workers: 1
  },
  
  // 小程序配置
  mp: {
    // 微信小程序
    weixin: {
      // 开发者工具路径
      cliPath: '/Applications/wechatwebdevtools.app/Contents/MacOS/cli',
      
      // 项目路径
      projectPath: process.cwd() + '/dist/build/mp-weixin',
      
      // 开发者信息
      account: '',
      
      // 测试端口
      port: 9420,
      
      // 是否开启不校验合法域名
      noVerify: true
    }
  },
  
  // 测试报告
  reporter: {
    // HTML报告
    html: {
      outputDir: './test-report',
      filename: 'e2e-report.html'
    },
    
    // JSON报告
    json: {
      outputDir: './test-report',
      filename: 'e2e-report.json'
    }
  }
}
