项目UI切图经常改动(新增,删除,修改...),手动管理不太方便,用脚本处理这种重复性工作

使用方法:
1. 安装nodejs LTS版本 [官网](https://nodejs.org/en/)
2. 下载(1)图片名生成.js (2)图片脚本.sh 至项目
3. 修改.sh配置

参数说明:
1. 脚本js路径
2. 切图所在文件夹路径(最好让UI设计师也用git管理,放在一个文件夹内)
3. 生成图片名常量.h路径
4. 项目Assets.xcassets文件夹路径
5. 是否删除项目之前所有的图片(0,1)

例如
> node ./图片名生成.js ../../images/切图/image/iOS1 ../../图片拉取demo/图片拉取demo/ImageName.h ../../图片拉取demo/图片拉取demo/Assets.xcassets 1

项目里imageName使用 图片名常量.h内的常量,如果最新切图删除了则会报错,这样就不用去找哪些图已经没有了.

![](http://ocszpmu6u.bkt.clouddn.com/jxAgYyk8rE.gif)
