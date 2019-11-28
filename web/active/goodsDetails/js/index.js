// 获取请求参数和用户信息
var params = {
        userId: '', //用户id 为空则为没登录
        memberType: "", //用户等级
        goodsName: "", // 商品名称
        goodsId: "", // 商品ID
        platformType: "", // 判断什么平台 0||1 == 天猫或者淘宝 2 == 拼多多
        ticket: "", // 用户的token
        relationId: '', //淘宝授权ID
        isInstallPdd: false, //是否安装拼多多
        isInstallTm: false, // 是否安装天猫
        isInstallTb: false, //是否安装淘宝
        optId: "",
        id: '',
        optsId: '', //分类ID
        plateId: "" // 判断商品详情的类型 3:倒计时 2：365 默认:自营
    }
    //  分享需要的部分参数
var orderParams = {
    goodsThumbnailUrl: "",
    specs: "",
    goodsName: "",
    goodsNum: '',
    minGroupPrice: "",
    plateGoodsId: "",
    name: 'goodsDetilsBuy'
}

var http = 'https://xiaolvlan.walongkeji.com',
    pageData = "",
    clipboard = new ClipboardJS('.clipboard'),
    nativeUrl = ''
    // 获取url参数
function GetQueryString(name) {
    var reg = new RegExp("(^|&)" + name + "=([^&]*)(&|$)");
    var r = window.location.search.substr(1).match(reg); //search,查询？后面的参数，并匹配正则
    if (r != null) return decodeURIComponent(r[2]);
    return null;
}

function getUrlData(params) {
    Object.keys(params).forEach((_e, _i) => {
        params[_e] = _e == 'goodsName' ? decodeURI(GetQueryString(_e)) : GetQueryString(_e)
    })
}

getUrlData(params)



