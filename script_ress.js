/**
 * Top trending searches on Weibo
 *
 * @version 1.0.3
 * @author Honye
 */

/**
 * @param {number} [height] The screen height measured in pixels
 */
const phoneSize = (height) => {
  const phones = {
    /** 12 Pro Max */
    2778: {
      small: 510,
      medium: 1092,
      large: 1146,
      left: 96,
      right: 678,
      top: 246,
      middle: 882,
      bottom: 1518
    },
    /** 12 and 12 Pro */
    2532: {
      small: 474,
      medium: 1014,
      large: 1062,
      left: 78,
      right: 618,
      top: 231,
      middle: 819,
      bottom: 1407
    },
    /** 11 Pro Max, XS Max */
    2688: {
      small: 507,
      medium: 1080,
      large: 1137,
      left: 81,
      right: 654,
      top: 228,
      middle: 858,
      bottom: 1488
    },
    /** 11, XR */
    1792: {
      small: 338,
      medium: 720,
      large: 758,
      left: 55,
      right: 437,
      top: 159,
      middle: 579,
      bottom: 999
    },
    /** 11 Pro, XS, X, 12 mini */
    2436: {
      small: 465,
      medium: 987,
      large: 1035,
      x: {
        left: 69,
        right: 591,
        top: 213,
        middle: 783,
        bottom: 1353
      },
      mini: {
        left: 69,
        right: 591,
        top: 231,
        middle: 801,
        bottom: 1371
      }
    },
    /** Plus phones */
    2208: {
      small: 471,
      medium: 1044,
      large: 1071,
      left: 99,
      right: 672,
      top: 114,
      middle: 696,
      bottom: 1278
    },
    /** SE2 and 6/6S/7/8 */
    1334: {
      small: 296,
      medium: 642,
      large: 648,
      left: 54,
      right: 400,
      top: 60,
      middle: 412,
      bottom: 764
    },
    /** SE1 */
    1136: {
      small: 282,
      medium: 584,
      large: 622,
      left: 30,
      right: 332,
      top: 59,
      middle: 399,
      bottom: 399
    },
    /** 11 and XR in Display Zoom mode */
    1624: {
      small: 310,
      medium: 658,
      large: 690,
      left: 46,
      right: 394,
      top: 142,
      middle: 522,
      bottom: 902
    },
    /** Plus in Display Zoom mode */
    2001: {
      small: 444,
      medium: 963,
      large: 972,
      left: 81,
      right: 600,
      top: 90,
      middle: 618,
      bottom: 1146
    }
  };
  height = height || Device.screenResolution().height;
  const scale = Device.screenScale();

  if (config.runsInWidget) {
    const phone = phones[height];
    if (phone) {
      return phone
    }

    const pc = {
      small: 164 * scale,
      medium: 344 * scale,
      large: 354 * scale
    };
    return pc
  }

  // in app screen fixed 375x812 pt
  return {
    small: 155 * scale,
    medium: 329 * scale,
    large: 345 * scale
  }
};

const fontSize = 14;
const gap = 8;
const logoSize = 30;
const paddingVertical = 10;
const themes = {
  light: {
    background: new Color('#ffffff'),
    color: Color.black()
  },
  dark: {
    background: new Color('#242426', 1),
    color: Color.white()
  }
};


/**
 * @param {object} options
 * @param {string} [options.title]
 * @param {string} [options.message]
 * @param {Array<{ title: string; [key: string]: any }>} options.options
 * @param {string} [options.cancelText = 'Cancel']
 */
const presentSheet = async (options) => {
  options = {
    showCancel: true,
    cancelText: '关闭',
    ...options
  };
  const alert = new Alert();
  if (options.title) {
    alert.title = options.title;
  }
  if (options.message) {
    alert.message = options.message;
  }
  if (!options.options) {
    throw new Error('参数的“options”属性不能为空')
  }
  for (const option of options.options) {
    alert.addAction(option.title);
  }
  if (options.showCancel) {
    alert.addCancelAction(options.cancelText);
  }
  const value = await alert.presentSheet();
  return { value, option: options.options[value] }
};

const screen = Device.screenResolution();
const scale = Device.screenScale();
const phone = phoneSize(screen.height);
let widgetFamily = 'medium';
const conf = {
  client: 'h5',
  theme: 'system'
};
const height = (widgetFamily === 'medium' ? phone.small : phone[widgetFamily]) / scale;
conf.count = Math.floor((height - paddingVertical * 2 + gap) / (fontSize + gap));

const dateFormat = new DateFormatter();
dateFormat.dateFormat = 'HH:mm';
const timeString = dateFormat.string(new Date());

