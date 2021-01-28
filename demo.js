const puppeteer = require('puppeteer');

(async function run() {
  const browser = await puppeteer.launch({
    // 是否运行浏览器无头模式(boolean)
    headless: false,
    // 是否自动打开调试工具(boolean)，若此值为true，headless自动置为fasle
    devtools: false,
    // 关闭chrome受控制提示
    ignoreDefaultArgs: ['--enable-automation'],
    defaultViewport: null,
    args: ['--start-maximized'],
    //如果是访问https页面 此属性会忽略https错误
    ignoreHTTPSErrors: true, 
    // 设置超时时间(number)，若此值为0，则禁用超时
    timeout: 10000,
  });


  page = await browser.newPage();
  await page.goto('https://item.jd.com/100012043978.html', { waitUntil: "networkidle0" });
 
  // 1.打开 bilibili 登录页面
  await page.goto('https://passport.bilibili.com/login');
  await page.waitFor(3000);

  // 3.输入账号密码
  await page.type('input#login-username','你的账号', { delay: 50 });
  await page.type('input#login-passwd','你的密码', { delay: 50 });

  // 4.点登陆按钮
  await page.click('.btn.btn-login');

  // 保证滑动弹窗加载出
  await page.waitFor(3000);

  // 获取像素差较大的最左侧横坐标 
  const diffX = await page.evaluate(() => {
    const fullbg = document.querySelector('.geetest_canvas_fullbg'); // 完成图片
    const bg = document.querySelector('.geetest_canvas_bg'); // 带缺口图片
    const diffPixel = 40; // 像素差

    // 滑动解锁的背景图片的尺寸为 260*160
    // 拼图右侧离背景最左侧距离为 46px，故从 47px 的位置开始检测
    for(let i = 47; i < 260; i++) {
      for(let j = 1; j < 160; j++) {
        const fullbgData = fullbg.getContext("2d").getImageData(i, j, 1, 1).data;
        const bgData = bg.getContext("2d").getImageData(i, j, 1, 1).data;
        const red = Math.abs(fullbgData[0] - bgData[0]);
        const green = Math.abs(fullbgData[1] - bgData[1]);
        const blue = Math.abs(fullbgData[2] - bgData[2]);
        // 若找到两张图片在同样像素点中，red、green、blue 有一个值相差较大，即可视为缺口图片中缺口的最左侧横坐标位置
        if(red > diffPixel || green > diffPixel || blue > diffPixel) {
          return i;
        }
      }
    }
  });

  // 获取滑动按钮在页面中的坐标
  const dragButton = await page.$('.geetest_slider_button');
  const box = await dragButton.boundingBox();
  // 获取滑动按钮中心点位置
  const x = box.x + (box.width / 2);
  const y = box.y + (box.height / 2);

  // 鼠标滑动至滑动按钮中心点
  await page.mouse.move(x, y);
  // 按下鼠标
  await page.mouse.down();
  // 慢慢滑动至缺口位置,因起始位置有约 7px 的偏差，故终点值为 x + diffX - 7 
  for (let i = x; i < x + diffX - 7; i = i + 5) {
    // 滑动鼠标
    await page.mouse.move(i, y);
  }
  // 假装有个停顿，看起来更像是人为操作
  await page.waitFor(200);
  // 放开鼠标
  await page.mouse.up();

  //await page.waitFor(5000);
  //await browser.close();
})();