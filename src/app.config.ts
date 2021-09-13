export default {
  pages: ['pages/index/index', 'pages/user/index'],
  window: {
    backgroundTextStyle: 'light',
    navigationBarBackgroundColor: '#fff',
    navigationBarTitleText: 'WeChat',
    navigationBarTextStyle: 'black',
  },
  tabBar: {
    backgroundColor: '#FFFFFF',
    color: '#707070',
    borderStyle: 'white',
    selectedColor: '#FF2E2E',
    list: [
      {
        pagePath: 'pages/index/index',
        text: '首页',
      },
      {
        pagePath: 'pages/user/index',
        text: '我的',
        // iconPath: 'static/noactive/my.png',
        // selectedIconPath: 'static/default/myActive.png',
      },
    ],
  },
}