const main = async (url) => {
  const request = new Request(url);
  const data = await request.loadJSON();
  const widget = await createWidget(data);
  return widget
};

let stackBottom;
let widgetBottom;
const createWidget = async (data) => {
  const widget = new ListWidget();
  widget.backgroundColor = conf.theme === 'system'
    ? Color.dynamic(themes.light.background, themes.dark.background)
    : themes[conf.theme].background;
  widget.url = data.feed.link;
  const paddingY = paddingVertical - (gap / 2);
  widget.setPadding(paddingY, 12, paddingY, 14);
  const max = conf.count;
  const logoLines = Math.ceil((logoSize + gap) / (fontSize + gap));
  for (let i = 0; i < max; ++i) {
    const item = data.items[i];
    if (i === 0) {
      const stack = widget.addStack();
      await addItem(stack, item,i);
      stack.addSpacer();
      const textTime = stack.addText(`更新于 ${timeString}`);
      textTime.font = Font.systemFont(10);
      textTime.textColor = new Color('#666666');
    } else if (i < max - logoLines) {
      await addItem(widget, item,i);
    } else {
      if (!widgetBottom) {
        stackBottom = widget.addStack();
        stackBottom.bottomAlignContent();
        widgetBottom = stackBottom.addStack();
        widgetBottom.layoutVertically();
        addItem(widgetBottom, item,i);
      } else {
        await addItem(widgetBottom, item,i);
      }
      widgetBottom.length = (widgetBottom.length || 0) + 1;
      if (widgetBottom.length === logoLines) {
        stackBottom.addSpacer();
        // 添加右下角logo
        try{
            const imageLogo = stackBottom.addImage(await getImage(data.feed.link+'/favicon.ico'));
            imageLogo.imageSize = new Size(logoSize, logoSize);
        }catch{
            const bottomText = stackBottom.addText(data.feed.title);
            bottomText.font = Font.systemFont(10);
            bottomText.textColor = new Color('#666666');
        }
        
      }
    }
  }
  return widget
};

const addItem = async (widget, item,i) => {
// console.log(widget)
const stack = widget.addStack();
  stack.url = item.link;
  stack.centerAlignContent();
  stack.size = new Size(-1, fontSize + gap);
  const stackIndex = stack.addStack();
  stackIndex.size = new Size(fontSize * 1.4, -1);
  const index =i;
  const textIndex = stackIndex.addText(String(index+1));
  textIndex.rightAlignText();
  textIndex.textColor = index > 3 ? new Color('#f5c94c', 1) : new Color('#fe4f67', 1);
  textIndex.font = Font.boldSystemFont(fontSize);
  stack.addSpacer(4);
  const textTitle = stack.addText(item.title);
  textTitle.font = Font.systemFont(fontSize);
  textTitle.textColor = conf.theme === 'system'
    ? Color.dynamic(themes.light.color, themes.dark.color)
    : themes[conf.theme].color;
  textTitle.lineLimit = 1;
  textTitle.shadowColor = new Color('#000000', 0.2);
  textTitle.shadowOffset = new Point(1, 1);
  textTitle.shadowRadius = 0.5;
  if (item.icon) {
    stack.addSpacer(4);
    const imageIcon = stack.addImage(await getImage(item.icon));
    imageIcon.imageSize = new Size(12, 12);
  }
  stack.addSpacer();
};

const getImage = async (url) => {
  const request = new Request(url);
  const image = await request.loadImage();
  return image
};

/** 更新脚本 */
const update = async () => {
  let fm = FileManager.local();
  if (fm.isFileStoredIniCloud(module.filename)) {
    fm = FileManager.iCloud();
  }
  const url = 'https://raw.githubusercontent.com/huangzi959/javascript/main/script_ress.js';
  const request = new Request(url);
  try {
    const code = await request.loadString();
    fm.writeString(module.filename, code);
    const alert = new Alert();
    alert.message = '代码已更新。如果脚本处于打开状态，请将其关闭以使更改生效。';
    alert.addAction('好的');
    alert.presentAlert();
  } catch (e) {
    console.error(e);
  }
};

if (config.runsInApp) {
  const res = await presentSheet({
    message: '预览小部件或更新脚本。更新将覆盖整个脚本。',
    options: [
      { title: '预览', value: 'Preview' },
      { title: '更新', value: 'Update' }
    ]
  });
  const value = res.option?.value;
  switch (value) {
    case 'Preview':
      break
    case 'Update':
      update();
      break
  }
}

const url ='https://api.rss2json.com/v1/api.json?rss_url='+args.widgetParameter
const widget = await main(url);
if (config.runsInApp) {
  widget.presentMedium();
}
Script.setWidget(widget);
Script.complete();