// 从ios/android端获取用户信息
var u = navigator.userAgent;
var isAndroid = u.indexOf('Android') > -1 || u.indexOf('Adr') > -1; //android终端 
var isiOS = !!u.match(/\(i[^;]+;( U;)? CPU.+Mac OS X/); //ios终端


// function sendKey(i) {
//     var r = { "ticket": "VFhwRlBRPT07S3lvcjszMTMx", "relationId": "2120709335", "memberType": 3, "userId": "45" }
//     if (r != "{}") {
//         params.userId = r.userId
//         params.ticket = r.ticket
//         params.relationId = r.relationId
//     } else {

//     }
// }
// sendKey()

// 判断用户是否登录
function islogin(i) {
    let b = (i == '' || i == null) ? false : true
    return b
}
// 填充页面数据
$(document).ready(function() {
    $('.swipebox').width($('body').width())
        // 公告滚动
    setInterval(() => {
        $('.checkStatusBox>div:nth-child(1) ul').animate({
            marginTop: '-0.88rem'
        }, 800, function() {
            $(this).css({ marginTop: "0px" });
            var li = $(".checkStatusBox>div:nth-child(1) ul").children().first().clone()
            $(".checkStatusBox>div:nth-child(1) ul li:last").after(li);
            $(".checkStatusBox>div:nth-child(1) ul li:first").remove();

        })

    }, 3000)



    let _url = ''
        // 拼接请求url
    let u_data = ['id', 'memberType']
    Object.keys(params).forEach((e, i) => {
        u_data.forEach((_e, _i) => {
            if (e == _e && params[e] != null && params[e] != '') {
                _url += "&" + e + "=" + params[e]
            }
        })
    })

    let
        url = params.plateId == '3' ? http + "/plateGoods/getPlateGoodsByTime" : http + "/plateGoods/getPlateGoods",
        _data = {
            id: params.id,
            // optsId: params.optsId,
            memberType: params.memberType
        };
    //获取页面数据
    $.ajax({
        type: "get",
        url: url,
        data: _data,
        beforeSend: function(request) {
            request.setRequestHeader('userId', params.userId);
            request.setRequestHeader('ticket', params.ticket);
        },
        success: function(response) {
            if (response.code == 0) {
                pageData = response.data
                fullPageData(response.data)
                console.log(response.data.id);

                orderParams.goodsThumbnailUrl = response.data.sOGoods.goodsThumbnailUrl || ''
                orderParams.specs = response.data.specs == null ? '' : response.data.specs.split(",")[0]
                orderParams.goodsName = response.data.sOGoods.goodsName
                orderParams.goodsNum = response.data.stock == 0 ? 0 : 1
                orderParams.minGroupPrice = orderParams.id == 2 ? 365 : response.data.sOGoods.minGroupPrice
                orderParams.plateGoodsId = response.data.id
                console.log(orderParams.plateGoodsId);




            } else {
                alert(response.message)
            }
        },
    });

})

function fullPageData(opt) {
    // 渲染页面相同的部分
    fullBasePage(opt)
        //根据plateId渲染相应组件
    fullPageWithplateId(opt)
        // 设置折线的位置
    let h = ($('._gG_sG ._price p:nth-child(2)').height() - $('._line').height()) / 2
    console.log(h);

    $('._line').css('top', h + 'px')

}

function fullBasePage(opt) {
    // 填充轮播图和图文介绍
    var _html = '',
        __html = ""
    opt.sOGoods.goodsGalleryUrls.forEach(element => {
        _html += `
    <div class="swiper-slide">
        <img src=` + element + ` alt="" class='lazy' >
    </div>
    `

    });
    opt.sOGoods.introduceImgs.forEach(element => {
        __html += `<img src=` + element + ` alt="" class='lazy'>`
    });

    _html !== '' ? $('.swiper-wrapper').html(_html) : ''
    __html !== '' ? $('.pic_introduce').html(__html) : ''
    var mySwiper = new Swiper('.swiper-container', {
        // direction: 'vertical', // 垂直切换选项
        loop: true, // 循环模式选项

        // 如果需要分页器
        pagination: {
            el: '.swiper-pagination',
        },

        // // 如果需要前进后退按钮
        // navigation: {
        //     nextEl: '.swiper-button-next',
        //     prevEl: '.swiper-button-prev',
        // },

        // // 如果需要滚动条
        // scrollbar: {
        //     el: '.swiper-scrollbar',
        // },
    })

    // 填写商品名称
    $('.goodsname').html(opt.sOGoods.goodsName)
        // 商品详细说明
    $('._details').html(opt.sOGoods.goodsDesc)
        // 库存
    $('.stock').html(`库存：` + opt.stock + `件`)
    $('.sku_top>img:nth-child(1)').attr('src', opt.sOGoods.goodsThumbnailUrl)
    $(".skucount").text(opt.stock == 0 ? 0 : 1)
        // 规格
    if (opt.specs) {
        let _arr = (opt.specs).split(","),
            html = "";
        _arr.forEach((e, i) => {
            html += `<li class='` + (opt.stock == 0 ? '' : (i == 0 ? "specs_active_class" : '')) + `' onclick='changeSpecs(` + e + `,` + opt.stock + `)' data-id=` + e + `>` + e + `</li>`
        });
        $('.specs').html(html)
        $('.default_specs').html(_arr[0])
    }
}
// 规格切换
function changeSpecs(e, stock) {
    if (stock !== 0) {
        $('.specs li').removeClass('specs_active_class')
        orderParams.specs = e
        $('.specs li').each(function() {
            if ($(this).attr('data-id') == e) {
                $(this).addClass('specs_active_class')
            }
        })

    }




}

function fullPageWithplateId(opt) {
    switch (opt.plateId) {
        case 3:
            // 抢好货
            $('.checkStatusBox .grabGoods').show().siblings('.selfGoods').hide()
            $('.content > .title > img').attr('src', './img/rob_goods_icon_proprietary.png')
            $('._365').hide()
            fullPageWithggsg(opt)
            $('._gG_sG').show()
                // 查看购买状态
            switch (opt.buyStatus) {
                case 1:
                    $('.countdown>p:nth-child(1)').html('倒计时')
                    formatSecond(opt.buyTime)
                    break;
                case 3:
                    $('.countdown>p:nth-child(1)').html('已结束')
                    formatSecond()
                    break;
                default:
                    $('.countdown>p:nth-child(1)').html('距开始')
                    formatSecond(opt.buyTime)
                    break;
            }

            break;
        case 2:
            //365
            $('._365').show().siblings('._gG_sG').hide()

            $('.checkStatusBox .selfGoods').hide()
            $('.bgbar').hide()
            $('.content > .title > img').attr('src', './img/rob_goods_icon_proprietary.png')
            fullPageWith365(opt)
            break;
        default:
            // 默认是自营商品
            $('.checkStatusBox .selfGoods').show().siblings('.grabGoods').hide()
            $('.content > .title > img').attr('src', './img/rob_goods_icon_proprietary.png')
            $('._365').hide()
            $('._gG_sG').show()
            fullPageWithggsg(opt)
            break;
    }

}

function fullPageWithggsg(opt) {
    // 折扣价
    $('.minGroupPrice').text(((Number(opt.sOGoods.minGroupPrice)) / 100).toFixed(2) || 0)
        // 原价
    $('.minNormalPrice').text(((Number(opt.sOGoods.minNormalPrice)) / 100).toFixed(2) || 0)
        // 折扣
    $('.discount').text(((Number(opt.sOGoods.minGroupPrice) / Number(opt.sOGoods.minNormalPrice) * 10).toFixed(1) || 0))
        // 售出数量
    $('._sell>span').text(opt.validNum || 0)

    // 根据会员等级展示 memberType= ( 1 || 2 ) 显示去升级
    if (params.memberType == 1) {
        $('.setup>p').text('升级VIP最高可得补贴￥' + (opt.sOGoods.memberPromotion / 100) + '元')
        $('.setup>div').show()
    } else {
        $('.setup>p').text('购买该商品约补贴￥' + (opt.sOGoods.predictPromotion / 100) + '元')
        $('.setup>div').hide()
    }
}

function fullPageWith365(_params) {
    $('.soldQuantity').text(_params.validNum)

}

//  加入购物车
function addShopCar() {
    if (GetQueryString('isStayNativeApp')) {
        window.location.href = window.location.origin + '/shareapp/shareapp.html'
    } else {
        if (islogin(params.userId) == true) {

            $.ajax({
                type: "post",
                url: http + "/shopCart/auth/addOrUpdate?goodsNum=" + orderParams.goodsNum + "&plateGoodsId=" + orderParams.plateGoodsId + "&specs=" + orderParams.specs,
                beforeSend: function(request) {
                    request.setRequestHeader('userId', params.userId);
                    request.setRequestHeader('ticket', params.ticket);
                },
                success: function(res) {
                    if (res.code == 0) {
                        showModel('加入购物车成功!')
                    } else {
                        console.log(res.message);

                        showModel(res.message)
                    }
                }
            });

        } else {
            tologin()
        }


    }




}

function changeRouter(opt) {
    let u = ''
    switch (opt) {
        case 'toPrivilegeCenter':
            u = '/active/VIP/privilege/privilegeCenter/index.html?userId=' + params.userId + '&ticket=' + params.ticket + '&memberType=' + params.memberType
            break;
        case 'setupVip':
            u = '/active/VIP/privilege/privilegeCenter/index.html?userId=' + params.userId + '&ticket=' + params.ticket + '&memberType=' + params.memberType
            break;
        case 'setup':
            u = '/active/MissionCenter/index.html?userId=' + params.userId + '&ticket=' + params.ticket + '&memberType=' + params.memberType
            break;
        case 'toVipGift':
            u = '/active/VIP/gift/index.html?userId=' + params.userId + '&ticket=' + params.ticket + '&memberType=' + params.memberType
            break;
        case 'addtime':
            u = '/active/MissionCenter/index.html?userId=' + params.userId + '&ticket=' + params.ticket + '&memberType=' + params.memberType
            break;
        case 'toNewbornZone':
            u = '/active/MissionCenter/NewbornZone.html?userId=' + params.userId + '&ticket=' + params.ticket + '&memberType=' + params.memberType
            break;
        case 'toGrabgoodgoods':
            u = '/active/Grabgoodgoods/index.html?userId=' + params.userId + '&ticket=' + params.ticket + '&memberType=' + params.memberType
            break;
        case 'customerService':
            u = '/active/Customerservice/index.html?userId=' + params.userId + '&ticket=' + params.ticket + '&memberType=' + params.memberType
            break;

    }
    let data = {
        name: 'changeRouter',
        url: window.location.origin + u
    }


    if (/android/i.test(navigator.userAgent)) {
        try {
            window.android.changeRouter(JSON.stringify(data));
        } catch (e) {
            console.log('与android链接中断')
        }
    } else if (/ios|iphone|ipod|pad/i.test(navigator.userAgent)) {
        try {
            window.webkit.messageHandlers.changeRouter.postMessage(data);
        } catch (e) {
            console.log('与ios链接中断')
        }
    }
}






// 页面事件处理
// 跳到原生登录页面
function tologin() {

    if (/android/i.test(navigator.userAgent)) {
        try {
            window.android.tologin();
        } catch (e) {
            console.log('与android链接中断')
        }
    } else if (/ios|iphone|ipod|pad/i.test(navigator.userAgent)) {
        try {
            window.webkit.messageHandlers.tologin.postMessage({
                'name': "tologin",
            });
        } catch (e) {
            console.log('与ios链接中断')
        }
    }
}



// 暴露给原生事件

// 升级会员
function UpRank() {
    if (islogin(params.userId) == true) {
        if (/android/i.test(navigator.userAgent)) {
            try {
                window.android.UpRank();
            } catch (e) {
                console.log('与android链接中断')
            }
        } else if (/ios|iphone|ipod|pad/i.test(navigator.userAgent)) {
            try {
                window.webkit.messageHandlers.UpRank.postMessage({
                    'name': 'UpRank'
                });
            } catch (e) {
                console.log('与ios链接中断')
            }
        }
    } else {
        tologin()
    }

}
// 购买
function goodsDetilsBuy() {
    if (GetQueryString('isStayNativeApp')) {
        window.location.href = window.location.origin + '/shareapp/shareapp.html'
    } else {
        if (islogin(params.userId) == true) {
            if (orderParams.goodsNum == 0) {
                showModel('购买数量不能为0，请重新选择！')
            } else {
                if (/android/i.test(navigator.userAgent)) {
                    try {
                        let _data = JSON.stringify(orderParams)
                        window.android.goodsDetilsBuy(_data);
                    } catch (e) {
                        console.log('与android链接中断')

                    }
                } else if (/ios|iphone|ipod|pad/i.test(navigator.userAgent)) {
                    try {
                        let iosdata = {
                            name: 'goodsDetilsBuy',
                            iosdata: pageData,
                            basedata: orderParams
                        }
                        window.webkit.messageHandlers.goodsDetilsBuy.postMessage(iosdata);
                    } catch (e) {
                        console.log('与ios链接中断')
                    }
                }

            }

        } else {
            tologin()
        }

    }



}
// 分享
function shareGoodsDtails() {
    if (GetQueryString('isStayNativeApp')) {
        window.location.origin + '/shareapp/shareapp.html'

    } else {
        let data = {
            'url': window.location.href + "&isStayNativeApp=false",
            'name': "shareGoodsDtails",
            "goodsName": orderParams.goodsName,
            'goodsThumbnailUrl': orderParams.goodsThumbnailUrl

        }

        if (islogin(params.userId) == true) {
            if (/android/i.test(navigator.userAgent)) {
                try {
                    let _data = JSON.stringify(data)
                    window.android.shareGoodsDtails(_data);
                } catch (e) {
                    console.log('与android链接中断')

                }
            } else if (/ios|iphone|ipod|pad/i.test(navigator.userAgent)) {
                try {
                    window.webkit.messageHandlers.shareGoodsDtails.postMessage(data);
                } catch (e) {
                    console.log('与ios链接中断')
                }
            }
        } else {
            tologin()
        }

    }



}


// >>>>>>>>>>>>>>>>>>>>>>提示框<<<<<<<<<<<<<<<<<<<<<<<
function showModel(ctx) {
    $('.ctx').text(ctx)
    var top = ($(window).height() - $('.tipbox').height()) / 2;
    var left = ($(window).width() - $('.tipbox').width()) / 2;
    var scrollTop = $(document).scrollTop();
    var scrollLeft = $(document).scrollLeft();
    $('.tipbox').css({ position: 'absolute', 'top': top + scrollTop, left: left + scrollLeft }).show();
    setTimeout(() => {
        $('.tipbox').hide()
    }, 1500);
}

// type 1=服务说明 2=sku
var h

function openMaskModel(type) {
    $('body').css('top', ('-' + $(window).scrollTop() + 'px'));
    $('body').css('position', 'fixed');
    if ($('body').height() < $(window).height()) {
        $('.maskModel').css('height', ($(window).height() + 'px'))
    } else {
        $('.maskModel').css('height', ($('body').height() + 'px'))
    }

    $('.maskModel').fadeIn()
    h = Math.abs($('body').offset().top) + $(window).height()
    $('.mask_contentbox').css('top', (h)).animate({ top: h - $('.mask_contentbox').height() + 'px' }, 600);
    if (type == 1) {
        $('.sku').hide()
        $('.serveInstructions').show()
    } else if (type == 2) {
        $('.sku').show()
        $('.serveInstructions').hide()
    }





}

function closeMaskModel() {
    let top = Math.abs(Number($('body').css('top').slice(0, -2)))

    console.log(top);

    $('.mask_contentbox').animate({ top: h + 'px' }, 450);
    setTimeout(() => {
        $('.maskModel').fadeOut()
        setTimeout(() => {
            $('body').css({ 'position': 'relative', 'top': '' })
            $(document).scrollTop(top)
        }, 350)
    }, 450)
}
// sku数量加减
function skuCount(type) {
    console.log(pageData);

    let count = Number($('.skucount').text())
    if (type == 'reduce') {
        if (count > 0) {
            count--
        } else {
            return false
        }
    } else {
        if (count < pageData.stock) {
            if (params.plateId == 2 && count == 1) {
                return false
            } else {
                count++
            }

        } else {
            return false
        }
    }
    $('.skucount').text(count)
    orderParams.goodsNum = count
    console.log(orderParams);

}


// >>>>>>>>>>>>>>>>>>>>>>>>过滤器<<<<<<<<<<<<<<<<<<<<<<<<<<
// 时间格式化
function formatDate(i) {
    let _i = i.split('/').join('.')
    return _i
}
// 评分格式化
function formatScore(i) {
    let _i = (i / 100) > 4.7 ? (i / 100) : 4.7
    return _i
}
// 评价生成
function formatStar(i) {
    let _i = (i / 100) > 4.7 ? '高' : (i / 100) == 4.7 ? "中" : '低'
    return _i
}
// 字体颜色
// 背景颜色
function formatColor(i) {
    let _i = (i / 100) < 4.7 ? 'rgba(51,51,51,1)' : 'color: rgba(255, 95, 0, 1);'
    return _i
}
// 背景颜色
function formatBg(i) {
    let _i = (i / 100) < 4.7 ? 'lowstatus' : 'highstatus'
    return _i
}
//秒转化为时分秒
function formatSecond(result) {
    // 倒计时
    var _s = result || 0,
        timer = setInterval(() => {
            if (_s >= 0) {
                var h = Math.floor(_s / 3600) < 10 ? '0' + Math.floor(_s / 3600) : Math.floor(_s / 3600);
                var m = Math.floor((_s / 60 % 60)) < 10 ? '0' + Math.floor((_s / 60 % 60)) : Math.floor((_s / 60 % 60));
                var s = Math.floor((_s % 60)) < 10 ? '0' + Math.floor((_s % 60)) : Math.floor((_s % 60));
                $('.grabGoods').find('.h').html(h).siblings('.m').html(m).siblings('.s').html(s)
                _s--
            } else {
                clearInterval(timer)
            }
        }, 1000)
}
// 剪切复制回调函数

clipboard.on('success', function(e) {
    showModel('复制成功!')
    e.clearSelection();
});

clipboard.on('error', function(e) {
    showModel('复制失败!')
});